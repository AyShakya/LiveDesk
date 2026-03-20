export function getDiff(oldText: string, newText: string) {
  let start = 0

  // find first difference
  while (
    start < oldText.length &&
    start < newText.length &&
    oldText[start] === newText[start]
  ) {
    start++
  }

  let endOld = oldText.length - 1
  let endNew = newText.length - 1

  // find last difference
  while (
    endOld >= start &&
    endNew >= start &&
    oldText[endOld] === newText[endNew]
  ) {
    endOld--
    endNew--
  }

  return {
    start,
    end: endOld + 1,
    text: newText.slice(start, endNew + 1),
  }
}