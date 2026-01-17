'use client';

import { useEffect, useState } from 'react';
import { FaUndo, FaSearch } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import { Role } from '@/types/Role';

interface Leader {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function Waliostaafu() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [filterRole, setFilterRole] = useState('Yote');

  useEffect(() => {
    fetchRoles();
    fetchRetired();
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

  const fetchRetired = async () => {
    const res = await apiFetch('/retired-leaders');
    if (res.status === 'success') {
      setLeaders(res.retired || []);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRestore = async () => {
    if (!confirm('Thibitisha kurudisha viongozi waliostaafu?')) return;

    try {
      for (const id of selectedIds) {
        await apiFetch(`/leaders/${id}/restore`, { method: 'POST' });
      }
      setSelectedIds([]);
      fetchRetired();
    } catch (err) {
      alert('Kuna hitilafu wakati wa kurudisha viongozi.');
    }
  };

  const filteredLeaders = leaders.filter((l) =>
    (l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)) &&
    (filterRole === 'Yote' || l.role === filterRole)
  );

  return (
    <div className="text-sm px-4 sm:px-6 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">📁 Viongozi Waliostaafu</h1>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full shadow-sm bg-white w-full sm:w-2/3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta jina, barua pepe au simu..."
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
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Jina</th>
              <th className="px-4 py-3 whitespace-nowrap">Simu</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Nafasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.length > 0 ? (
              filteredLeaders.map((l) => (
                <tr
                  key={l.id}
                  className={`hover:bg-blue-50 cursor-pointer ${
                    selectedIds.includes(l.id) ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => toggleSelect(l.id)}
                >
                  <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${l.name}`}
                        className="w-10 h-10 rounded-full"
                        alt="avatar"
                      />
                      <div>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-gray-500 text-xs">{l.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{l.phone}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600 whitespace-nowrap">
                    {l.role}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Hakuna viongozi waliostaafu kwa sasa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
