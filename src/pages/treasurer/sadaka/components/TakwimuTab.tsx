'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isWithinInterval,
  subWeeks,
  subMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { apiFetch } from '@/lib/api';

interface Contribution {
  id: number;
  user_id: number | null;
  date: string;
  type: string;
  amount: number;
  method: string;
}

type RangeOption = '4weeks' | '3months' | '6months' | 'year';

export default function TakwimuTab() {
  const [range, setRange] = useState<RangeOption>('4weeks');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const userRes = await apiFetch('/mtumiaji');
      const userId = userRes?.id;
      setUserId(userId);

      const res = await apiFetch('/contributions');
      if (res.status === 'success') {
        const filtered = res.reports.filter(
          (c: Contribution) => c.user_id === userId
        );
        setContributions(filtered);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();

    if (range === '4weeks') {
      const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
      return Array.from({ length: 4 }).map((_, i) => {
        const start = subWeeks(thisMonday, i);
        const end = endOfWeek(start, { weekStartsOn: 1 });
        const list = contributions.filter((c) =>
          isWithinInterval(parseISO(c.date), { start, end })
        );
        return {
          label: `${format(start, 'd MMM')} - ${format(end, 'd MMM')}`,
          shortLabel: format(start, 'dd/MM'),
          total: list.reduce((sum, c) => sum + c.amount, 0),
          contributions: list,
        };
      }).reverse();
    }

    const months = range === '3months' ? 3 : range === '6months' ? 6 : 12;
    return Array.from({ length: months }).map((_, i) => {
      const start = startOfMonth(subMonths(now, i));
      const end = endOfMonth(start);
      const list = contributions.filter((c) =>
        isWithinInterval(parseISO(c.date), { start, end })
      );
      return {
        label: format(start, 'MMMM yyyy'),
        shortLabel: format(start, 'MMM'),
        total: list.reduce((sum, c) => sum + c.amount, 0),
        contributions: list,
      };
    }).reverse();
  }, [range, contributions]);

  return (
    <div className="bg-gradient-to-tr from-[#e6f0fa] to-white p-6 rounded-xl shadow-md max-w-6xl mx-auto space-y-10">
      {/* Header + Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">📊 Takwimu za Michango</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeOption)}
          className="border border-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none"
        >
          <option value="4weeks">Wiki 4 zilizopita</option>
          <option value="3months">Miezi 3 iliyopita</option>
          <option value="6months">Miezi 6 iliyopita</option>
          <option value="year">Mwaka huu</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-72 bg-white rounded-xl shadow border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={grouped} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortLabel" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} Tsh`} />
            <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Details per period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grouped.map((period, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-blue-700">{period.label}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {period.total.toLocaleString()} Tsh
              </span>
            </div>
            {period.contributions.length > 0 ? (
              <ul className="text-sm text-gray-700 list-disc list-inside pl-1 space-y-1">
                {period.contributions.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.type}</span> —{' '}
                    {c.amount.toLocaleString()} Tsh{' '}
                    <span className="text-gray-400">
                      ({format(parseISO(c.date), 'dd MMM')})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-400">Hakuna michango kipindi hiki.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
