import { Text } from '@/components'
import { Task } from '@/types/task'
import { $card, $row, $taskIcon, $taskTitle } from '@/styles/taskStyles'
import { useAppTheme } from '@/utils/useAppTheme'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Pressable, View } from 'react-native'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'

type TaskItemProps = {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const { themed } = useAppTheme()

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={themed($card)}
    >
      <Pressable onPress={() => onToggle(task.id, !task.completed)}>
        <View style={themed($row)}>
          {task.completed ? (
            <MaterialIcons
              name="check"
              style={themed($taskIcon(task.completed))}
            />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              style={themed($taskIcon(task.completed))}
            />
          )}
          <Text style={themed($taskTitle(task.completed))}>{task.title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}
