'use client';

import { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaUserSlash,
  FaFilePdf,
  FaFileExcel,
  FaEdit,
} from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import AddRoleModal from '@/components/katibu/viongozi/dialogs/AddRoleModal';
import { Role } from '@/types/Role';
import WashirikaDetails from '../../washirika/components/WashirikaDetails';

interface Leader {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  user_id: number | null;
}

export default function OrodhaYaViongozi() {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('Yote');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // Fetch roles and leaders on mount
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
        protected: r.protected,
      }));
      setRoles(normalized);
    }
  };

  const fetchLeaders = async () => {
    const res = await apiFetch('/leaders');
    if (res.status !== 'error') {
      const activeOnly = (res.leaders ?? []).filter((l: any) => l.status !== 'retired');

      // Prioritize special roles
      const priorityOrder = ['mchungaji', 'katibu', 'mtunza hazina', 'admin'];
      const sorted = activeOnly.sort((a: Leader, b: Leader) => {
        const aPriority = priorityOrder.indexOf(a.role.toLowerCase());
        const bPriority = priorityOrder.indexOf(b.role.toLowerCase());
        if (aPriority === -1 && bPriority === -1) return a.name.localeCompare(b.name);
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });
      setLeaders(sorted);
    }
  };

  const isRoleProtected = (roleTitle: string) => {
    const role = roles.find((r) => r.title === roleTitle);
    return role?.protected ?? false;
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = leaders.map((l) => l.id);
    setSelectedIds(selectedIds.length === leaders.length ? [] : allIds);
  };

  const handleRemoveLeader = async () => {
    const protectedSelected = selectedIds.filter((id) => {
      const leader = leaders.find((l) => l.id === id);
      return leader && isRoleProtected(leader.role);
    });

    if (protectedSelected.length > 0) {
      alert(
        'Huwezi kufuta viongozi walio na nafasi za msingi kama "admin" au "mchungaji".'
      );
      return;
    }

    if (!confirm('Una uhakika unataka kuondoa viongozi hawa katika nafasi zao?')) return;

    for (const id of selectedIds) {
      await apiFetch(`/leaders/${id}`, { method: 'DELETE' });
    }

    await fetchLeaders();
    setSelectedIds([]);
  };

  const handleRetireLeader = async () => {
    if (!confirm('Thibitisha kustaafisha viongozi walioteuliwa.')) return;

    try {
      for (const id of selectedIds) {
        await apiFetch(`/leaders/${id}/retire`, { method: 'POST' });
      }
      await fetchLeaders();
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to retire leaders:', err);
      alert('Hitilafu imetokea wakati wa kustaafisha viongozi.');
    }
  };

  const exportToExcel = () => {
    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(leaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Viongozi');
      XLSX.writeFile(workbook, 'viongozi.xlsx');
    });
  };

  const exportToPDF = async () => {
    const jsPDFModule = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDFModule.default();
    doc.text('Orodha ya Viongozi', 14, 16);
    autoTable(doc, {
      head: [['Jina', 'Simu', 'Nafasi']],
      body: leaders.map((l) => [l.name, l.phone, l.role]),
      margin: { top: 20 },
    });
    doc.save('viongozi.pdf');
  };

  const filteredLeaders = leaders
    .filter(
      (l) =>
        (l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email?.toLowerCase().includes(search.toLowerCase()) ||
          l.phone?.includes(search)) &&
        (filterRole === 'Yote' || l.role === filterRole)
    )
    .sort((a, b) => (a.user_id === null && b.user_id !== null ? -1 : 1));

  // Show WashirikaDetails when a member row is selected
  if (selectedMemberId !== null) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <WashirikaDetails
          memberId={selectedMemberId}
          onBack={() => setSelectedMemberId(null)}
        />
      </div>
    );
  }

  return (
    <div className="text-sm p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Viongozi wa Kanisa</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Nafasi
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 w-full max-w-5xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center flex-grow gap-2 bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta jina, barua pepe au simu ya kiongozi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded shadow-sm"
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-white border border-blue-200 px-6 py-3 rounded shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.length} {selectedIds.length === 1 ? 'kiongozi' : 'viongozi'} wamechaguliwa
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleRetireLeader}
              className="px-4 py-2 rounded text-sm bg-yellow-500 hover:bg-yellow-400 text-white flex items-center gap-2"
            >
              <FaUserSlash /> Staafu
            </button>
            <button
              onClick={handleRemoveLeader}
              className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-500 text-white flex items-center gap-2"
            >
              <FaTrash /> Ondoa
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === leaders.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2">Jina</th>
              <th className="px-4 py-2">Simu</th>
              <th className="px-4 py-2">Nafasi</th>
              <th className="px-4 py-2 text-center">Hatua</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.length > 0 ? (
              filteredLeaders.map((l) => (
                <tr
                  key={l.id}
                  className={`${
                    selectedIds.includes(l.id) ? 'bg-blue-50' : ''
                  } odd:bg-white even:bg-gray-50 text-gray-800 cursor-pointer hover:bg-gray-100`}
                  onClick={() => {
                    if (l.user_id) setSelectedMemberId(l.user_id);
                  }}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(l.id)}
                      onChange={() => toggleSelect(l.id)}
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    <div>
                      <div>{l.name}</div>
                      <div className="text-gray-500 text-xs">{l.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{l.phone}</td>
                  <td className="px-4 py-2">
                    <span className="font-semibold px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {l.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditId(l.id)}
                      className="bg-yellow-500 text-white rounded p-1.5 hover:bg-yellow-600"
                      title="Hariri"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Hakuna viongozi waliopo kwa sasa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Leader Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Hariri Nafasi ya Kiongozi</h2>
            <div className="mb-4 text-gray-700 text-sm">
              Chagua nafasi mpya ya kiongozi huyu.
            </div>

            <select
              className="w-full border px-4 py-2 rounded text-sm text-gray-700"
              value={leaders.find((l) => l.id === editId)?.role || ''}
              onChange={(e) => {
                const newRole = e.target.value;
                setLeaders((prev) =>
                  prev.map((l) => (l.id === editId ? { ...l, role: newRole } : l))
                );
              }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                onClick={() => setEditId(null)}
              >
                Ghairi
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
                onClick={async () => {
                  const updatedLeader = leaders.find((l) => l.id === editId);
                  if (!updatedLeader) return;

                  try {
                    const res = await apiFetch(`/leaders/${editId}/update-role`, {
                      method: 'POST',
                      body: JSON.stringify({ role: updatedLeader.role }),
                    });

                    if (res.status === 'success') {
                      alert('Nafasi ya kiongozi imesasishwa.');
                      setEditId(null);
                      fetchLeaders();
                    } else {
                      alert(res.message || 'Hitilafu imetokea.');
                    }
                  } catch (err) {
                    console.error('Error:', err);
                    alert('Imeshindikana kusasisha nafasi.');
                  }
                }}
              >
                Hifadhi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isRoleModalOpen}
        setIsOpen={setIsRoleModalOpen}
        roles={roles}
        setRoles={setRoles}
        onRoleAdded={fetchRoles}
      />
    </div>
  );
}
