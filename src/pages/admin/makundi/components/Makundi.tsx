'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaUsers, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

interface Leader {
  full_name: string;
  membership_number: string;
}

interface Group {
  id: number;
  name: string;
  leader?: Leader | null;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function MakundiTab({
  onGroupSelect,
}: {
  onGroupSelect: (groupId: number) => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    leader_membership_number: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  /* ================= FETCH ================= */
  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await res.json();
      if (data.status === 'success') {
        setGroups(data.groups);
        setFilteredGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
      showNotification('error', 'Imeshindikana kupata makundi.');
    }
  };

  /* ================= FORM ================= */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setFormData({ name: '', leader_membership_number: '' });
    setEditingGroup(null);
    setIsOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setFormData({
      name: group.name,
      leader_membership_number: group.leader?.membership_number || '',
    });
    setEditingGroup(group);
    setIsOpen(true);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);

    const filtered = groups.filter(
      g =>
        g.name.toLowerCase().includes(q) ||
        g.leader?.full_name.toLowerCase().includes(q) ||
        g.leader?.membership_number.toLowerCase().includes(q)
    );

    setFilteredGroups(filtered);
  };

  /* ================= NOTIFICATION ================= */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000); // auto hide after 4s
  };

  /* ================= SAVE ================= */
  const saveGroup = async () => {
    setLoading(true);
    setErrors({});

    try {
      const url = editingGroup
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${editingGroup.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`;
      const method = editingGroup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchGroups();
        setIsOpen(false);
        showNotification('success', data.message || 'Kundi limehifadhiwa kikamilifu.');
      } else {
        // Show validation errors or API error message
        if (data.errors) setErrors(data.errors);
        if (data.message) showNotification('error', data.message);
      }
    } catch (err) {
      console.error('Error saving group', err);
      showNotification('error', 'Imeshindikana kuhifadhi kundi.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteGroup = async (id: number) => {
    if (!confirm('Una uhakika unataka kufuta kundi hili?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setGroups(prev => prev.filter(g => g.id !== id));
        setFilteredGroups(prev => prev.filter(g => g.id !== id));
        showNotification('success', data.message || 'Kundi limefutwa kikamilifu.');
      } else {
        showNotification('error', data.message || 'Imeshindikana kufuta kundi.');
      }
    } catch (err) {
      console.error('Error deleting group', err);
      showNotification('error', 'Imeshindikana kufuta kundi.');
    }
  };

  /* ================= UI ================= */
  return (
    <div className="px-6 py-8 bg-gradient-to-tr from-white to-[#f0f4fc] min-h-screen relative">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow-md z-50 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">👥 Makundi ya Kanisa</h1>
        <button
          onClick={openAddDialog}
          className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <FaPlus /> Ongeza Kundi
        </button>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <FaSearch />
        <input
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Tafuta jina / kiongozi / membership no"
          className="flex-1 border px-4 py-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <div
            key={group.id}
            onClick={() => onGroupSelect(group.id)}
            className="bg-white p-6 rounded-xl shadow cursor-pointer relative"
          >
            <div className="mb-2 flex justify-center">
              <FaUsers size={28} className="text-blue-500" />
            </div>

            <h3 className="font-semibold text-center">{group.name}</h3>

            {group.leader && (
              <p className="text-xs text-center text-gray-500 mt-1">
                {group.leader.full_name} ({group.leader.membership_number})
              </p>
            )}

            <div className="absolute top-2 right-2 flex gap-2">
              <FaEdit
                className="text-blue-500"
                onClick={e => {
                  e.stopPropagation();
                  openEditDialog(group);
                }}
              />
              <FaTrash
                className="text-red-500"
                onClick={e => {
                  e.stopPropagation();
                  deleteGroup(group.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
            <Dialog.Title className="font-semibold">
              {editingGroup ? 'Hariri Kundi' : 'Ongeza Kundi'}
            </Dialog.Title>

            <input
              name="name"
              placeholder="Jina la kundi *"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />

            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.join(', ')}</p>
            )}

            <input
              name="leader_membership_number"
              placeholder="Membership No ya kiongozi"
              value={formData.leader_membership_number}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />

            {errors.leader_membership_number && (
              <p className="text-red-500 text-sm">
                {errors.leader_membership_number.join(', ')}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)}>Ghairi</button>
              <button
                onClick={saveGroup}
                disabled={loading || !formData.name}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Inahifadhi...' : 'Hifadhi'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
