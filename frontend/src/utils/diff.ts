export type DiffOperation =
  | {
      type: "insert"
      index: number
      text: string
    }
  | {
      type: "delete"
      index: number
      length: number
    }
  | {
      type: "replace"
      index: number
      length: number
      text: string
    }

export function getDiffOperations(oldText: string, newText: string): DiffOperation[] {
  let start = 0

  while (
    start < oldText.length &&
    start < newText.length &&
    oldText[start] === newText[start]
  ) {
    start++
  }

  let endOld = oldText.length 
  let endNew = newText.length

  while (
    endOld > start &&
    endNew > start &&
    oldText[endOld-1] === newText[endNew-1]
  ) {
    endOld--
    endNew--
  }
    const removedLength = endOld - start
    const insertedText = newText.slice(start, endNew)

    if (removedLength === 0 && insertedText.length === 0) {
      return []
    }

    if (removedLength === 0) {
      return [
      {
        type: "insert",
        index: start,
        text: insertedText,
      },
    ]
    }

    if (insertedText.length === 0) {
    return [
      {
        type: "delete",
        index: start,
        length: removedLength,
      },
    ]
  }
  return [
    {
      type: "replace",
      index: start,
      length: removedLength,
      text: insertedText,
    },
  ]
}

export function applyDiffOperations(
  content: string,
  operations: DiffOperation[],
): string {
  return operations.reduce((nextContent, operation) => {
    switch (operation.type) {
      case "insert":
        return (
          nextContent.slice(0, operation.index) +
          operation.text +
          nextContent.slice(operation.index)
        )
      case "delete":
        return (
          nextContent.slice(0, operation.index) +
          nextContent.slice(operation.index + operation.length)
        )
      case "replace":
        return (
          nextContent.slice(0, operation.index) +
          operation.text +
          nextContent.slice(operation.index + operation.length)
        )
    }
  }, content)
}