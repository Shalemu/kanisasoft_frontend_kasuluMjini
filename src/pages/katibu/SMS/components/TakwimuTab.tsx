'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaEnvelopeOpenText, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';


interface SmsLog {
  id: number;
  status: string;
  sent_at: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
];

function isDelivered(status: string) {
  const good = ['success', 'delivered', 'sent', 'imetumwa'];
  return !!status && good.some((s) => status.toLowerCase().includes(s));
}

function getMonthName(monthIndex: number) {
  return MONTHS[monthIndex] || '';
}

export default function TakwimuTab() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setLogs(data.logs || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group sent SMS by month
  const now = new Date();
  const smsByMonth: { [key: string]: number } = {};
  logs.forEach((log) => {
    if (!isDelivered(log.status)) return;
    const d = new Date(log.sent_at);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`; // e.g., 2025-5 for June 2025
    smsByMonth[key] = (smsByMonth[key] || 0) + 1;
  });

  // Make array for chart sorted by date (last 12 months)
  const chartData = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    chartData.push({
      month: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
      count: smsByMonth[key] || 0,
    });
  }

  // Find current month key
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const smsSentThisMonth = smsByMonth[thisMonthKey] || 0;

  // Find month with most/least (excluding months with zero)
  const monthsWithSms = chartData.filter(d => d.count > 0);
  let maxMonth = null, minMonth = null;
  if (monthsWithSms.length > 0) {
    maxMonth = monthsWithSms.reduce((a, b) => (a.count > b.count ? a : b));
    minMonth = monthsWithSms.reduce((a, b) => (a.count < b.count ? a : b));
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-blue-50 rounded p-4 flex flex-col items-center justify-center">
          <FaEnvelopeOpenText className="text-blue-600 text-xl mb-1" />
          <div className="font-semibold text-lg">{smsSentThisMonth}</div>
          <div className="text-xs text-blue-900">SMS zilizotumwa mwezi huu</div>
        </div>
        <div className="flex-1 bg-green-50 rounded p-4 flex flex-col items-center justify-center">
          <FaArrowUp className="text-green-600 text-xl mb-1" />
          <div className="font-semibold text-lg">{maxMonth ? maxMonth.count : 0}</div>
          <div className="text-xs text-green-900">
            Mwezi ulioongoza: <span className="font-semibold">{maxMonth ? maxMonth.month : '-'}</span>
          </div>
        </div>
        <div className="flex-1 bg-red-50 rounded p-4 flex flex-col items-center justify-center">
          <FaArrowDown className="text-red-600 text-xl mb-1" />
          <div className="font-semibold text-lg">{minMonth ? minMonth.count : 0}</div>
          <div className="text-xs text-red-900">
            Mwezi uliokuwa chini: <span className="font-semibold">{minMonth ? minMonth.month : '-'}</span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 mb-2">Mchoro wa SMS Miezi 12</h2>
        {loading ? (
          <div className="text-blue-700 flex items-center gap-2 py-8"><FaSpinner className="animate-spin" /> Inapakia...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
