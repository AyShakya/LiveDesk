import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { getDocument } from "../api/documents"
import type { Document } from "../types/document"
import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket
} from "../ws/client"
import type { PresenceUser } from "../types/ws"

export default function DocumentEditor() {

  const { id, docId } = useParams<{ id: string; docId: string }>()

  const [document, setDocument] = useState<Document | null>(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [wsStatus, setWsStatus] = useState<"connecting"|"connected"|"disconnected">("connecting")

  const debounceRef = useRef<number | null>(null)
  const isRemoteUpdate = useRef(false)

  useEffect(() => {

    if (!docId) return

    async function load() {

      const data = await getDocument(docId as string)

      setDocument(data)
      setContent(data.content)

      setLoading(false)

    }

    load()

  }, [docId])


  useEffect(() => {

    if (!id || !docId) return

    const token = localStorage.getItem("token")

    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}&workspaceId=${id}&docId=${docId}`

    connectWebSocket(

      wsUrl,

      (message) => {

        if (message.type === "DOC_UPDATED") {

          isRemoteUpdate.current = true
          setContent(message.content)

        }

        if (message.type === "PRESENCE_UPDATE") {

          setOnlineUsers(message.users || [])

        }

      },

      (status) => {
        setWsStatus(status)
      }

    )

    return () => {

      disconnectWebSocket()

      if (debounceRef.current) clearTimeout(debounceRef.current)

    }

  }, [id, docId])


  function handleChange(newValue: string) {

    setContent(newValue)

    if (isRemoteUpdate.current) {

      isRemoteUpdate.current = false
      return

    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(() => {

      sendMessage({
        type: "EDIT_DOC",
        content: newValue
      })

    },150)

  }


  if (loading) {

    return (

      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading document...
      </div>

    )

  }


  return (

    <div className="max-w-4xl mx-auto">


      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-semibold">
          {document?.title}
        </h1>


        <div className="flex items-center gap-6">


          {/* Presence */}

          <div className="flex -space-x-2">

            {onlineUsers.map(user => (

              <div
                key={user.id}
                className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center border"
              >
                {user.email[0].toUpperCase()}
              </div>

            ))}

          </div>


          {/* Connection Status */}

          <div className="text-sm">

            {wsStatus === "connected" &&
              <span className="text-green-600 animate-pulse">● Live</span>
            }

            {wsStatus === "connecting" &&
              <span className="text-yellow-600">● Connecting</span>
            }

            {wsStatus === "disconnected" &&
              <span className="text-red-600">● Offline</span>
            }

          </div>


        </div>

      </div>



      {/* Toolbar */}

      <div className="flex gap-2 border-b pb-3 mb-4">

        <button className="btn-secondary text-sm">
          Bold
        </button>

        <button className="btn-secondary text-sm">
          Italic
        </button>

        <button className="btn-secondary text-sm">
          H1
        </button>

      </div>



      {/* Editor */}

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full min-h-[500px] border rounded-xl p-6 text-lg leading-7 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        placeholder="Start typing..."
      />


      <div className="text-xs text-gray-400 mt-4">

        Autosave enabled • Real-time collaboration

      </div>

    </div>

  )

}