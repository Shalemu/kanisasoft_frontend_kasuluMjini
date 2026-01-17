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

type RangeOption = '4weeks' | '3months' | '6months' | 'year';

interface EventItem {
  id: number;
  date: string;
  title: string;
  category: string;
  location: string;
}

export default function RipotiTab() {
  const [range, setRange] = useState<RangeOption>('4weeks');
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const grouped = useMemo(() => {
    const now = new Date();

    if (range === '4weeks') {
      const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
      return Array.from({ length: 4 }).map((_, i) => {
        const start = subWeeks(thisMonday, i);
        const end = endOfWeek(start, { weekStartsOn: 1 });
        const list = events.filter((e) =>
          isWithinInterval(parseISO(e.date), { start, end })
        );
        return {
          label: `${format(start, 'd MMM')} - ${format(end, 'd MMM')}`,
          shortLabel: format(start, 'dd/MM'),
          total: list.length,
          events: list,
        };
      }).reverse();
    }

    const months = range === '3months' ? 3 : range === '6months' ? 6 : 12;
    return Array.from({ length: months }).map((_, i) => {
      const start = startOfMonth(subMonths(now, i));
      const end = endOfMonth(start);
      const list = events.filter((e) =>
        isWithinInterval(parseISO(e.date), { start, end })
      );
      return {
        label: format(start, 'MMMM yyyy'),
        shortLabel: format(start, 'MMM'),
        total: list.length,
        events: list,
      };
    }).reverse();
  }, [range, events]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-gradient-to-br from-[#f0f4ff] to-white min-h-screen">
      {/* Header & Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-sky-800 flex items-center gap-2">📈 Ripoti za Matukio</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeOption)}
          className="px-4 py-2 rounded-lg border text-sm bg-white text-gray-700 shadow focus:ring-2 focus:ring-sky-400"
        >
          <option value="4weeks">Wiki 4 zilizopita</option>
          <option value="3months">Miezi 3 iliyopita</option>
          <option value="6months">Miezi 6 iliyopita</option>
          <option value="year">Mwaka huu</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-72 bg-white rounded-2xl shadow border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={grouped} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortLabel" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => `${value} matukio`} />
            <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grouped.map((period, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-sky-700">{period.label}</h3>
              <span className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                {period.total} matukio
              </span>
            </div>
            {period.events.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {period.events.map((e) => (
                  <li key={e.id}>
                    <span className="font-medium">{e.title}</span> — {e.category}
                    <span className="text-gray-400">
                      ({format(parseISO(e.date), 'dd MMM')} - {e.location})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-400">Hakuna matukio kipindi hiki.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
