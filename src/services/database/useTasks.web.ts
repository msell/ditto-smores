// src/hooks/useTasks.ts
import { useMutations, usePendingCursorOperation } from '@dittolive/react-ditto'
import { useState } from 'react'

type Task = {
  id: string
  title: string
  completed: boolean
}

export function useTasks() {
  const { documents } = usePendingCursorOperation({
    collection: 'tasks',
  })

  const { upsert, updateByID, removeByID } = useMutations({
    collection: 'tasks',
  })

  const [timeouts, setTimeouts] = useState<Record<string, NodeJS.Timeout>>({})

  const addTask = (title: string) => {
    upsert({
      value: {
        id: crypto.randomUUID(),
        title,
        completed: false,
      },
    })
  }

  const toggleTaskCompletion = (taskId: string, completed: boolean) => {
    updateByID({
      _id: taskId,
      updateClosure: (mutableDoc) => {
        mutableDoc.at('completed').set(completed)
      },
    })

    if (completed) {
      const timeoutId = setTimeout(() => {
        removeByID({ _id: taskId as any})
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

  return {
    tasks: documents,
    addTask,
    toggleTaskCompletion,
  }
}