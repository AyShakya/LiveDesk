export default function WorkspacePage() {

  return (

    <div className="mx-auto mt-8 max-w-4xl rounded-[3rem] bg-white/90 p-10 text-center shadow-[0px_20px_40px_rgba(55,56,48,0.06)] fade-up md:p-16">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0efe4] text-4xl text-[#a292ff]">📄</div>
      <h2 className="title-font mb-4 text-6xl font-extrabold tracking-[-0.02em] text-[#373830]">Select a document to start</h2>
      <p className="mx-auto max-w-2xl text-2xl leading-relaxed text-[#616458]">
        Your workspace is quiet. Choose an existing document from the sidebar or create a new one to begin curating your ideas.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button className="btn-primary px-10">New Document</button>
        <button className="btn-secondary px-10">Browse Templates</button>
      </div>
    </div>

  )

}
