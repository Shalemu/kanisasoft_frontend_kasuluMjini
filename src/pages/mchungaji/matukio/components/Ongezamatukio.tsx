'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Group {
  id: number;
  name: string;
}

interface EventForm {
  title: string;
  date: string;
  time: string;
  description: string;
  category: string;
}

export default function OngezaMatukio() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<EventForm>({
    title: '',
    date: '',
    time: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.category) {
      Swal.fire({
        icon: 'warning',
        title: 'Taarifa Haijakamilika',
        text: 'Tafadhali jaza jina la tukio, tarehe na kundi.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      console.log('API Response:', data);

      if (data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Imefanikiwa',
          text: 'Tukio limehifadhiwa kikamilifu.',
        });

        setFormData({
          title: '',
          date: '',
          time: '',
          description: '',
          category: '',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Imeshindikana',
          text: data.message || 'Kuna tatizo la kuhifadhi tukio.',
        });
      }
    } catch (err) {
      console.error('Failed to save event:', err);

      Swal.fire({
        icon: 'error',
        title: 'Tatizo la Mtandao',
        text: 'Imeshindikana kuwasiliana na seva.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-[#1e293b] mb-6">
        Ongeza Tukio
      </h2>

      <form onSubmit={handleAddEvent}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Jina la Tukio
            </label>
            <input
              type="text"
              placeholder="Ingiza jina la tukio"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tarehe
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Muda
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kundi
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
            >
              <option value="">Chagua Kundi</option>
              <option value="Washirika">Washirika</option>

              {groups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Maelezo
          </label>
          <textarea
            rows={4}
            placeholder="Maelezo ya tukio"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1e293b] text-white px-6 py-3 rounded-xl hover:bg-[#0f172a] disabled:opacity-60"
          >
            {loading ? 'Inahifadhi...' : 'Hifadhi Tukio'}
          </button>
        </div>
      </form>
    </div>
  );
}