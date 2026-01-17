'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isWithinInterval,
  subWeeks,
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

interface Visitor {
  id: number;
  full_name: string;
  visit_date: string;
}

export default function WageniTakwimuTab() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/guests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setVisitors(data.guests);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const groupedWeeks = useMemo(() => {
    const now = new Date();
    const thisMonday = startOfWeek(now, { weekStartsOn: 1 });

    return Array.from({ length: 4 }).map((_, i) => {
      const weekStart = subWeeks(thisMonday, i);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      const weekVisitors = visitors.filter((v) =>
        isWithinInterval(parseISO(v.visit_date), { start: weekStart, end: weekEnd })
      );

      return {
        label: `${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy')}`,
        shortLabel: `${format(weekStart, 'dd/MM')}`,
        count: weekVisitors.length,
        visitors: weekVisitors,
      };
    }).reverse();
  }, [visitors]);

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-tr from-[#e6f0fa] to-white flex justify-center">
      <div className="max-w-6xl w-full space-y-10">

        {/* Header */}
        <h2 className="text-3xl font-extrabold text-blue-800 text-center">
          📈 Takwimu za Wageni (Wiki 4)
        </h2>

        {/* Chart */}
        <div className="w-full h-72 bg-white rounded-xl shadow border p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedWeeks} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visitor Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedWeeks.map((week, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white shadow hover:shadow-md transition p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-blue-700">{week.label}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {week.count} wageni
                </span>
              </div>
              {week.visitors.length > 0 ? (
                <ul className="text-sm text-gray-700 list-disc list-inside pl-1 space-y-1">
                  {week.visitors.map((v) => (
                    <li key={v.id}>
                      <span className="font-medium">{v.full_name}</span>{' '}
                      <span className="text-gray-400">
                        ({format(parseISO(v.visit_date), 'dd MMM')})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-400">Hakuna wageni wiki hii.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
