let socket: WebSocket | null = null
let reconnectTimeout: number | null = null

let manuallyClosed = false
let retryCount = 0
const maxRetries = 10

type MessageHandler = (data: any) => void
type StatusHandler = (status: "connecting" | "connected" | "disconnected") => void

export function connectWebSocket(
  url: string,
  onMessage: MessageHandler,
  onStatusChange?: StatusHandler
) {
  manuallyClosed = false

  function connect() {
    if (retryCount >= maxRetries) {
      console.error("Max WebSocket retries reached")
      return
    }

    onStatusChange?.("connecting")

    socket = new WebSocket(url)

    socket.onopen = () => {
      retryCount = 0
      onStatusChange?.("connected")
      console.log("WebSocket connected")
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    socket.onerror = () => {
      socket?.close()
    }

    socket.onclose = () => {
      if (manuallyClosed) {
        onStatusChange?.("disconnected")
        return
      }

      onStatusChange?.("disconnected")

      retryCount++
      const delay = Math.min(1000 * 2 ** retryCount, 10000)

      console.log(`Reconnecting in ${delay / 1000}s...`)

      reconnectTimeout = window.setTimeout(connect, delay)
    }
  }

  connect()
}

export function sendMessage(payload: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload))
  }
}

export function disconnectWebSocket() {
  manuallyClosed = true

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
  }

  if (socket) {
    socket.close()
    socket = null
  }
}