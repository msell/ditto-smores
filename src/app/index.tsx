import React, { useState, useEffect, useRef } from 'react'
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  View,
  Alert,
} from 'react-native'
import {
  Ditto,
  IdentityOnlinePlayground,
  TransportConfig,
} from '@dittolive/ditto'
import { Button, Screen, TextField, Text } from '@/components'
import { useAppTheme } from '@/utils/useAppTheme'
import * as Crypto from 'expo-crypto'
import { Task } from '@/types/task'
import { TaskItem } from '@/components/TaskItem'
import {
  $addButton,
  $container,
  $contentContainer,
  $input,
  $inputRow,
  $taskList,
  $textField,
  $topContainer,
  $welcomeHeading,
} from '@/styles/taskStyles'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function WelcomeScreen() {
  const { themed } = useAppTheme()
  const [task, setTask] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeouts, setTimeouts] = useState<Record<string, NodeJS.Timeout>>({})
  const ditto = useRef<Ditto | null>(null)
  const textFieldRef = useRef<any>(null)

  async function requestPermissions() {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]

    const granted = await PermissionsAndroid.requestMultiple(permissions)
    return Object.values(granted).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    )
  }

  async function syncTasks() {
    try {
      const identity: IdentityOnlinePlayground = {
        type: 'onlinePlayground',
        appID: '6828f469-a22a-4c6c-82e5-1e9ecd089b19',
        token: '6cb4df61-625e-4018-80a0-2de77ab0d19a',
      }

      ditto.current = new Ditto(identity)
      const transportsConfig = new TransportConfig()
      transportsConfig.peerToPeer.bluetoothLE.isEnabled = true
      transportsConfig.peerToPeer.lan.isEnabled = true
      transportsConfig.peerToPeer.lan.isMdnsEnabled = true

      if (Platform.OS === 'ios') {
        transportsConfig.peerToPeer.awdl.isEnabled = true
      }
      ditto.current.setTransportConfig(transportsConfig)

      ditto.current.startSync()

      ditto.current.sync.registerSubscription('SELECT * FROM tasks')
      // Subscribe to task updates
      ditto.current.store.registerObserver(
        'SELECT * FROM tasks',
        (response) => {
          const fetchedTasks: Task[] = response.items.map((doc) => ({
            id: doc.value._id,
            title: doc.value.title as string,
            completed: doc.value.completed as boolean,
            isArchived: doc.value.isArchived as boolean,
          }))

          if (__DEV__) {
            console.tron.log(response)
          }
          console.log('fetchedTasks', JSON.stringify(fetchedTasks, null, 2))
          setTasks(fetchedTasks)
        }
      )
    } catch (error) {
      console.error('Error syncing tasks:', error)
    }
  }

  useEffect(() => {
    const setupDitto = async () => {
      const granted =
        Platform.OS === 'android' ? await requestPermissions() : true
      if (granted) {
        syncTasks()
      } else {
        Alert.alert(
          'Permission Denied',
          'You need to grant all permissions to use this app.'
        )
      }
    }
    setupDitto()
  }, [])

  async function handleAddTask() {
    if (ditto.current === null || task.trim().length === 0) {
      Alert.alert('Error', `TASK ${task}`)
      return
    }

    const newId = Crypto.randomUUID()
    const newTask: Task = {
      id: newId,
      title: task,
      completed: false,
      isArchived: false,
    }
    await ditto.current.store.execute(
      `INSERT INTO tasks DOCUMENTS (:document) ON ID CONFLICT DO UPDATE`,
      { document: newTask }
    )
    setTask('')
    textFieldRef.current?.focus()
  }

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    if (ditto.current === null) return

    await ditto.current.store.execute(
      `UPDATE tasks SET completed = ${isCompleted} WHERE _id = '${taskId}'`
    )

    if (isCompleted) {
      const timeoutId = setTimeout(async () => {
        /* To remove documents with active subscriptions,
          you must first cancel the relevant subscription before calling the EVICT method.
      */
        await ditto.current?.store.execute(
          `UPDATE tasks SET isArchived = true WHERE _id = '${taskId}'`
        )
      }, 5000)

      setTimeouts((prevTimeouts) => ({
        ...prevTimeouts,
        [taskId]: timeoutId,
      }))
    } else {
      if (timeouts[taskId]) {
        clearTimeout(timeouts[taskId])
        setTimeouts((prevTimeouts) => {
          const { [taskId]: _, ...rest } = prevTimeouts
          return rest
        })
      }
    }
  }

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem task={item} onToggle={toggleTaskCompletion} />
  )

  return (
    <Screen safeAreaEdges={['top']} contentContainerStyle={themed($container)}>
      <View style={themed($topContainer)}>
        <Text style={themed($welcomeHeading)} preset="heading">
          Check List
        </Text>
        <View style={themed($contentContainer)}>
          <View style={themed($inputRow)}>
            <TextField
              ref={textFieldRef}
              autoFocus
              placeholder="Add a task"
              value={task}
              onChangeText={setTask}
              containerStyle={themed($input)}
              style={themed($textField)}
              onSubmitEditing={handleAddTask}
            />
            <Button
              preset="filled"
              onPress={handleAddTask}
              style={themed($addButton)}
            >
              Add
            </Button>
          </View>
          <FlatList
            data={tasks.filter((task) => !task.isArchived)}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={themed($taskList)}
          />
        </View>
      </View>
    </Screen>
  )
}
