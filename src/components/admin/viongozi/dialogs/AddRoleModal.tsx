'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Role } from '@/types/Role';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;       // called after add/edit to refresh roles
  role?: Role | null;         // if provided → edit mode
}

export default function AddRoleModal({
  isOpen,
  onClose,
  onSaved,
  role = null,
}: AddRoleModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill input when editing
  useEffect(() => {
    if (isOpen) {
      setTitle(role ? role.title : '');
    }
  }, [role, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) {
    Swal.fire({
  title: 'Tahadhari!',
  text: 'Weka jina la nafasi',
  icon: 'warning',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
      return;
    }

    setLoading(true);

    try {
      if (role) {
        // EDIT role
        await apiFetch(`/leadership-roles/${role.id}`, {
          method: 'PUT',
          body: { title },
        });
      } else {
        // ADD new role
        await apiFetch('/leadership-roles', {
          method: 'POST',
          body: { title },
        });
      }

      onSaved();   // refresh roles table
      onClose();   // close modal
    } catch (error: any) {
   Swal.fire({
  title: 'Hitilafu!',
  text: error?.message || 'Hitilafu imetokea',
  icon: 'error',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border">
              <Dialog.Title className="text-lg font-bold text-gray-800 mb-4">
                {role ? 'Hariri Nafasi' : 'Ongeza Nafasi'}
              </Dialog.Title>

              {/* Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mfano: Katibu"
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Ghairi
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Inahifadhi...' : role ? 'Hifadhi' : 'Ongeza'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
