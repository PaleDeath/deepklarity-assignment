import { useState } from 'react';
import GenerateTab from './components/GenerateTab';
import HistoryTab from './components/HistoryTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Top shell sets hierarchy and gives context without adding visual noise */}
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-8 sm:py-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Wiki Quiz Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Generate structured quizzes from Wikipedia articles and review your past sessions.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div role="tablist" aria-label="Quiz views" className="grid grid-cols-2 gap-2">
            <button
              id="tab-generate"
              type="button"
              role="tab"
              aria-selected={activeTab === 'generate'}
              aria-controls="panel-generate"
              onClick={() => setActiveTab('generate')}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                activeTab === 'generate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Generate Quiz
            </button>
            <button
              id="tab-history"
              type="button"
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="panel-history"
              onClick={() => setActiveTab('history')}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Past Quizzes
            </button>
          </div>
        </section>

        <main
          id={activeTab === 'generate' ? 'panel-generate' : 'panel-history'}
          role="tabpanel"
          aria-labelledby={activeTab === 'generate' ? 'tab-generate' : 'tab-history'}
        >
          {activeTab === 'generate' ? <GenerateTab /> : <HistoryTab />}
        </main>
      </div>
    </div>
  );
}
