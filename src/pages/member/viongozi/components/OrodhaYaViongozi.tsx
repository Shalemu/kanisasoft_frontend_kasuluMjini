'use client';

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import { Role } from '@/types/Role';

interface Leader {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  user_id: number | null;
}

export default function OrodhaYaViongozi() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('Yote');

  useEffect(() => {
    fetchRoles();
    fetchLeaders();
  }, []);

  const fetchRoles = async () => {
    const res = await apiFetch('/leadership-roles');
    if (res.status !== 'error') {
      const normalized: Role[] = (res.roles || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        requiresMember: r.requires_member,
      }));
      setRoles(normalized);
    }
  };

  const fetchLeaders = async () => {
    const res = await apiFetch('/leaders');
    if (res.status !== 'error') {
      const activeOnly = (res.leaders ?? []).filter((l: any) => l.status !== 'retired');

      const priorityOrder = ['mchungaji', 'katibu', 'mtunza hazina', 'admin'];
      const sorted = [...activeOnly].sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.role.toLowerCase());
        const bIndex = priorityOrder.indexOf(b.role.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return a.role.localeCompare(b.role);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      setLeaders(sorted);
    }
  };

  const filteredLeaders = leaders
    .filter((l) =>
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search)) &&
      (filterRole === 'Yote' || l.role === filterRole)
    )
    .sort((a, b) => (a.user_id === null && b.user_id !== null ? -1 : 1));

  return (
    <div className="text-sm px-4 sm:px-6 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">📋 Viongozi wa Kanisa</h1>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full shadow-sm bg-white w-full sm:w-2/3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta jina, barua pepe au simu ya kiongozi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none bg-transparent text-sm text-gray-700"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded shadow-sm w-full sm:w-auto"
          >
            <option value="Yote">Nafasi Zote</option>
            {roles.map((r) => (
              <option key={r.id} value={r.title}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Jina</th>
              <th className="px-4 py-3 whitespace-nowrap">Simu</th>
              <th className="px-4 py-3 whitespace-nowrap">Nafasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.length > 0 ? (
              filteredLeaders.map((l) => (
                <tr
                  key={l.id}
                  className="odd:bg-white even:bg-gray-50 text-gray-800 hover:bg-gray-100"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${l.name}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-gray-500">{l.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{l.phone}</td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap font-semibold ${
                      l.user_id ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {l.role}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-6 text-gray-500 bg-white"
                >
                  Hakuna viongozi waliopo kwa sasa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
