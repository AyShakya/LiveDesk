export function applyOperations(content, operations) {
  return operations.reduce((nextContent, operation) => {
    switch (operation.type) {
      case "insert":
        return (
          nextContent.slice(0, operation.index) +
          operation.text +
          nextContent.slice(operation.index)
        );
      case "delete":
        return (
          nextContent.slice(0, operation.index) +
          nextContent.slice(operation.index + operation.length)
        );
      case "replace":
        return (
          nextContent.slice(0, operation.index) +
          operation.text +
          nextContent.slice(operation.index + operation.length)
        );
      default:
        return nextContent;
    }
  }, content);
}
