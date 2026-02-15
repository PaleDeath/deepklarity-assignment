import { useEffect } from 'react';
import QuizDisplay from './QuizDisplay';

export default function QuizModal({ quizData, onClose }) {

    // close on escape key
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/55 p-4 backdrop-blur-[1px]"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-modal-title"
        >
            <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-6">
                <h2 id="quiz-modal-title" className="sr-only">
                    Quiz details
                </h2>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    aria-label="Close quiz details"
                >
                    <span aria-hidden="true">✕</span>
                </button>
                <QuizDisplay quizData={quizData} />
            </div>
        </div>
    );
}
