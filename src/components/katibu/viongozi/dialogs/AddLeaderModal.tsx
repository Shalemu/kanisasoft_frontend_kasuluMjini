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

/** Pivot assignments from API */
export interface RoleAssignment {
  user_id: number;
  role_id: number;
}

interface AddLeaderModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  roles: Role[];
  members: Member[];
  selectedMember?: Member | null;
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
  selectedMember,
  onLeaderAdded,
}: AddLeaderModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);

  /* ======================
     Fetch assignments from API
  ====================== */
  const fetchAssignments = async () => {
    try {
      const res = await apiFetch('/user-role-assignments');
      if (res.status === 'success') {
        setAssignments(res.assignments);
      }
    } catch (error) {
      console.error('Failed to fetch role assignments', error);
    }
  };

  /* ======================
     Reset state on open/close
  ====================== */
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(selectedMember?.id ?? '');
      setSelectedRoleId('');
      fetchAssignments();
    } else {
      setSelectedUserId('');
      setSelectedRoleId('');
    }
  }, [isOpen, selectedMember]);

  const closeModal = () => setIsOpen(false);

  /* ======================
     Submit
  ====================== */
  const handleAdd = async () => {
    if (!selectedUserId || !selectedRoleId) {
      alert('⚠️ Tafadhali chagua mshirika na nafasi.');
      return;
    }

    // Prevent assigning the same role twice
    const alreadyHasRole = assignments.some(
      a => a.user_id === selectedUserId && a.role_id === selectedRoleId
    );

    if (alreadyHasRole) {
      alert('⚠️ Mshirika huyu tayari ana nafasi hii.');
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch('/users/assign-roles', {
        method: 'POST',
        body: {
          user_id: Number(selectedUserId),
          roles: [Number(selectedRoleId)],
        },
      });

      if (res.status === 'error') {
        alert(res.message || 'Imeshindikana kuongeza nafasi.');
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
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
              >
                <option value="">-- Chagua mshirika --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            )}

            {/* Role select */}
            <select
              className="w-full border rounded px-3 py-2 mb-6"
              value={selectedRoleId}
              onChange={(e) =>
                setSelectedRoleId(
                  e.target.value ? Number(e.target.value) : ''
                )
              }
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
