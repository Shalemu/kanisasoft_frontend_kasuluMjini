'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Group {
  id: number;
  name: string;
  zone: string | null;
  contact: string | null;
  leader: string | null;
  members: { id: number }[];
}

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#7c3aed', '#14b8a6'];

export default function RipotiTab() {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const barChartData = useMemo(() => {
    return groups.map((group) => ({
      name: group.name,
      members: group.members.length,
    }));
  }, [groups]);

  const pieChartData = useMemo(() => {
    const zoneCount: Record<string, number> = {};
    groups.forEach((g) => {
      const zone = g.zone || 'Haijatajwa';
      zoneCount[zone] = (zoneCount[zone] || 0) + 1;
    });
    return Object.entries(zoneCount).map(([zone, count]) => ({ name: zone, value: count }));
  }, [groups]);

  return (
    <div className="p-4 space-y-10">
      <h1 className="text-3xl font-bold text-gray-800 text-center">📊 Ripoti ya Makundi</h1>
      <p className="text-center text-gray-500 mb-6">Angalia takwimu za wanachama kwa kila kundi na mkoa.</p>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-blue-700">Idadi ya Wanachama kwa Kundi</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="members" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-green-700">Makundi kwa Kanda / Zone</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              dataKey="value"
            >
              {pieChartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-4 rounded-xl border shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Wanachama:</span> {group.members.length}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Kiongozi:</span>{' '}
              {group.leader ? group.leader : <span className="italic text-gray-400">—</span>}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Zone:</span>{' '}
              {group.zone ?? <span className="italic text-gray-400">—</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
