'use client';

import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaUser, FaUserCheck, FaTrash } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface User {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: string | null;
  member_id?: number;
  membership_status?: string;
  deactivation_reason?: string | null;
}

export default function Waliopotea() {
  const [members, setMembers] = useState<User[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const statusLabels: Record<string, string> = {
    detained: 'Ametegwa',
    lost: 'Amepotea',
    left: 'Amehama',
    deceased: 'Amefariki',
  };

  useEffect(() => {
    async function fetchLostMembers() {
      try {
        const data = await apiFetch('/users');
        if (data?.users) {
          const lostMembers = data.users.filter(
            (u: any) =>
              ['detained', 'lost', 'left', 'deceased'].includes(u.membership_status)
          );
          setMembers(lostMembers);
        }
      } catch (err) {
        console.error('Error fetching lost members:', err);
      }
    }

    fetchLostMembers();
  }, []);

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === members.length) {
      setSelected([]);
    } else {
      setSelected(members.map(m => m.id));
    }
  };

  const handleActivate = async () => {
    let activated = 0;
    for (const id of selected) {
      const member = members.find(m => m.id === id);
      if (!member?.member_id) continue;
      try {
        await apiFetch(`/members/${member.member_id}/activate`, {
          method: 'POST',
        });
        activated++;
      } catch (e) {
        console.warn(`Failed to activate member ${member.full_name}`);
      }
    }
    alert(`${activated} mshirika amewekwa tena kwenye ushirika`);
    setMembers(prev => prev.filter(m => !selected.includes(m.id)));
    setSelected([]);
  };

  const handleDelete = async () => {
    if (!window.confirm('Una uhakika unataka kufuta hawa washirika kabisa?')) return;

    let deleted = 0;
    for (const id of selected) {
      const member = members.find(m => m.id === id);
      if (!member?.member_id) continue;

      try {
        await apiFetch(`/members/${member.member_id}/delete-both`, {
          method: 'DELETE',
        });
        deleted++;
      } catch (e) {
        console.warn(`Failed to delete user + member ID ${member.member_id}`);
      }
    }

    alert(`🗑️ ${deleted} washirika wamefutwa kabisa (member + user)`);
    setMembers(prev => prev.filter(m => !selected.includes(m.id)));
    setSelected([]);
  };

  if (members.length === 0) {
    return <div className="text-center py-16 text-gray-500">Hakuna waliopotea kwa sasa.</div>;
  }

  return (
    <div className="bg-white rounded shadow border border-gray-200 p-4 overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Washirika Waliopotea</h1>
        <p className="text-gray-600">Jumla: {members.length}</p>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 bg-yellow-50 border border-yellow-300 px-6 py-3 rounded shadow-sm">
          <p className="text-sm font-medium text-yellow-800">
            {selected.length} washirika walioteuliwa
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleActivate}
              className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              <FaUserCheck /> Rudisha Ushirika
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
            >
              <FaTrash /> Futa
            </button>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-11 items-center px-6 py-3 border-b border-gray-200 text-sm font-semibold text-gray-600">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selected.length === members.length}
            onChange={toggleSelectAll}
          />
        </div>
        <div className="col-span-3">Jina</div>
        <div className="col-span-2">Nafasi</div>
        <div className="col-span-3">Simu</div>
        <div className="col-span-2">Sababu</div>
      </div>

      {/* Table Body */}
      {members.map(member => (
        <div
          key={member.id}
          className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center px-4 md:px-6 py-4 border-t border-gray-100 text-sm hover:bg-gray-50"
        >
          <div className="flex md:col-span-1">
            <input
              type="checkbox"
              checked={selected.includes(member.id)}
              onChange={() => toggleSelect(member.id)}
            />
          </div>

          {/* Avatar + Name */}
          <div className="flex gap-3 items-center md:col-span-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
              <FaUser className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{member.full_name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="md:col-span-2 capitalize font-semibold text-yellow-700">
            {member.role || '—'}
          </div>

          {/* Phone */}
          <div className="md:col-span-3 font-semibold text-gray-700">
            {member.phone}
          </div>

          {/* Status */}
          <div className="md:col-span-2 text-yellow-600 font-bold flex gap-2 items-center capitalize">
            {member.membership_status === 'detained' && <FaTimes />}
            {member.membership_status === 'lost' && <FaTimes />}
            {member.membership_status === 'left' && <FaTimes />}
            {member.membership_status === 'deceased' && <FaTimes />}
            {statusLabels[member.membership_status || ''] || 'Haijulikani'}
          </div>
        </div>
      ))}
    </div>
  );
}