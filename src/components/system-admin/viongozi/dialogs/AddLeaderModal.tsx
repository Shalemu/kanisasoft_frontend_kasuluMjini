'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';

interface Role {
  id: number;
  title: string;
  protected?: boolean;
}

interface Member {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

interface AddLeaderModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  roles: Role[];
  members: Member[];
  setLeaders: React.Dispatch<React.SetStateAction<any[]>>;
  onLeaderAdded: () => Promise<void>;
}

export default function AddLeaderModal({
  isOpen,
  setIsOpen,
  roles = [],
  members = [],
  setLeaders,
  onLeaderAdded,
}: AddLeaderModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredMembers =
    query === ''
      ? members
      : members.filter((m) =>
          m.full_name.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.includes(query)
        );

  useEffect(() => {
    if (showOptions && inputRef.current && dropdownRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${rect.bottom + window.scrollY}px`;
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.width = `${rect.width}px`;
    }
  }, [showOptions, query]);

  const resetForm = () => {
    setSelectedRoleId(null);
    setSelectedMember(null);
    setQuery('');
    setShowOptions(false);
    setLoading(false);
    setIsOpen(false);
  };

  const handleAdd = async () => {
    if (!selectedRoleId) return alert('Tafadhali chagua nafasi ya uongozi.');
    if (!selectedMember) return alert('Tafadhali chagua mshirika kutoka kwenye orodha.');

    const payload = {
      role_id: selectedRoleId,
      user_id: selectedMember.id,
      full_name: selectedMember.full_name,
      phone: selectedMember.phone,
      email: selectedMember.email,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

      const res = await fetch(`${baseUrl}/leaders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Hitilafu ya kuhifadhi.');

      const newLeader = data.leader;
      const formattedLeader = {
        id: newLeader.id,
        name: newLeader.user?.full_name || newLeader.full_name,
        phone: newLeader.user?.phone || newLeader.phone,
        email: newLeader.user?.email || newLeader.email,
        role: newLeader.role?.title || '—',
      };

      setLeaders((prev) => [...prev, formattedLeader]);
      await onLeaderAdded();
      resetForm();
    } catch (err: any) {
      alert(`Hitilafu: ${err.message}`);
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
                  Ongeza Kiongozi Mpya
                </Dialog.Title>

                {/* Role Dropdown */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Nafasi ya Uongozi
                  </label>
                  <select
                    className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800"
                    value={selectedRoleId ?? ''}
                    onChange={(e) => {
                      setSelectedRoleId(Number(e.target.value));
                      setSelectedMember(null);
                      setQuery('');
                    }}
                  >
                    <option value="">-- Chagua nafasi --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Washirika Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Mshirika Aliyesajiliwa
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tafuta jina au simu..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                    className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800"
                  />

                  {showOptions && (
                    <div
                      ref={dropdownRef}
                      className="fixed z-[9999] max-h-64 overflow-auto bg-gray-900 border border-gray-600 rounded shadow-xl text-white text-sm"
                    >
                      {filteredMembers.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400">Hakuna mshirika</div>
                      ) : (
                        filteredMembers.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMember(m);
                              setQuery(`${m.full_name} (${m.phone})`);
                              setShowOptions(false);
                            }}
                            className={`cursor-pointer px-4 py-2 hover:bg-blue-700 ${
                              selectedMember?.id === m.id ? 'bg-blue-800' : ''
                            }`}
                          >
                            {m.full_name} ({m.phone})
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Inahifadhi...' : 'Hifadhi Kiongozi'}
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
