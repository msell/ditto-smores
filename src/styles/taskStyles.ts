import { ThemedStyle } from '@/theme'
import { TextStyle, ViewStyle } from 'react-native'

export const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  width: '100%',
})

export const $inputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  width: '100%',
  justifyContent: 'space-between',
})

export const $input: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
})

export const $textField: ThemedStyle<TextStyle> = () => ({
  height: 40,
})

export const $addButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})

export const $taskTitle = (completed: boolean): ThemedStyle<TextStyle> => ({ colors }) => ({
  textDecorationLine: completed ? 'line-through' : 'none',
  color: colors.palette.neutral800,
})

export const $taskIcon = (completed: boolean): ThemedStyle<TextStyle> => ({ colors }) => ({
  color: completed ? colors.palette.primary500 : colors.palette.neutral400,
  fontSize: 24,
})

export const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: 'center',
  paddingTop: spacing.xl,
  width: '100%',
})

export const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

export const $taskList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  width: '100%',
  paddingTop: spacing.lg,
  gap: spacing.xs,
})

export const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
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

export const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginVertical: spacing.xs,
  boxShadow: `0 2px 4px ${colors.palette.neutral400}`,
})