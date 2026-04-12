import { Link } from "react-router-dom"

const features = [
  { title: "Real-time editing", text: "Experience zero-latency collaboration as ideas evolve together." },
  { title: "Presence awareness", text: "See who is active, where they are, and what they are shaping." },
  { title: "Workspace invites", text: "Share elegant invite links with clients, partners, and teammates." },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fefdf1] px-6 py-10 md:py-14">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center mb-20">
        <div className="fade-up">
          <p className="mb-5 inline-flex rounded-full bg-[#ffc3bf] px-3 py-1 text-xs uppercase tracking-[0.08em] text-[#8a2d2b]">Now with real-time presence</p>
          <h1 className="title-font text-7xl md:text-8xl font-extrabold italic tracking-[-0.02em] mb-6 text-[#6236ff]">
            LiveDesk
          </h1>
          <p className="text-[#4f5248] max-w-xl mb-8 text-2xl leading-relaxed">
            The digital atelier for high-energy teams. Transform messy ideas into polished projects with your fluid collaborative canvas.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary px-10 py-4 text-xl">Get started free</Link>
            <Link to="/login" className="btn-secondary px-10 py-4 text-xl">Watch demo</Link>
          </div>
        </div>

        <div className="glass-card p-8 floaty">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="title-font text-4xl font-bold text-[#373830]">Sprint Notes</div>
              <div className="text-sm text-[#66695e]">Design Atelier · 6 collaborators</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#cdeee9] text-[#007169] font-semibold">● LIVE</span>
          </div>
          <div className="space-y-3 text-base text-[#373830]">
            <p className="rounded-2xl bg-[#fbfaed] px-4 py-3">✅ Refine organic brutalism layout</p>
            <p className="rounded-2xl bg-[#fbfaed] px-4 py-3">☐ Audit parchment color palette</p>
            <p className="rounded-2xl bg-[#fbfaed] px-4 py-3">☐ Finalize funky headlines</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[2rem] bg-[#fbfaed] p-8 transition-all duration-200 hover:-translate-y-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <h3 className="title-font text-5xl font-bold text-[#373830] mb-3">{item.title}</h3>
              <p className="text-[#5f6257] text-xl leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="rounded-[3rem] bg-[#fbfaed] p-10 md:p-14 text-center">
          <h2 className="title-font text-7xl font-extrabold italic tracking-[-0.02em] text-[#373830] mb-3">Ready to build together?</h2>
          <p className="text-[#5f6257] text-2xl max-w-3xl mx-auto mb-8">Join 10,000+ studios using LiveDesk to turn simple notes into meaningful products.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary px-10 py-4 text-xl soft-pulse">Start creating for free</Link>
            <Link to="/login" className="btn-secondary px-10 py-4 text-xl">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
