let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;

let manuallyClosed = false;
let retryCount = 0;
const maxRetries = 14;

let currentUrl: string | null = null;
let messageQueue: string[] = [];
const MAX_QUEUED_MESSAGES = 200;

let activeMessageHandler: MessageHandler | null = null;
let activeStatusHandler: StatusHandler | null = null;

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type ConnectionStatusMeta = {
  status: ConnectionStatus;
  retryAttempt: number;
  nextRetryInMs?: number;
  reason?: "closed" | "error" | "offline" | "max-retries";
};

type MessageHandler = (data: any) => void;
type StatusHandler = (meta: ConnectionStatusMeta) => void;

let pingInterval: number | null = null;

function emitStatus(meta: ConnectionStatusMeta) {
  activeStatusHandler?.(meta);
}

function getReconnectDelay(attempt: number) {
  const base = Math.min(500 * 2 ** Math.min(attempt, 6), 12000);
  const jitter = Math.floor(Math.random() * 300);
  return base + jitter;
}

function scheduleReconnect(connectFn: () => void, reason: ConnectionStatusMeta["reason"] = "closed") {
  if (manuallyClosed || retryCount >= maxRetries) {
    emitStatus({
      status: "disconnected",
      retryAttempt: retryCount,
      reason: "max-retries",
    });
    return;
  }

  const delay = getReconnectDelay(retryCount);
  emitStatus({
    status: "disconnected",
    retryAttempt: retryCount,
    nextRetryInMs: delay,
    reason,
  });

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  reconnectTimeout = window.setTimeout(connectFn, delay);
}

function cleanupTimers() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

function flushQueue() {
  while (messageQueue.length > 0 && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(messageQueue.shift()!);
  }
}

export function connectWebSocket(
  url: string,
  onMessage: MessageHandler,
  onStatusChange?: StatusHandler,
) {
  if (currentUrl === url && socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  disconnectWebSocket(false);
  messageQueue = [];

  currentUrl = url;
  manuallyClosed = false;
  activeMessageHandler = onMessage;
  activeStatusHandler = onStatusChange ?? null;

  const connect = () => {
    if (manuallyClosed) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      retryCount++;
      scheduleReconnect(connect, "offline");
      return;
    }

    emitStatus({ status: "connecting", retryAttempt: retryCount });

    try {
      socket = new WebSocket(url);
    } catch {
      retryCount++;
      scheduleReconnect(connect, "error");
      return;
    }

    socket.onopen = () => {
      retryCount = 0;
      emitStatus({ status: "connected", retryAttempt: retryCount });
      flushQueue();

      if (pingInterval) {
        clearInterval(pingInterval);
      }

      pingInterval = window.setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "PING" }));
        }
      }, 20000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "PONG") return;
        activeMessageHandler?.(data);
      } catch (error) {
        console.error("Invalid WS message", error);
      }
    };

    socket.onerror = () => {
      emitStatus({
        status: "disconnected",
        retryAttempt: retryCount,
        reason: "error",
      });
    };

    socket.onclose = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      if (manuallyClosed) {
        emitStatus({ status: "disconnected", retryAttempt: retryCount, reason: "closed" });
        return;
      }

      retryCount++;
      scheduleReconnect(connect, "closed");
    };
  };

  const handleNetworkOnline = () => {
    if (!manuallyClosed && (!socket || socket.readyState === WebSocket.CLOSED)) {
      retryCount = 0;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      connect();
    }
  };

  window.addEventListener("online", handleNetworkOnline);

  connect();

  return () => {
    window.removeEventListener("online", handleNetworkOnline);
  };
}

export function sendMessage(payload: any) {
  const message = JSON.stringify(payload);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  messageQueue.push(message);

  if (messageQueue.length > MAX_QUEUED_MESSAGES) {
    messageQueue = messageQueue.slice(messageQueue.length - MAX_QUEUED_MESSAGES);
  }
}

export function disconnectWebSocket(manual = true) {
  if (manual) {
    manuallyClosed = true;
  }

  cleanupTimers();

  if (socket) {
    try {
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;
      socket.close();
    } catch {
      // no-op
    }
    socket = null;
  }

  currentUrl = null;
  if (manual) {
    messageQueue = [];
  }
}
