'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaUsers, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

interface Group {
  id: number;
  name: string;
  zone?: string;
  leader?: string;
  contact?: string;
  created_at?: string;
}

export default function MakundiTab({ onGroupSelect }: { onGroupSelect: (groupId: number) => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ name: '', zone: '', leader: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGroups(data.groups);
        setFilteredGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    const filtered = groups.filter(
      g =>
        g.name.toLowerCase().includes(q) ||
        (g.zone && g.zone.toLowerCase().includes(q)) ||
        (g.leader && g.leader.toLowerCase().includes(q)) ||
        (g.contact && g.contact.toLowerCase().includes(q))
    );
    setFilteredGroups(filtered);
  };

  const openAddDialog = () => {
    setFormData({ name: '', zone: '', leader: '', contact: '' });
    setEditingGroup(null);
    setIsOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setFormData({
      name: group.name,
      zone: group.zone || '',
      leader: group.leader || '',
      contact: group.contact || '',
    });
    setEditingGroup(group);
    setIsOpen(true);
  };

  const addOrUpdateGroup = async () => {
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
        setFormData({ name: '', zone: '', leader: '', contact: '' });
        setIsOpen(false);
      } else {
        setErrors(data.errors || {});
      }
    } catch (err) {
      console.error('Error saving group', err);
    } finally {
      setLoading(false);
    }
  };

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
      if (res.ok) {
        setGroups(prev => prev.filter(g => g.id !== id));
        setFilteredGroups(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error('Error deleting group', err);
    }
  };

  return (
    <div className="text-sm px-6 py-8 bg-gradient-to-tr from-white to-[#f0f4fc] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Makundi ya Kanisa</h1>
        <button
          onClick={openAddDialog}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow"
        >
          <FaPlus /> Ongeza Kundi
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Tafuta kwa jina, zone, kiongozi au mawasiliano"
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map(group => (
          <div
            key={group.id}
            className="bg-white border border-blue-100 p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center relative"
            onClick={() => onGroupSelect(group.id)}
          >
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-3">
              <FaUsers size={24} />
            </div>
            <div className="font-semibold text-gray-800 text-lg mb-1">{group.name}</div>
            <div className="text-xs text-gray-500">
              {group.zone && <div>Zone: {group.zone}</div>}
              {group.leader && <div>Kiongozi: {group.leader}</div>}
              {group.contact && <div>Mawasiliano: {group.contact}</div>}
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={e => { e.stopPropagation(); openEditDialog(group); }} title="Hariri">
                <FaEdit className="text-blue-500 hover:text-blue-700" />
              </button>
              <button onClick={e => { e.stopPropagation(); deleteGroup(group.id); }} title="Futa">
                <FaTrash className="text-red-500 hover:text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white max-w-sm w-full rounded-lg p-6 space-y-4 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-700">
              {editingGroup ? 'Hariri Kundi' : 'Ongeza Kundi Jipya'}
            </Dialog.Title>

            {['name', 'zone', 'leader', 'contact'].map(field => (
              <div key={field}>
                <input
                  type="text"
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleInputChange}
                  placeholder={
                    field === 'name'
                      ? 'Jina la kundi *'
                      : field === 'zone'
                      ? 'Zone (hiari)'
                      : field === 'leader'
                      ? 'Kiongozi (hiari)'
                      : 'Mawasiliano (hiari)'
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-black"
                />
                {errors[field] && (
                  <p className="text-red-600 text-xs mt-1">{errors[field][0]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Ghairi
              </button>
              <button
                onClick={addOrUpdateGroup}
                disabled={loading || !formData.name.trim()}
                className={`px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Inahifadhi...' : editingGroup ? 'Hariri' : 'Hifadhi'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
