// src/ws/client.ts
let socket: WebSocket | null = null
let reconnectTimeout: number | null = null

let manuallyClosed = false
let retryCount = 0
const maxRetries = 10

let currentUrl: string | null = null
let messageQueue: string[] = []

type MessageHandler = (data: any) => void
type StatusHandler = (status: "connecting" | "connected" | "disconnected") => void

export function connectWebSocket(
  url: string,
  onMessage: MessageHandler,
  onStatusChange?: StatusHandler
) {
  // if we are already connected to the same URL, do nothing
  if (currentUrl === url && socket && socket.readyState === WebSocket.OPEN) {
    return
  }

  // ensure previous socket is closed cleanly
  disconnectWebSocket(false) // do not set manuallyClosed here

  currentUrl = url
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
      // flush queued messages
      while (messageQueue.length > 0) {
        const m = messageQueue.shift()!
        socket?.send(m)
      }
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (e) {
        console.error("Invalid WS message", e)
      }
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
      reconnectTimeout = window.setTimeout(connect, delay)
    }
  }

  connect()
}

export function sendMessage(payload: any) {
  const message = JSON.stringify(payload)
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message)
  } else {
    // queue the message while reconnecting
    messageQueue.push(message)
  }
}

/**
 * disconnectWebSocket(manual = true)
 * - manual = true (default): marks manuallyClosed and stops reconnecting
 * - manual = false: just closes socket (used when switching URL)
 */
export function disconnectWebSocket(manual = true) {
  if (manual) manuallyClosed = true

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  if (socket) {
    try {
      socket.close()
    } catch {}
    socket = null
  }

  currentUrl = null
  // if manual disconnect, clear queued user messages (or keep if you want)
  if (manual) messageQueue = []
}