export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-8 border-b border-white pb-4">
          Seth Command Center
        </h1>
        <p className="text-lg tracking-wide">
          Ritual-driven personal intelligence platform
        </p>
        <div className="mt-8">
          <a
            href="/command-center"
            className="inline-block px-8 py-4 border border-white hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider"
          >
            Access Command Center
          </a>
        </div>
      </div>
    </div>
  )
}