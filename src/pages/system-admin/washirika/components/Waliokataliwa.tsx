'use client';

import { useEffect, useState } from 'react';
import { FaUserCheck, FaTrash } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface User {
  id: number;
  full_name: string;
  phone?: string | null;
  membership_status?: string | null;
  deactivation_reason?: string | null;
  member_id?: number;
}

export default function Waliokataliwa() {
  const [members, setMembers] = useState<User[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const fetchRejected = async () => {
      try {
        const data: { users: User[] } = await apiFetch('/users');
        if (!data?.users) return;
        setMembers(data.users.filter(u => u.membership_status === 'rejected'));
      } catch (err) {
        console.error('Error fetching rejected members:', err);
      }
    };
    fetchRejected();
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
      console.warn(`Failed to set member ${member.full_name} to pending`);
    }
  }
  alert(`${activated} mshirika amewekwa kwenye status ya pending`);
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

  if (!members.length)
    return <p className="text-gray-500">Hakuna washirika waliokataliwa.</p>;

  return (
    <div className="bg-white rounded shadow border border-gray-200 p-4 overflow-x-auto">
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
      <div className="grid grid-cols-12 items-center px-6 py-3 border-b border-gray-200 text-sm font-semibold text-gray-600">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selected.length === members.length}
            onChange={toggleSelectAll}
          />
        </div>
        <div className="col-span-4">Jina</div>
        <div className="col-span-3">Simu</div>
        <div className="col-span-4">Sababu ya Kukataa</div>
      </div>

      {/* Table Body */}
      {members.map((m, idx) => (
        <div
          key={m.id}
          className="grid grid-cols-12 gap-3 items-center px-6 py-4 border-t border-gray-100 text-sm hover:bg-gray-50"
        >
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selected.includes(m.id)}
              onChange={() => toggleSelect(m.id)}
            />
          </div>
          <div className="col-span-4">{m.full_name}</div>
          <div className="col-span-3">{m.phone || '—'}</div>
          <div className="col-span-4">{m.deactivation_reason || '—'}</div>
        </div>
      ))}
    </div>
  );
}