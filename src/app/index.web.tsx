import { Button, Screen, Text, TextField } from '@/components'
import { ThemedStyle } from '@/theme'
import { useAppTheme } from '@/utils/useAppTheme'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { observer } from 'mobx-react-lite'
import { useState, useRef } from 'react'
import { Pressable, TextStyle, View, ViewStyle, FlatList } from 'react-native'
import { useMutations, usePendingCursorOperation } from '@dittolive/react-ditto'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import {
  DittoProvider,
  useOnlinePlaygroundIdentity,
} from '@dittolive/react-ditto'
import { Ditto } from '@dittolive/ditto'
import * as Crypto from 'expo-crypto'

type Task = {
  id: string
  title: string
  completed: boolean
  isArchived: boolean
}

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
              <Animated.View
                key={item.value.id}
                entering={FadeInUp}
                exiting={FadeOutDown}
                style={themed($card)}
              >
                <Pressable
                  onPress={() => {
                    const isCompleted = !item.value.completed

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
                        [item.value.id]: timeoutId,
                      }))
                    } else {
                      if (timeouts[item.value.id]) {
                        clearTimeout(timeouts[item.value.id])
                        setTimeouts((prevTimeouts) => {
                          const { [item.value.id]: _, ...rest } = prevTimeouts
                          return rest
                        })
                      }
                    }
                  }}
                >
                  <View style={themed($row)}>
                    {item.value.completed ? (
                      <MaterialIcons
                        name="check"
                        style={themed($taskIcon(item.value.completed))}
                      />
                    ) : (
                      <MaterialIcons
                        name="check-box-outline-blank"
                        style={themed($taskIcon(item.value.completed))}
                      />
                    )}

                    <Text
                      style={themed($taskTitle(item.value.completed))}
                      preset="subheading"
                      numberOfLines={3}
                    >
                      {item.value.title}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            )}
            keyExtractor={(item) => item.value.id}
            style={themed($taskList)}
          />
        </View>
      </View>
    </Screen>
  )
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  width: '100%',
})

const $inputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  width: '100%',
  justifyContent: 'space-between',
})

const $input: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
})

const $textField: ThemedStyle<TextStyle> = () => ({
  height: 40,
})

const $addButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

const $taskTitle =
  (completed: boolean): ThemedStyle<TextStyle> =>
  ({ colors }) => ({
    textDecorationLine: completed ? 'line-through' : 'none',
    color: colors.palette.neutral800,
  })

const $taskIcon =
  (completed: boolean): ThemedStyle<TextStyle> =>
  ({ colors }) => ({
    color: completed ? colors.palette.primary500 : colors.palette.neutral400,
    fontSize: 24,
  })

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: 'center',
  paddingTop: spacing.xl,
  width: '100%',
})

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $taskList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  width: '100%',
  paddingTop: spacing.lg,
  gap: spacing.xs,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  width: '100%',
  maxWidth: 600,
  gap: spacing.lg,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.accent200,
  borderRadius: 10,
  padding: spacing.lg,
  boxShadow: `0 0 10px ${colors.palette.neutral400}`,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginVertical: spacing.xs,
  boxShadow: `0 2px 4px ${colors.palette.neutral400}`,
})

export default WebApp
