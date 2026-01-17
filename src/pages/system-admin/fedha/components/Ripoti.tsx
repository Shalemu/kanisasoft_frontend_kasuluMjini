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

interface Asset {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location?: string;
  acquired_date?: string;
  value?: number;
  description?: string;
  created_at: string;
}

type RangeOption = '4weeks' | '3months' | '6months' | 'year';

export default function TakwimuTab() {
  const [range, setRange] = useState<RangeOption>('4weeks');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiFetch('/mtumiaji');
        setUserId(userRes?.id);

        const contribRes = await apiFetch('/contributions');
        const assetRes = await apiFetch('/assets');

        if (contribRes.status === 'success') {
          const filtered = contribRes.reports.filter(
            (c: Contribution) => c.user_id === userRes?.id
          );
          setContributions(filtered);
        }

        if (assetRes?.assets) setAssets(assetRes.assets);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const isWeekly = range === '4weeks';
    const count = range === '3months' ? 3 : range === '6months' ? 6 : range === 'year' ? 12 : 4;

    return Array.from({ length: count }).map((_, i) => {
      const start = isWeekly ? subWeeks(startOfWeek(now, { weekStartsOn: 1 }), i) : startOfMonth(subMonths(now, i));
      const end = isWeekly ? endOfWeek(start, { weekStartsOn: 1 }) : endOfMonth(start);

      const contribList = contributions.filter(c =>
        isWithinInterval(parseISO(c.date), { start, end })
      );

      const assetList = assets.filter(a =>
        a.acquired_date && isWithinInterval(parseISO(a.acquired_date), { start, end })
      );

      return {
        label: isWeekly ? `${format(start, 'd MMM')} - ${format(end, 'd MMM')}` : format(start, 'MMMM yyyy'),
        shortLabel: isWeekly ? format(start, 'dd/MM') : format(start, 'MMM'),
        totalContributions: contribList.reduce((sum, c) => sum + c.amount, 0),
        totalAssetValue: assetList.reduce((sum, a) => sum + (a.value || 0), 0),
        contributions: contribList,
        assets: assetList,
      };
    }).reverse();
  }, [range, contributions, assets]);

  const formatTZS = (amount: number): string =>
    `TZS ${Number(amount).toLocaleString()}`;

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-10 text-sm sm:text-base">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">📊 Takwimu za Michango & Mali</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeOption)}
          className="border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="4weeks">Wiki 4 zilizopita</option>
          <option value="3months">Miezi 3 iliyopita</option>
          <option value="6months">Miezi 6 iliyopita</option>
          <option value="year">Mwaka huu</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-80 bg-white rounded-xl shadow border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={grouped} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortLabel" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => `${value.toLocaleString()} Tsh`}
              labelFormatter={(label) => `Kipindi: ${label}`}
            />
            <Bar dataKey="totalContributions" fill="#2563EB" name="Michango" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalAssetValue" fill="#16A34A" name="Mali" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Period Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grouped.map((period, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition duration-300 ease-in-out"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-blue-700">{period.label}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {formatTZS(period.totalContributions)} + {formatTZS(period.totalAssetValue)}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-2">
              🔹 <strong>{period.contributions.length}</strong> michango, <strong>{period.assets.length}</strong> mali
            </p>

            {period.contributions.length > 0 && (
              <ul className="text-gray-700 list-disc list-inside text-sm space-y-1">
                {period.contributions.map((c) => (
                  <li key={`c-${c.id}`}>
                    <span className="font-medium">{c.type}</span> — {formatTZS(c.amount)}{' '}
                    <span className="text-gray-400">({format(parseISO(c.date), 'dd MMM')})</span>
                  </li>
                ))}
              </ul>
            )}

            {period.assets.length > 0 && (
              <ul className="text-gray-700 list-disc list-inside text-sm space-y-1 mt-3">
                {period.assets.map((a) => (
                  <li key={`a-${a.id}`}>
                    <span className="font-medium">{a.name}</span> — {formatTZS(a.value || 0)}{' '}
                    <span className="text-gray-400">({a.acquired_date || '-'})</span>
                  </li>
                ))}
              </ul>
            )}

            {period.contributions.length === 0 && period.assets.length === 0 && (
              <p className="italic text-gray-400">Hakuna taarifa kipindi hiki.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
