'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Role } from '@/types/Role'; // or relative like '../../types/Role'

interface AddRoleModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  onRoleAdded: () => void;
}

export default function AddRoleModal({
  isOpen,
  setIsOpen,
  roles,
  setRoles,
}: AddRoleModalProps) {
  const [title, setTitle] = useState('');
  const [requiresMember, setRequiresMember] = useState(true);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setRequiresMember(true);
    setIsOpen(false);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!title.trim()) return alert('Weka jina la nafasi');
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  
      const response = await fetch(`${baseUrl}/leadership-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          requires_member: requiresMember,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || 'Kuna tatizo');
  
      // 👇 Update based on correct response shape
      setRoles([...roles, data.role]);
  
      resetForm(); // ✅ Close modal after success
    } catch (error: any) {
      alert(`Hitilafu: ${error.message}`);
      setLoading(false);
    }
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={resetForm} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                <Dialog.Title as="h3" className="text-xl font-bold text-gray-800 mb-4">
                  Ongeza Nafasi Mpya
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Jina la Nafasi
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mfano: Katibu, Mchungaji"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="checkbox-member"
                      type="checkbox"
                      checked={requiresMember}
                      onChange={(e) => setRequiresMember(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="checkbox-member" className="text-sm text-gray-700">
                      Inahitaji kuwa mshirika?
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    disabled={loading}
                  >
                    Ghairi
                  </button>
                  <button
                    onClick={handleAdd}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Inahifadhi...' : 'Hifadhi Nafasi'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
