function App() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-lg font-semibold tracking-tight text-white">X1Techs CRM</span>
          <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">dev</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: 'Dashboard', active: true },
            { label: 'Run History' },
            { label: 'Lead Pipeline' },
            { label: 'Outreach Center' },
            { label: 'Analytics' },
            { label: 'AI Assistant' },
          ].map(({ label, active }) => (
            <button
              key={label}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 text-xs text-gray-500">
          Phase 1 — Foundation
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900">
          <span className="text-sm font-medium text-gray-200">Dashboard</span>
          <span className="text-xs text-gray-500">localhost:5173</span>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Backend', value: 'Online', color: 'text-green-400', sub: 'localhost:8001' },
              { label: 'Database', value: 'Connected', color: 'text-green-400', sub: 'postgres:5433' },
              { label: 'Redis', value: 'Connected', color: 'text-green-400', sub: 'redis:6380' },
              { label: 'n8n DB Tunnel', value: 'Run tunnel script', color: 'text-yellow-400', sub: 'scripts/tunnel-start.sh' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
                <p className="text-xs text-gray-600 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Phase 1 — Foundation (in progress)</h2>
            <div className="space-y-3">
              {[
                { task: 'Laravel 11 project scaffold', done: true },
                { task: 'React + Vite + TailwindCSS scaffold', done: true },
                { task: 'Docker Compose dev environment', done: true },
                { task: 'Sanctum auth setup', done: false },
                { task: 'CRM database migrations', done: false },
                { task: 'Base layout with routing', done: false },
              ].map(({ task, done }) => (
                <div key={task} className="flex items-center gap-3 text-sm">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0 ${done ? 'bg-green-500 text-white' : 'border border-gray-600'}`}>
                    {done ? '✓' : ''}
                  </span>
                  <span className={done ? 'text-gray-400 line-through' : 'text-gray-200'}>{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
