'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

/* ======================
   Types
====================== */

export interface Role {
  id: number;
  title: string;
  protected?: boolean;
}

export interface Member {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
}

export interface Leader {
  id: number;
  user_id?: number;
  full_name: string;
  phone?: string;
  email?: string;
  roles: Role[];
}

interface LeaderModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  roles: Role[];
  members: Member[];
  currentLeaders: { user_id: number }[];
  leaderToEdit?: Leader | null; // if provided → edit mode
  onSaved: () => Promise<void>;
}

/* ======================
   Component
====================== */

export default function LeaderModal({
  isOpen,
  setIsOpen,
  roles,
  members,
  currentLeaders,
  leaderToEdit = null,
  onSaved,
}: LeaderModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && leaderToEdit) {
      setSelectedUserId(leaderToEdit.user_id ?? '');
      setSelectedRoleIds(leaderToEdit.roles.map(r => r.id));
      setFullName(leaderToEdit.full_name);
      setPhone(leaderToEdit.phone ?? '');
      setEmail(leaderToEdit.email ?? '');
    } else {
      setSelectedUserId('');
      setSelectedRoleIds([]);
      setFullName('');
      setPhone('');
      setEmail('');
    }
  }, [isOpen, leaderToEdit]);

  const closeModal = () => setIsOpen(false);

  // Submit handler
// Submit handler
const handleSave = async () => {
  if (!selectedRoleIds.length) {
    alert('⚠️ Tafadhali chagua angalau nafasi moja.');
    return;
  }

  // Prevent duplicate leader assignment
  if (
    selectedUserId &&
    !leaderToEdit &&
    currentLeaders.some(l => l.user_id === selectedUserId)
  ) {
    alert('⚠️ Mshirika huyu tayari ameteuliwa kuwa kiongozi.');
    return;
  }

  const payload = {
    user_id: selectedUserId ? Number(selectedUserId) : null,
    role_ids: selectedRoleIds,
    full_name: fullName,
    phone,
    email,
  };

  try {
    setLoading(true);

    if (leaderToEdit) {
      // EDIT existing leader → PUT /leaders/:id
      await apiFetch(`/leaders/${leaderToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } else {
      // ADD new leader → POST /leaders
      await apiFetch('/leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    await onSaved();
    closeModal();
  } catch (error: any) {
    alert(error?.message || 'Hitilafu imetokea.');
  } finally {
    setLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-bold mb-4">
              {leaderToEdit ? 'Hariri Kiongozi' : 'Ongeza Kiongozi Mpya'}
            </Dialog.Title>

            {/* Member select */}
            {!leaderToEdit && (
              <select
                className="w-full border rounded px-3 py-2 mb-4"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">-- Chagua mshirika --</option>
                {members.map((m) => {
                  const alreadyLeader = currentLeaders.some(
                    l => l.user_id === m.id
                  );
                  return (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={alreadyLeader}
                    >
                      {m.full_name}{alreadyLeader ? ' (Tayari kiongozi)' : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Full Name */}
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jina Kamili"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            {/* Phone */}
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Namba ya Simu"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Barua Pepe"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            {/* Roles multi-select */}
            <label className="block mb-2 font-medium">Chagua Nafasi</label>
            <select
              multiple
              className="w-full border rounded px-3 py-2 mb-6 h-32"
              value={selectedRoleIds.map(String)}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => Number(option.value)
                );
                setSelectedRoleIds(selectedOptions);
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={loading}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Ghairi
              </button>

              <button
                onClick={handleSave}
                disabled={loading || !fullName || !selectedRoleIds.length}
                className={`px-4 py-2 rounded text-white ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Inahifadhi...' : 'Hifadhi'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
