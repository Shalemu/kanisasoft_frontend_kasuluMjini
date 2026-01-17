'use client';

import { useEffect, useState } from 'react';
import { FaUndo, FaSearch, FaFilePdf, FaFileExcel, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [selectAll, setSelectAll] = useState(false);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedIds(isChecked ? filteredLeaders.map((l) => l.id) : []);
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      setSelectAll(false);
    } else {
      const updated = [...selectedIds, id];
      setSelectedIds(updated);
      if (updated.length === filteredLeaders.length) {
        setSelectAll(true);
      }
    }
  };

  const handleRestore = async () => {
    if (!confirm('Thibitisha kurudisha viongozi waliostaafu?')) return;
    try {
      for (const id of selectedIds) {
        await apiFetch(`/leaders/${id}/restore`, { method: 'POST' });
      }
      toast.success('✅ Viongozi wamerejeshwa kikamilifu!');
      setSelectedIds([]);
      setSelectAll(false);
      fetchRetired();
    } catch (err) {
      toast.error('❌ Hitilafu: Hakuna viongozi waliorejeshwa.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Una uhakika unataka kufuta viongozi hawa?')) return;
    try {
      for (const id of selectedIds) {
        await apiFetch(`/leaders/${id}`, { method: 'DELETE' });
      }
      toast.success('🗑️ Viongozi wamefutwa na kurejeshwa kuwa washirika.');
      setSelectedIds([]);
      setSelectAll(false);
      fetchRetired();
    } catch (err) {
      toast.error('❌ Hitilafu: Viongozi hawajafutwa.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Waliostaafu');
    XLSX.writeFile(workbook, 'viongozi_waliostaafu.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Jina', 'Simu', 'Barua Pepe', 'Nafasi']],
      body: filteredLeaders.map((l) => [l.name, l.phone, l.email, l.role]),
    });
    doc.save('viongozi_waliostaafu.pdf');
  };

  const filteredLeaders = leaders.filter((l) =>
    (l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)) &&
    (filterRole === 'Yote' || l.role.startsWith(filterRole))
  );

  return (
    <div className="text-sm px-4 sm:px-6 py-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">📁 Viongozi Waliostaafu</h1>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleRestore}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
              >
                <FaUndo /> Rudisha ({selectedIds.length})
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
              >
                <FaTrash /> Futa
              </button>
            </>
          )}
          <button onClick={handleExportExcel} className="text-sm px-3 py-2 border rounded text-green-700 border-green-300">
            <FaFileExcel /> Excel
          </button>
          <button onClick={handleExportPDF} className="text-sm px-3 py-2 border rounded text-red-700 border-red-300">
            <FaFilePdf /> PDF
          </button>
        </div>
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
              <option key={r.id} value={r.title}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="accent-blue-600"
                />
              </th>
              <th className="px-4 py-3">Jina</th>
              <th className="px-4 py-3">Simu</th>
              <th className="px-4 py-3 text-right">Nafasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.length > 0 ? (
              filteredLeaders.map((l) => (
                <tr
                  key={l.id}
                  className={`hover:bg-blue-50 ${selectedIds.includes(l.id) ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(l.id)}
                      onChange={() => handleSelectOne(l.id)}
                      className="accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-800">
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
                  <td className="px-4 py-3 text-gray-700">{l.phone}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{l.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
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
