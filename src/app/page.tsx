export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Dr-Note
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Doctor Note Management System
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          MVP Coming Soon
        </p>
      </main>
    </div>
  );
}
