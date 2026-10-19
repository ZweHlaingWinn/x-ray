export default function Loading() {
  return (
    <main className="flex flex-1 flex-col bg-slate-50" aria-busy="true" aria-label="Loading your result">
      <div className="h-20 bg-gradient-to-br from-teal-700 to-cyan-800" />
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
        <div className="h-36 animate-pulse rounded-2xl bg-white" />
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    </main>
  )
}
