import type { DiffOperation } from "../utils/diff"
export type PresenceUser = {
  id: string
  email: string
}

export type PresenceUpdateMessage = {
  type: "PRESENCE_UPDATE"
  users: PresenceUser[]
}

export type DocumentUpdateMessage = {
  type: "DOC_UPDATED"
  docId: string
  operations: DiffOperation[]
  updatedBy: string
}

export type DocumentSyncMessage = {
  type: "DOC_SYNC"
  docId: string
  content: string
}

export type WSMessage =
  | DocumentUpdateMessage
  | DocumentSyncMessage
  | PresenceUpdateMessage