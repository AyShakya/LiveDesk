export type PresenceUser = {
  id: string
  email: string
}

export type PresenceUpdateMessage = {
  type: "presence:update"
  payload: {
    users: PresenceUser[]
  }
}

export type DocumentUpdateMessage = {
  type: "document:update"
  payload: {
    content: string
  }
}

export type WSMessage =
  | DocumentUpdateMessage
  | PresenceUpdateMessage