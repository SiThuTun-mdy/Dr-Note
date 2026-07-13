import Link from "next/link"

export default function QueuePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-spin-slow" />
            <div className="absolute inset-2 border border-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Under Development</h2>
        <p className="text-muted-foreground mb-8">This feature is currently being built. Check back soon.</p>
        <Link href="/reception" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
