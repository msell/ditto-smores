import { Button, Screen, Text, TextField } from '@/components'
import { ThemedStyle } from '@/theme'
import { useAppTheme } from '@/utils/useAppTheme'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Pressable, TextStyle, View, ViewStyle } from 'react-native'
import { useMutations, usePendingCursorOperation } from '@dittolive/react-ditto'

type Task = {
  id: string
  title: string
  completed: boolean
}

export default observer(function WelcomeScreen() {
  const { theme, themed } = useAppTheme()
  const [newItem, setNewItem] = useState('')
  const { documents } = usePendingCursorOperation({
    collection: 'tasks',
  })

  const { upsert, updateByID, removeByID } = useMutations({
    collection: 'tasks',
  })

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
          <View style={themed($row)}>
            <TextField
              placeholder="Add a task"
              value={newItem}
              onChangeText={setNewItem}
              style={themed($input)}
            />
            <Button
              preset="filled"
              onPress={() => {
                upsert({
                  value: {
                    id: crypto.randomUUID(),
                    title: newItem,
                    completed: false,
                  },
                })
                setNewItem('')
              }}
              style={themed($addButton)}
            >
              Add
            </Button>
          </View>
          <View style={themed($taskList)}>
            {documents.map((doc) => (
              <Pressable
                key={doc.id.toString()}
                onPress={() => {
                  updateByID({
                    _id: doc.id,
                    updateClosure: (mutableDoc) => {
                      mutableDoc.at('completed').set(!doc.value.completed)
                    },
                  })
                }}
              >
                <View style={themed($row)}>
                  {doc.value.completed ? (
                    <MaterialIcons
                      name="radio-button-checked"
                      style={themed($taskIcon(doc.value.completed))}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-unchecked"
                      style={themed($taskIcon(doc.value.completed))}
                    />
                  )}

                  <Text
                    style={$taskTitle(doc.value.completed)}
                    preset="subheading"
                  >
                    {doc.value.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  )
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
})

const $taskTitle = (completed: boolean): TextStyle => ({
  textDecorationLine: completed ? 'line-through' : 'none',
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
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: '57%',
  alignItems: 'center',
  paddingTop: spacing.xl,
  width: '100%',
})

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $taskList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: '100%',
  paddingTop: spacing.lg,
  gap: spacing.xs,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: '100%',
  maxWidth: 600,
  gap: spacing.lg,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 10,
  padding: spacing.lg,
  boxShadow: `0 0 10px ${colors.palette.neutral400}`,
})

const $input: TextStyle = {
  height: 40,
  flex: 1,
}

const $addButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 48,
  paddingHorizontal: spacing.lg,
})
