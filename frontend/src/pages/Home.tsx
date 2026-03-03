import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6">
      <h1 className="text-4xl font-bold mb-6 text-center">
        LiveDesk
      </h1>

      <p className="text-gray-600 text-center max-w-xl mb-8">
        A minimal real-time collaborative workspace built with
        scalable architecture and WebSockets.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          to="/workspaces"
          className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-black"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}