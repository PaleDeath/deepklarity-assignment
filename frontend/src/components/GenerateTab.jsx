import { useState, useEffect } from 'react';
import { generateQuiz, previewUrl } from '../api';
import QuizDisplay from './QuizDisplay';

export default function GenerateTab() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [preview, setPreview] = useState(null);

    // debounced url preview — fetches article title as you type
    useEffect(() => {
        setPreview(null);
        if (!url.includes('en.wikipedia.org/wiki/')) return;

        const timer = setTimeout(() => {
            previewUrl(url)
                .then(res => setPreview(res.data.title))
                .catch(() => setPreview(null));  // silently fail, its just a nice-to-have
        }, 600);

        return () => clearTimeout(timer);
    }, [url]);

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setQuizData(null);
        setPreview(null);

        if (!url.includes('en.wikipedia.org/wiki/')) {
            setError('Please enter a valid English Wikipedia URL.');
            return;
        }

        setLoading(true);
        generateQuiz(url)
            .then(res => setQuizData(res.data))
            .catch(err => {
                const msg = err.response?.data?.detail || 'Something went wrong. Try again.';
                setError(msg);
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="space-y-6">
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                aria-label="Generate quiz form"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="wiki-url" className="block text-sm font-medium text-slate-700">
                            Wikipedia article URL
                        </label>
                        <p className="mt-1 text-sm text-slate-500">
                            Use an English Wikipedia URL like <span className="font-mono text-xs">https://en.wikipedia.org/wiki/Alan_Turing</span>.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex-1">
                            <input
                                id="wiki-url"
                                name="wiki-url"
                                type="url"
                                autoComplete="off"
                                placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                aria-invalid={Boolean(error)}
                                aria-describedby="wiki-url-help"
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            />
                            <div id="wiki-url-help" className="mt-2 min-h-5 text-sm" aria-live="polite">
                                {preview && <p className="text-emerald-700">Preview: {preview}</p>}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            {loading ? 'Generating…' : 'Generate Quiz'}
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center shadow-sm" aria-live="polite">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    <p className="mt-3 text-sm text-slate-600">Scraping article and generating quiz…</p>
                </div>
            )}

            {quizData && <QuizDisplay quizData={quizData} />}
        </div>
    );
}
