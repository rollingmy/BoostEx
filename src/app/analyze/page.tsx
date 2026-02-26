'use client';
import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function AnalyzePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.includes('chrome.google.com/webstore') && !url.includes('chromewebstore.google.com')) {
            setError('Please enter a valid Chrome Web Store URL');
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Failed to analyze');

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async () => {
        setTracking(true);
        try {
            const res = await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to track');

            // Redirect to dashboard
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTracking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    ASO Analyzer
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Spy on your competitors. Paste a Chrome Extension URL to uncover their keywords, user growth, and SEO strategy.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="relative max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-full shadow-md p-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <Search className="w-6 h-6 text-gray-400 ml-3" />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://chromewebstore.google.com/detail/..."
                        className="flex-1 border-0 focus:ring-0 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-400 text-lg outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white rounded-full px-8 py-3 font-semibold hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Analyze
                    </button>
                </div>
                {error && (
                    <div className="mt-4 flex items-center text-red-600 bg-red-50 p-3 rounded-md">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}
            </form>

            {/* Results Section Placeholder */}
            {data && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 border-b pb-2">Overview</h3>
                            <p><span className="font-medium text-gray-500">Title:</span> {data.title}</p>
                            <p><span className="font-medium text-gray-500">Users:</span> {data.users}</p>
                            <p><span className="font-medium text-gray-500">Rating:</span> {data.rating} / 5</p>
                            <p><span className="font-medium text-gray-500">Version:</span> {data.version}</p>
                        </div>

                        {/* ASO Logic */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 border-b pb-2">ASO Performance</h3>
                            <p><span className="font-medium text-gray-500">Title Length:</span> {data.titleLength} (Ideal: ~50 chars)</p>
                            <p><span className="font-medium text-gray-500">Description Length:</span> {data.descLength}</p>

                            <div className="mt-4">
                                <span className="font-medium text-gray-500 block mb-2">Top Keywords:</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.keywords?.map((kw: any, i: number) => (
                                        <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {kw.word} ({kw.count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-2xl">
                        <div className="mb-4 sm:mb-0">
                            <h4 className="font-semibold text-gray-900">Track this Competitor</h4>
                            <p className="text-sm text-gray-500">Monitor their daily user growth automatically on your dashboard.</p>
                        </div>
                        <button
                            onClick={handleTrack}
                            disabled={tracking}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-70 whitespace-nowrap"
                        >
                            {tracking ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Add to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
