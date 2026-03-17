import { Link } from "react-router-dom"

const features = [
  { title: "Real-time editing", text: "Collaborate with your team instantly without refreshes." },
  { title: "Workspace invites", text: "Bring teammates in using simple invite links and codes." },
  { title: "Presence awareness", text: "See who is online and editing with live status updates." },
]

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-10 md:py-14">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div className="fade-up">
          <p className="text-pink-500 tracking-[0.22em] uppercase text-xs mb-4">Funky • Smooth • Collaborative</p>
          <h1 className="title-font text-5xl md:text-6xl font-bold mb-5 text-violet-900">
            LiveDesk
          </h1>
          <p className="text-violet-700 max-w-xl mb-8 leading-7">
            A clean collaboration space for teams that want delightful writing, effortless teamwork, and reliable real-time sync.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary px-8 py-3">Get started free</Link>
            <Link to="/login" className="btn-secondary px-8 py-3">Login</Link>
          </div>
        </div>

        <div className="glass-card p-8 floaty">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-violet-900">Sprint Notes</div>
            <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700">Live</span>
          </div>
          <div className="space-y-3 text-sm text-violet-700">
            <p className="rounded-lg bg-violet-50 px-3 py-2">✅ Clarify release scope for Friday</p>
            <p className="rounded-lg bg-pink-50 px-3 py-2">✍️ Draft onboarding checklist for new members</p>
            <p className="rounded-lg bg-violet-50 px-3 py-2">🎯 Finalize UI polish and animation pass</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((item, index) => (
            <article
              key={item.title}
              className="card p-6 transition-all duration-200 hover:-translate-y-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <h3 className="title-font text-xl text-violet-900 mb-2">{item.title}</h3>
              <p className="text-violet-700">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <h2 className="title-font text-3xl text-violet-900 mb-2">Ready to build together?</h2>
            <p className="text-violet-700">Create your first workspace and invite your team in less than a minute.</p>
          </div>
          <Link to="/register" className="btn-primary px-8 py-3 soft-pulse">Create account</Link>
        </div>
      </section>
    </div>
  )
}
