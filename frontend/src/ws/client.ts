// src/ws/client.ts
let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;

let manuallyClosed = false;
let retryCount = 0;
const maxRetries = 12;

let currentUrl: string | null = null;
let messageQueue: string[] = [];

type MessageHandler = (data: any) => void;
type StatusHandler = (status: "connecting" | "connected" | "disconnected") => void;

let pingInterval: number | null = null;

export function connectWebSocket(
  url: string,
  onMessage: MessageHandler,
  onStatusChange?: StatusHandler
) {
  // If already connected to same url, do nothing
  if (currentUrl === url && socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  // If switching urls, close existing socket but don't mark manual close
  disconnectWebSocket(false);
  messageQueue = [];

  currentUrl = url;
  manuallyClosed = false;

  function connect() {
    if (retryCount >= maxRetries) {
      console.error("Max WebSocket retries reached");
      onStatusChange?.("disconnected");
      return;
    }

    onStatusChange?.("connecting");

    try {
      socket = new WebSocket(url);
    } catch (err) {
      // immediate failure; schedule reconnect
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      retryCount = 0;
      onStatusChange?.("connected");
      console.log("WebSocket connected to", url);

      // flush queued messages
      while (messageQueue.length > 0 && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(messageQueue.shift()!);
      }

      // start ping/pong to keep connection alive (server should reply if needed)
      if (pingInterval) clearInterval(pingInterval);
      pingInterval = window.setInterval(() => {
        try {
          if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "PING" }));
        } catch {}
      }, 20000); // every 20s
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // ignore PONG if you implement PONG from server
        if (data?.type === "PONG") return;
        onMessage(data);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    socket.onerror = (err) => {
      console.warn("WebSocket error", err);
      // socket will likely close; rely on onclose to schedule reconnect
    };

    socket.onclose = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      // If we closed intentionally, stop trying
      if (manuallyClosed) {
        onStatusChange?.("disconnected");
        return;
      }

      onStatusChange?.("disconnected");

      // schedule reconnect with exp backoff (fast initial retries)
      retryCount++;
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    const delay = Math.min(300 * 2 ** Math.min(retryCount, 6), 5000); // 300ms -> 600ms -> ... cap 5s
    console.log(`WS reconnect in ${delay}ms (attempt ${retryCount})`);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = window.setTimeout(connect, delay);
  }

  connect();
}

export function sendMessage(payload: any) {
  const message = JSON.stringify(payload);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    // queue message until socket opens
    messageQueue.push(message);
  }
}

export function disconnectWebSocket(manual = true) {
  if (manual) manuallyClosed = true;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (socket) {
    try {
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;
      socket.close();
    } catch {}
    socket = null;
  }

  currentUrl = null;
  if (manual) messageQueue = [];
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}