import { useState, useEffect } from 'react';
import { getHistory, getQuizById, deleteQuiz } from '../api';
import QuizModal from './QuizModal';

export default function HistoryTab() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    function fetchHistory() {
        setLoading(true);
        getHistory()
            .then(res => setHistory(res.data))
            .catch(err => console.error('failed to load history:', err))
            .finally(() => setLoading(false));
    }

    function handleView(id) {
        getQuizById(id)
            .then(res => setModalData(res.data))
            .catch(err => console.error('couldnt load quiz:', err));
    }

    function handleDelete(id) {
        if (!window.confirm('Delete this quiz?')) return;
        deleteQuiz(id)
            .then(() => fetchHistory())
            .catch(err => console.error('delete failed:', err));
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center shadow-sm">
                <p className="text-sm text-slate-600">Loading quiz history…</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                <p className="text-base font-medium text-slate-700">No quizzes yet</p>
                <p className="mt-2 text-sm text-slate-500">Generate your first quiz from the other tab.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <caption className="sr-only">Past generated Wikipedia quizzes</caption>
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Questions</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                            <th scope="col" className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-indigo-700 transition hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        {item.title}
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{item.quiz_count}</td>
                                <td className="px-4 py-3 text-slate-500">
                                    {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button
                                        onClick={() => handleView(item.id)}
                                        className="rounded-md px-2 py-1 font-medium text-indigo-700 transition hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                        aria-label={`View details for ${item.title}`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-md px-2 py-1 font-medium text-rose-700 transition hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                                        aria-label={`Delete ${item.title}`}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalData && (
                <QuizModal quizData={modalData} onClose={() => setModalData(null)} />
            )}
        </>
    );
}
