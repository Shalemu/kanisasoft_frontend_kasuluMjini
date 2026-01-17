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
  id: number;          // ✅ THIS IS user_id
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface AddLeaderModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  roles: Role[];
  members: Member[];                     // list of USERS
  currentLeaders: { user_id: number }[]; // existing leaders
  selectedMember?: Member | null;        // preselected user
  onLeaderAdded: () => Promise<void>;
}

/* ======================
   Component
====================== */

export default function AddLeaderModal({
  isOpen,
  setIsOpen,
  roles,
  members,
  currentLeaders,
  selectedMember,
  onLeaderAdded,
}: AddLeaderModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  /* ======================
     Reset state on open/close
  ====================== */
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(selectedMember?.id ?? '');
    } else {
      setSelectedRoleId('');
      setSelectedUserId('');
    }
  }, [isOpen, selectedMember]);

  const closeModal = () => setIsOpen(false);

  /* ======================
     Submit
  ====================== */
  const handleAdd = async () => {
    if (!selectedRoleId) {
      alert('⚠️ Tafadhali chagua nafasi.');
      return;
    }

    if (
      selectedUserId &&
      currentLeaders.some(l => l.user_id === selectedUserId)
    ) {
      alert('⚠️ Mshirika huyu tayari ameteuliwa kuwa kiongozi.');
      return;
    }

    const payload = {
      role_id: Number(selectedRoleId),
      user_id: Number(selectedUserId),
    };

    try {
      setLoading(true);

      const res = await apiFetch('/leaders', {
        method: 'POST',
        body: payload,
      });

      if (res.status === 'error') {
        alert(res.message || 'Imeshindikana kuongeza kiongozi.');
        return;
      }

      await onLeaderAdded();
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-bold mb-4">
              Ongeza Kiongozi Mpya
            </Dialog.Title>

            {/* Selected member info */}
            <div className="mb-4 text-sm">
              {selectedMember ? (
                <>
                  <strong>Mshirika:</strong> {selectedMember.full_name}
                </>
              ) : (
                'Chagua mshirika kutoka kwenye orodha.'
              )}
            </div>

            {/* Member select */}
            {!selectedMember && (
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
                      {m.full_name}
                      {alreadyLeader ? ' (Tayari kiongozi)' : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Role select */}
            <select
              className="w-full border rounded px-3 py-2 mb-6"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
            >
              <option value="">-- Chagua nafasi --</option>
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
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Ghairi
              </button>

              <button
                onClick={handleAdd}
                disabled={loading || !selectedRoleId || !selectedUserId}
                className={`px-4 py-2 rounded text-white ${
                  loading
                    ? 'bg-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700'
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
