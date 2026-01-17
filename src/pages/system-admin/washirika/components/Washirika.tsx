'use client';

import { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaUserPlus,
  FaFilter,
  FaSms,
  FaCheck,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import WashirikaDetails from './WashirikaDetails';
import { apiFetch } from '@/lib/api';

interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;
  user_id: number;
  full_name: string;
  zone: string;
  email: string;
  phone: string;
  role: string | null;
  created_at: string;
  member_id?: number;
  deactivation_reason?: string;
  membership_status?: string;
  groups?: Group[];
  membership_number?: string;
}

export default function Washirika({ onAddNew }: { onAddNew: () => void }) {
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [deactivationReason, setDeactivationReason] = useState<string | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const ACTIVE_STATUS = 'active';

  const allSelected = selectedMembers.length === members.length;
  const isAdminSelected = selectedMembers.some(id => members.find(m => m.id === id)?.role === 'admin');

  useEffect(() => {
    async function fetchMembers() {
      const data = await apiFetch('/users');
      if (data?.users) {
        const users = data.users.map((u: any) => ({
          id: u.member_id || u.id,
          user_id: u.id,
          full_name: u.full_name,
          zone:u.zone,
          email: u.email,
          phone: u.phone,
          gender: u.gender,
          birth_date: u.birth_date,
          birth_place: u.birth_place,
          role: u.role,
          created_at: u.created_at,
          membership_status: u.membership_status,
          deactivation_reason: u.deactivation_reason,
          groups: u.groups || [],
          member_id: u.member_id || null,
          membership_number: u.membership_number || '—',
        }));

        const sorted = users.sort((a: User, b: User) => {
          if (a.role === 'admin') return -1;
          if (b.role === 'admin') return 1;
          return 0;
        });

        setMembers(sorted);
      }
    }

    async function fetchGroups() {
      const data = await apiFetch('/groups');
      if (data?.groups) setGroups(data.groups);
    }

    fetchMembers();
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedMembers(allSelected ? [] : members.map(m => m.id));
  };

  const handleExportExcel = () => {
    const exportData = members.map((m, i) => ({
      '#': i + 1,
      Jina: m.full_name,
      Simu: m.phone,
      zone: m.zone,
      Nafasi: m.role || '—',
      Makundi: m.groups?.map(g => g.name).join(', ') || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Washirika');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'washirika.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const tableData = members.map((m, i) => [
      i + 1,
      m.full_name,
      m.phone,
      m.role || '—',
      m.groups?.map(g => g.name).join(', ') || '—'
    ]);
    doc.text('Orodha ya Washirika', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [['#', 'Jina', 'Simu', 'zone']],
      body: tableData,
    });
    doc.save('washirika.pdf');
  };

  const handleAssignToGroups = async () => {
    const assignments: { groupId: number; memberId: number }[] = [];
    for (const userId of selectedMembers) {
      const user = members.find(m => m.id === userId);
      if (!user?.member_id) continue;
      for (const groupId of selectedGroupIds) {
        const alreadyInGroup = user.groups?.some(g => g.id === groupId);
        if (!alreadyInGroup) {
          assignments.push({ groupId, memberId: user.member_id });
        }
      }
    }

    if (assignments.length === 0) {
      alert('Hakuna mshirika mpya wa kuongeza kwenye makundi haya.');
      return;
    }

    let successful = 0;
    for (const { groupId, memberId } of assignments) {
      try {
        await apiFetch(`/groups/${groupId}/add-member`, {
          method: 'POST',
          body: JSON.stringify({ member_id: memberId }),
        });
        successful++;
      } catch (error) {
        console.warn(`Failed to add member ${memberId} to group ${groupId}: ${error}`);
      }
    }

    if (successful > 0) {
      alert(`${successful} mshirika ameongezwa kwenye kundi/kundi.`);
    } else {
      alert(`⚠️ Hakuna aliyefanikiwa kuongezwa. Wengine tayari walikuwa kwenye makundi hayo.`);
    }

    setGroupDialogOpen(false);
    setSelectedGroupIds([]);
  };

  const handleApprove = async (userId: number) => {
    const response = await apiFetch('/authorize-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });

    if (response.status === 'success') {
      const approvedMemberId = response.member.id;
      setMembers(prev =>
        prev.map(m =>
          m.user_id === userId
            ? { ...m, role: 'mshirika', member_id: approvedMemberId }
            : m
        )
      );
      alert('Mshirika ameidhinishwa.');
    } else {
      alert(response.message || 'Imeshindikana.');
    }
  };

  const handleReject = async (id: number, role: string | null) => {
    if (role === 'admin') return;
    const response = await apiFetch(`/users/${id}`, { method: 'DELETE' });
    if (response.status === 'success') {
      setMembers(prev => prev.filter(m => m.id !== id));
    } else {
      alert(response.message || 'Kufuta kumeshindikana.');
    }
  };

  const reasons = [
    { label: 'Amehama', value: 'Amehama' },
    { label: 'Ametegwa ushirika', value: 'Ametegwa ushirika' },
    { label: 'Amefariki', value: 'Amefariki' },
    { label: 'Amepotea', value: 'Amepotea' },
  ];

  const isAnyAlreadyInGroup = selectedMembers.some(memberId => {
    const user = members.find(m => m.id === memberId);
    return user?.groups?.some(g => selectedGroupIds.includes(g.id));
  });

  const handleDeactivate = () => {
    if (isAdminSelected) return;
    setShowReasonDialog(true);
  };

  const handleSingleDeactivate = (name: string, role: string | null) => {
    if (role === 'admin') return;
    alert(`Deactivated ${name}`);
  };

  if (selectedMemberId) {
    return (
      <WashirikaDetails
        memberId={selectedMemberId}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }
  return (
    <>
      {/* Top Heading and Buttons */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Washirika</h1>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            onClick={() => router.push(`/register?from=${pathname}`)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
          >
            <FaUserPlus /> Ongeza Washirika
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
          >
            📥 Pakua Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            🧾 Pakua PDF
          </button>
        </div>
      </div>
  
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="🔍 Tafuta kwa jina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          />
  
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full sm:w-64 border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          >
            <option value="">Makundi yote</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {showReasonDialog && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Sababu ya Kupoteza Ushirika</h2>

      <div className="space-y-3 text-sm text-gray-700">
        {reasons.map(({ label, value }) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              name="deactivationReason"
              value={value}
              checked={deactivationReason === value}
              onChange={() => setDeactivationReason(value)}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => {
            setShowReasonDialog(false);
            setDeactivationReason(null);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          Ghairi
        </button>
        <button
          onClick={async () => {
            if (!deactivationReason) {
              alert('Tafadhali chagua sababu ya deactivation.');
              return;
            }

            let success = 0;
            for (const userId of selectedMembers) {
              const user = members.find(m => m.id === userId);
              if (!user?.member_id) continue;

              try {
                const response = await apiFetch(`/members/${user.member_id}/deactivate`, {
                  method: 'POST',
                  body: JSON.stringify({ reason: deactivationReason }),
                });

                if (response.status === 'success') {
                  success++;
                }
              } catch (err) {
                console.error(`❌ Failed to deactivate member ${user?.full_name}:`, err);
              }
            }

            alert(`✅ ${success} mshirika amepotezwa kwa sababu ya "${deactivationReason}".`);
            setShowReasonDialog(false);
            setDeactivationReason(null);
          }}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded"
        >
          Thibitisha
        </button>
      </div>
    </div>
  </div>
)}

<div className="mb-4 text-gray-700 font-semibold text-sm sm:text-base">
  Jumla ya Washirika: {
    members.filter(
      (m) =>
        m.role !== 'mchungaji' &&
        (m.membership_status === ACTIVE_STATUS || m.membership_status === null)
    ).length
  }
</div>

{selectedMembers.length > 0 && (
  <div className="mb-4 bg-white border border-blue-200 px-4 sm:px-6 py-3 rounded shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm font-medium text-gray-600">
      {selectedMembers.length} washirika wamechaguliwa
    </p>
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <button
        onClick={() => setGroupDialogOpen(true)}
        className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
      >
        <FaUsers /> Weka Kundi
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
      >
        <FaSms /> Tuma SMS
      </button>
      <button
        onClick={handleDeactivate}
        disabled={isAdminSelected}
        className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
          isAdminSelected
            ? 'bg-yellow-200 text-white cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-400 text-white'
        }`}
      >
        🛡️ Deactivate
      </button>
    </div>
  </div>
)}

{groupDialogOpen && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Chagua Makundi ya Kuongeza
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto text-sm text-gray-700 pr-1">
        {groups.map(group => (
          <label key={group.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedGroupIds.includes(group.id)}
              onChange={e => {
                setSelectedGroupIds(prev =>
                  e.target.checked
                    ? [...prev, group.id]
                    : prev.filter(id => id !== group.id)
                );
              }}
            />
            {group.name}
          </label>
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => setGroupDialogOpen(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          Ghairi
        </button>
        <button
          disabled={
            selectedGroupIds.length === 0 ||
            selectedMembers.every(id => {
              const user = members.find(m => m.id === id);
              return (
                !user?.member_id ||
                selectedGroupIds.every(gid =>
                  user.groups?.some(g => g.id === gid)
                )
              );
            })
          }
          onClick={handleAssignToGroups}
          className={`px-4 py-2 text-sm rounded text-white ${
            isAnyAlreadyInGroup
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          Hifadhi
        </button>
      </div>
    </div>
  </div>
)}

<div className="bg-white rounded shadow border border-gray-200 overflow-x-auto">
  {/* Table Header */}
  <div className="hidden md:grid grid-cols-12 items-center px-6 py-3 border-b text-sm font-semibold text-gray-600">
  <div className="col-span-1">
    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
  </div>
  <div className="col-span-4">Jina</div>
  <div className="col-span-3">Namba ya Ushirika</div>
  <div className="col-span-2">Simu</div>
  <div className="col-span-2">Zone</div>
</div>


  {members
  .filter(
    (m) =>
      m.role !== 'mchungaji' &&
      (m.membership_status === ACTIVE_STATUS || m.membership_status === null) &&
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedGroupFilter === '' ||
          (m.groups && m.groups.some((g) => g.name === selectedGroupFilter)))
    )
    .map((member, index) => (
      <div
        key={member.id}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-4 md:px-6 py-4 border-t border-gray-100 text-sm hover:bg-gray-50"
      >
        {/* Index + checkbox */}
        <div className="flex items-center md:col-span-1">
          <input
            type="checkbox"
            checked={selectedMembers.includes(member.id)}
            onChange={() => toggleSelect(member.id)}
            className="mr-2"
          />
          <span className="font-semibold">{index + 1}</span>
        </div>

        <div className="flex flex-col md:col-span-3">
          <button
            onClick={() => setSelectedMemberId(member.id)}
            className="text-left font-semibold text-gray-800 hover:underline text-base"
            >
            {member.full_name}
          </button>
          <span className="text-xs text-gray-500">
            <strong>{member.membership_number || '—'}</strong>
          </span>
        </div>

        {/* Nafasi */}
        {/* <div className="md:col-span-2">
          <span
            className={`text-xs font-semibold capitalize ${
              member.role === 'admin'
                ? 'text-red-600'
                : member.membership_status === 'inactive'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {member.role === 'admin'
              ? 'Admin'
              : member.membership_status === 'inactive'
              ? 'Ameondolewa Ushirika'
              : member.role || 'hakuna nafasi'}
          </span>
        </div> */}

        {/* Simu */}
        <div className="md:col-span-2 text-gray-700 font-semibold">
          {member.phone}
        </div>

        {/* Makundi */}
        {/* <div className="md:col-span-2 text-gray-600 capitalize">
          {member.groups?.length
            ? member.groups.map((g) => g.name).join(', ')
            : '—'}
        </div> */}
         {/* Zone */}
  <div className="md:col-span-2 text-gray-600 capitalize">
    {member.zone || '—'}
  </div>

        {/* Approve / Reject or Status */}
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {member.role === null || !member.membership_number ? (
            <>
              <button
                onClick={() => handleApprove(member.user_id)}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <FaCheck /> Idhinisha
              </button>
              <button
                onClick={() => handleReject(member.user_id, member.role)}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <FaTimes /> Kataa
              </button>
            </>
          ) : (
            <div
              className={`text-white px-3 py-1 rounded text-sm flex items-center gap-2 ${
                member.role === 'admin' ? 'bg-blue-700' : 'bg-gray-400'
              }`}
            >
              <FaCheck /> {member.role === 'admin' ? 'Admin' : 'Imeidhinishwa'}
            </div>
          )}
        </div>
      </div>
    ))}
</div>
    </>
  );
} 