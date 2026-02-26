'use client';

import { ArrowUpRight, TrendingUp, Users, RefreshCw, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
    const [extensions, setExtensions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExtensions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/track');
            const data = await res.json();
            if (data.extensions) {
                setExtensions(data.extensions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExtensions();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Overview of your tracked Chrome extensions and their daily user growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchExtensions} className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors bg-white">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/analyze"
                        className="bg-indigo-600 border border-transparent text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Analyze New Competitor
                    </Link>
                </div>
            </div>

            {loading && extensions.length === 0 ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : extensions.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No extensions tracked yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Start by tracking a competitor's Chrome Extension URL to visualize their daily user growth curve.
                    </p>
                    <Link
                        href="/analyze"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Add First Extension
                        <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {extensions.map((ext) => {
                        const latestUsers = ext.history[ext.history.length - 1]?.users || 0;
                        const prevUsers = ext.history[Math.max(0, ext.history.length - 2)]?.users || 0;
                        const diff = latestUsers - prevUsers;

                        return (
                            <div key={ext.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate" title={ext.title}>{ext.title}</h3>
                                        <a href={ext.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-500 hover:underline truncate block mt-1">View in Web Store</a>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900">{latestUsers.toLocaleString()}</div>
                                        <div className={`text-sm font-medium flex items-center justify-end ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {diff > 0 ? '+' : ''}{diff !== 0 ? diff.toLocaleString() : 'No change'} {diff !== 0 ? '(vs prev)' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64 mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={ext.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickMargin={10}
                                                tickFormatter={(val) => {
                                                    const d = new Date(val);
                                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                                }}
                                            />
                                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number) => [value.toLocaleString(), 'Users']}
                                            />
                                            <Line type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2, fill: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
