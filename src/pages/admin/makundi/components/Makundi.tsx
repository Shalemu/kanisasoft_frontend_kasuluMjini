'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaUsers, FaSearch, FaEdit, FaTrash, FaWhatsapp, FaLink } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';

interface Leader {
  full_name: string;
  membership_number: string;
}

interface Group {
  id: number;
  name: string;
  leader?: Leader | null;
  whatsapp_link?: string | null;
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
    whatsapp_link: ''
  });

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
     Swal.fire({
  title: 'Hitilafu!',
  text: 'Imeshindikana kupata makundi.',
  icon: 'error',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f44336',
});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setFormData({ name: '', leader_membership_number: '', whatsapp_link: '' });
    setEditingGroup(null);
    setIsOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setFormData({
      name: group.name,
      leader_membership_number: group.leader?.membership_number || '',
      whatsapp_link: group.whatsapp_link || ''
    });
    setEditingGroup(group);
    setIsOpen(true);
  };

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

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
        Swal.fire({
        title: 'Imefanikiwa!',
        text: data.message || 'Kundi limehifadhiwa kikamilifu.',
        icon: 'success',
        confirmButtonText: 'Sawa',
        confirmButtonColor: '#f0ce32',
      });
      } else {
        if (data.errors) setErrors(data.errors);
        if (data.message) showNotification('error', data.message);
      }
    } catch (err) {
      console.error('Error saving group', err);
     Swal.fire({
    title: 'Hitilafu!',
    text: 'Imeshindikana kuhifadhi kundi.',
    icon: 'error',
    confirmButtonText: 'Sawa',
    confirmButtonColor: '#f44336', // red for error
  });
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: number) => {
  Swal.fire({
    title: 'Uhakika?',
    text: 'Una uhakika unataka kufuta kundi hili?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ndio, futa',
    cancelButtonText: 'Hapana',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#3085d6',
  }).then(async (result) => {
    if (!result.isConfirmed) return; // User cancelled

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
        // Remove the deleted group from state
        setGroups(prev => prev.filter(g => g.id !== id));
        setFilteredGroups(prev => prev.filter(g => g.id !== id));

        Swal.fire({
          title: 'Imefanikiwa!',
          text: data.message || 'Kundi limefutwa kikamilifu.',
          icon: 'success',
          confirmButtonText: 'Sawa',
          confirmButtonColor: '#f0ce32',
        });
      } else {
        Swal.fire({
          title: 'Hitilafu!',
          text: data.message || 'Imeshindikana kufuta kundi.',
          icon: 'error',
          confirmButtonText: 'Sawa',
          confirmButtonColor: '#f44336',
        });
      }
    } catch (err) {
      console.error('Error deleting group', err);
      Swal.fire({
        title: 'Hitilafu!',
        text: 'Imeshindikana kufuta kundi.',
        icon: 'error',
        confirmButtonText: 'Sawa',
        confirmButtonColor: '#f44336',
      });
    }
  });
};
  return (
    <div className="px-6 py-8 bg-gradient-to-tr from-white to-[#f0f4fc] min-h-screen relative">
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers className="text-blue-600" /> Makundi ya Kanisa
        </h1>
        <button
          onClick={openAddDialog}
          className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-500 transition"
        >
          <FaPlus /> Ongeza Kundi
        </button>
      </div>

      <div className="mb-6 flex gap-2 items-center max-w-md">
        <FaSearch className="text-gray-400" />
        <input
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Tafuta jina / kiongozi / membership no"
          className="flex-1 border px-4 py-2 rounded shadow-sm"
        />
      </div>

      {/* GROUP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <div
            key={group.id}
            onClick={() => onGroupSelect(group.id)}
            className="bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 flex flex-col justify-between relative"
          >
            <div className="flex justify-center mb-4">
              <FaUsers size={32} className="text-blue-500" />
            </div>
            <h3 className="font-semibold text-center text-lg">{group.name}</h3>

            {group.leader && (
              <p className="text-xs text-center text-gray-500 mt-1">
                Kiongozi: {group.leader.full_name} ({group.leader.membership_number})
              </p>
            )}

            {group.whatsapp_link && (
              <p className="text-xs text-center text-green-600 mt-2 flex justify-center items-center gap-1">
                <FaWhatsapp /> 
                <a href={group.whatsapp_link} target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
                  Ungana WhatsApp <FaLink />
                </a>
              </p>
            )}

            <div className="absolute top-3 right-3 flex gap-2">
              <FaEdit
                className="text-blue-500 hover:text-blue-700"
                onClick={e => {
                  e.stopPropagation();
                  openEditDialog(group);
                }}
              />
              <FaTrash
                className="text-red-500 hover:text-red-700"
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
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4 shadow-lg">
            <Dialog.Title className="font-semibold text-lg">
              {editingGroup ? 'Hariri Kundi' : 'Ongeza Kundi'}
            </Dialog.Title>

            <input
              name="name"
              placeholder="Jina la kundi *"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.join(', ')}</p>}

            <input
              name="leader_membership_number"
              placeholder="Membership No ya kiongozi"
              value={formData.leader_membership_number}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.leader_membership_number && (
              <p className="text-red-500 text-sm">{errors.leader_membership_number.join(', ')}</p>
            )}

            <input
              name="whatsapp_link"
              placeholder="Weka link ya WhatsApp Group"
              value={formData.whatsapp_link || ''}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.whatsapp_link && (
              <p className="text-red-500 text-sm">{errors.whatsapp_link.join(', ')}</p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Ghairi</button>
              <button
                onClick={saveGroup}
                disabled={loading || !formData.name}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
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