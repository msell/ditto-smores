import { Button, Screen, Text, TextField } from '@/components'
import { useAppTheme } from '@/utils/useAppTheme'
import { observer } from 'mobx-react-lite'
import { useState, useRef } from 'react'
import { View, FlatList } from 'react-native'
import { useMutations, usePendingCursorOperation } from '@dittolive/react-ditto'
import {
  DittoProvider,
  useOnlinePlaygroundIdentity,
} from '@dittolive/react-ditto'
import { Ditto } from '@dittolive/ditto'
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

function WebApp() {
  const { create } = useOnlinePlaygroundIdentity()

  return (
    <DittoProvider
      setup={async () => {
        const ditto = new Ditto(
          create({
            appID: process.env.EXPO_PUBLIC_DITTO_APP_ID || '',
            token: process.env.EXPO_PUBLIC_DITTO_PLAYGROUND_TOKEN || '',
          }),
          'testing'
        )
        await ditto.disableSyncWithV3()
        ditto.startSync()
        return ditto
      }}
    >
      {({ loading, error }) => {
        if (loading) return <Text>Loading</Text>
        if (error) return <Text>{`web: ${error.message}`}</Text>
        return <WelcomeScreen />
      }}
    </DittoProvider>
  )
}

const WelcomeScreen = observer(function WelcomeScreen() {
  const { themed } = useAppTheme()
  const [newItem, setNewItem] = useState('')
  const { documents } = usePendingCursorOperation({
    collection: 'tasks',
    args: {
      query: {
        isArchived: false,
      },
    },
  })

  console.log('documents', documents)
  const { upsert, updateByID } = useMutations({
    collection: 'tasks',
  })

  const [timeouts, setTimeouts] = useState<Record<string, NodeJS.Timeout>>({})
  const textFieldRef = useRef<any>(null)

  const handleAddTask = () => {
    const newTask: Task = {
      id: Crypto.randomUUID(),
      title: newItem,
      completed: false,
      isArchived: false,
    }
    upsert({
      value: newTask,
    })
    setNewItem('')
    textFieldRef.current?.focus()
  }

  return (
    <Screen safeAreaEdges={['top']} contentContainerStyle={themed($container)}>
      <View style={themed($topContainer)}>
        <Text
          testID="welcome-heading"
          style={themed($welcomeHeading)}
          tx="welcomeScreen:checkList"
          preset="heading"
        />
        <View style={themed($contentContainer)}>
          <View style={themed($inputRow)}>
            <TextField
              ref={textFieldRef}
              autoFocus
              placeholder="Add a task"
              value={newItem}
              onChangeText={setNewItem}
              containerStyle={themed($input)}
              style={themed($textField)}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Enter') {
                  handleAddTask()
                }
              }}
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
            data={documents.filter((doc) => !doc.value.isArchived)}
            renderItem={({ item }) => (
              <TaskItem
                task={item.value as Task}
                onToggle={(taskId, isCompleted) => {
                  updateByID({
                    _id: item.id,
                    updateClosure: (mutableDoc) => {
                      mutableDoc.at('completed').set(isCompleted)
                    },
                  })

                  if (isCompleted) {
                    const timeoutId = setTimeout(() => {
                      updateByID({
                        _id: item.id,
                        updateClosure: (mutableDoc) => {
                          mutableDoc.at('isArchived').set(true)
                        },
                      })
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
                }}
              />
            )}
            keyExtractor={(item) => item.value.id}
            style={themed($taskList)}
          />
        </View>
      </View>
    </Screen>
  )
})

export default WebApp
