import { useState } from 'react';

const DIFFICULTY_COLORS = {
    easy: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    hard: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
};

export default function QuizDisplay({ quizData }) {
    const [quizMode, setQuizMode] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    function pickOption(qIndex, option) {
        if (!quizMode || showResults) return;
        setUserAnswers({ ...userAnswers, [qIndex]: option });
    }

    function checkAnswers() {
        setShowResults(true);
    }

    function resetQuiz() {
        setUserAnswers({});
        setShowResults(false);
    }

    const score = showResults
        ? quizData.quiz.filter((q, i) => userAnswers[i] === q.answer).length
        : 0;

    function getOptionStyle({ option, answer, picked, isQuizMode, hasResults }) {
        let style = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

        if (!isQuizMode) {
            if (option === answer) style = 'border-emerald-300 bg-emerald-50 text-emerald-900';
            return style;
        }

        if (hasResults) {
            if (option === answer) return 'border-emerald-300 bg-emerald-50 text-emerald-900';
            if (option === picked && picked !== answer) return 'border-rose-300 bg-rose-50 text-rose-900';
            return style;
        }

        if (picked === option) return 'border-indigo-300 bg-indigo-50 text-indigo-900';
        return style;
    }

    return (
        <div className="space-y-6">
            {/* Structured article context improves confidence before answering questions */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{quizData.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{quizData.summary}</p>

                {quizData.key_entities && (
                    <div className="mt-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key Entities</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(quizData.key_entities.people || []).map((p, i) => (
                                <span
                                    key={`p-${i}`}
                                    className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200"
                                >
                                    {p}
                                </span>
                            ))}
                            {(quizData.key_entities.organizations || []).map((o, i) => (
                                <span
                                    key={`o-${i}`}
                                    className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200"
                                >
                                    {o}
                                </span>
                            ))}
                            {(quizData.key_entities.locations || []).map((l, i) => (
                                <span
                                    key={`l-${i}`}
                                    className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-200"
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {quizData.sections && quizData.sections.length > 0 && (
                    <div className="mt-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</h3>
                        <ol className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                            {quizData.sections.map((s, i) => <li key={i}>{s}</li>)}
                        </ol>
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                        Quiz <span className="text-slate-500">({quizData.quiz.length} questions)</span>
                    </h2>
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setQuizMode(false);
                                resetQuiz();
                            }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                                !quizMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Study Mode
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setQuizMode(true);
                                resetQuiz();
                            }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                                quizMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Take Quiz
                        </button>
                    </div>
                </div>

                {showResults && (
                    <div
                        className={`mb-5 rounded-xl border px-4 py-3 text-center text-sm font-medium ${
                            score / quizData.quiz.length >= 0.7
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>
                        You scored {score} / {quizData.quiz.length} ({Math.round((score / quizData.quiz.length) * 100)}%)
                    </div>
                )}

                <div className="space-y-6">
                    {quizData.quiz.map((q, i) => {
                        const picked = userAnswers[i];

                        return (
                            <article key={q.id || i} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-medium text-slate-400">Question {i + 1}</span>
                                        <p className="mt-1 text-sm font-medium leading-6 text-slate-800 sm:text-base">{q.question}</p>
                                    </div>
                                    <span className={`ml-3 rounded-full px-2.5 py-1 text-xs font-medium ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium}`}>
                                        {q.difficulty}
                                    </span>
                                </div>

                                <div className="space-y-2" role="radiogroup" aria-label={`Options for question ${i + 1}`}>
                                    {q.options.map((opt, j) => {
                                        const style = getOptionStyle({
                                            option: opt,
                                            answer: q.answer,
                                            picked,
                                            isQuizMode: quizMode,
                                            hasResults: showResults,
                                        });

                                        return (
                                            <button
                                                type="button"
                                                key={j}
                                                onClick={() => pickOption(i, opt)}
                                                role="radio"
                                                aria-checked={picked === opt}
                                                disabled={!quizMode || showResults}
                                                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${style} ${
                                                    quizMode && !showResults ? 'cursor-pointer' : 'cursor-default'
                                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {(!quizMode || showResults) && q.explanation && (
                                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 sm:text-sm">
                                        {q.explanation}
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>

                {quizMode && (
                    <div className="mt-6 flex justify-center gap-3">
                        {!showResults ? (
                            <button
                                type="button"
                                onClick={checkAnswers}
                                disabled={Object.keys(userAnswers).length < quizData.quiz.length}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            >
                                Check Answers
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={resetQuiz}
                                className="rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}
            </section>

            {quizData.related_topics && quizData.related_topics.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Related Topics</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {quizData.related_topics.map((topic, i) => (
                            <a
                                key={i}
                                href={`https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            >
                                {topic}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
