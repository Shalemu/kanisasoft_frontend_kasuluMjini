'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaClock } from 'react-icons/fa';
import { parseISO, isAfter, subDays } from 'date-fns';
import { apiFetch } from '@/lib/api';

interface Report {
  id: number;
  date: string;
  type: string;
  amount: string | number;
  method: string;
  giver: string;
}

const categories = ['Yote', 'Sadaka', 'Fungu la Kumi', 'Maendeleo', 'Misaada Maalum'];
const durations = [
  { label: 'Siku 7', days: '7' },
  { label: 'Mwezi 1', days: '30' },
  { label: 'Miezi 3', days: '90' },
  { label: 'Mwaka 1', days: '365' },
  { label: 'Yote', days: 'Infinity' },
];

export default function MichangoYanguTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('Yote');
  const [duration, setDuration] = useState<string>('30');

  const fetchReports = async () => {
    try {
      const res = await apiFetch('/contributions');
      const user = await apiFetch('/mtumiaji');

      if (res.status === 'success') {
        const userReports = res.reports.filter(
          (r: Report) => r.giver === user.full_name
        );
        setReports(userReports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    const matchSearch = r.type.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === 'Yote' || r.type === filter;
    const reportDate = parseISO(r.date);
    const thresholdDate = subDays(new Date(), duration === 'Infinity' ? 100000 : parseInt(duration));
    const withinRange = duration === 'Infinity' || isAfter(reportDate, thresholdDate);
    return matchSearch && matchType && withinRange;
  });

  const total = filtered.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-6xl mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-2">📜 Historia ya Michango Yangu</h2>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              filter === cat
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Duration */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:w-2/3 flex items-center bg-white border px-4 py-2 rounded-lg shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kwa aina ya mchango..."
            className="w-full outline-none text-sm text-gray-800"
          />
        </div>
        <div className="relative w-full sm:w-1/3">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full appearance-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          >
            {durations.map((d) => (
              <option key={d.label} value={d.days}>
                {d.label}
              </option>
            ))}
          </select>
          <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-left">
            <tr>
              <th className="px-6 py-3">Tarehe</th>
              <th className="px-6 py-3">Aina ya Mchango</th>
              <th className="px-6 py-3">Njia</th>
              <th className="px-6 py-3 text-right">Kiasi (Tsh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 whitespace-nowrap">{r.date.split('T')[0]}</td>
                <td className="px-6 py-3 whitespace-nowrap">{r.type}</td>
                <td className="px-6 py-3 whitespace-nowrap">{r.method}</td>
                <td className="px-6 py-3 text-right whitespace-nowrap font-medium">
                  {Number(r.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold text-gray-800">
              <td colSpan={3} className="px-6 py-3 text-right">Jumla:</td>
              <td className="px-6 py-3 text-right text-blue-700">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} Tsh
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
