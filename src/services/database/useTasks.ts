// src/hooks/useTasks.ts
import { useEffect, useRef, useState } from 'react'
import {
  Ditto,
  IdentityOnlinePlayground,
  TransportConfig,
} from '@dittolive/ditto';
import { PermissionsAndroid, Platform } from 'react-native';

type Task = {
  id: string
  title: string
  completed: boolean
}

async function requestPermissions() {
  const permissions = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ];

  const granted = await PermissionsAndroid.requestMultiple(permissions);
  return Object.values(granted).every(
    result => result === PermissionsAndroid.RESULTS.GRANTED,
  );
}

export function useTasks() {
  const ditto = useRef<Ditto | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  async function syncTasks() {
    try {
      const identity: IdentityOnlinePlayground = {
        type: 'onlinePlayground',
        appID: '6828f469-a22a-4c6c-82e5-1e9ecd089b19',
        token: '6cb4df61-625e-4018-80a0-2de77ab0d19a',
      };

      ditto.current = new Ditto(identity);
      const transportsConfig = new TransportConfig();
      transportsConfig.peerToPeer.bluetoothLE.isEnabled = true;
      transportsConfig.peerToPeer.lan.isEnabled = true;
      transportsConfig.peerToPeer.lan.isMdnsEnabled = true;

      if (Platform.OS === 'ios') {
        transportsConfig.peerToPeer.awdl.isEnabled = true;
      }
      ditto.current.setTransportConfig(transportsConfig);

      ditto.current.startSync();

      ditto.current.sync.registerSubscription('SELECT * FROM tasks');
      // Subscribe to task updates
      ditto.current.store.registerObserver('SELECT * FROM tasks', response => {
        const fetchedTasks: Task[] = response.items.map(doc => ({
          id: doc.value._id,
          title: doc.value.title as string,
          completed: doc.value.completed as boolean,
        }));

        if(__DEV__) {
          console.tron.log('fetchedTasks', fetchedTasks);
        }
        setTasks(fetchedTasks);
      });
    } catch (error) {
      console.error('Error syncing tasks:', error);
    }
  }

  useEffect(() => {
    const setupDitto = async () => {
      const granted =
        Platform.OS === 'android' ? await requestPermissions() : true;
      if (granted) {
        syncTasks();
      } else {
        // TODO: Update the hook api to return an error and handle it in the component
        // Alert.alert(
        //   'Permission Denied',
        //   'You need to grant all permissions to use this app.',
        // );
      }
    };
    setupDitto();
  }, []);

  const addTask = async(title: string) => {
    if (!ditto.current) {
      if(__DEV__) {
        console.tron.logImportant('ditto.current is null');
      }
      return;
    }

    const task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    }
    await ditto.current.store.execute(
      `INSERT INTO tasks DOCUMENTS (${task})`,
    )
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
    if (!ditto.current) {
      if(__DEV__) {
        console.tron.logImportant('ditto.current is null');
      }
      return
    }
    const result = await ditto.current.store.execute(`SELECT * FROM tasks WHERE _id = ${taskId}`)
    if (result.items.length === 0) {
      return
    }

    const task = result.items[0].value as Task
    await ditto.current.store.execute(`UPDATE tasks SET completed = ${!task.completed} WHERE _id = ${taskId}`)
  }

  return {
    tasks,
    addTask,
    toggleTaskCompletion,
  }
}