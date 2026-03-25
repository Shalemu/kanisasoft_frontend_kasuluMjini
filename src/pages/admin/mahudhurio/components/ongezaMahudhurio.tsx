'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

interface Props {
  onClose: () => void;
  onAdded?: () => void; // Callback to refresh parent attendance list
}

export default function OngezaMahudhurio({ onClose, onAdded }: Props) {
  const [type, setType] = useState('Jumapili');
  const [date, setDate] = useState('');
  const [children, setChildren] = useState(0);
  const [women, setWomen] = useState(0);
  const [men, setMen] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!date) {
      Swal.fire({
        icon: 'warning',
        title: 'Tafadhali chagua tarehe',
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Service
      const serviceRes = await apiFetch('/services', {
        method: 'POST',
        body: { type, date },
      });

      if (!serviceRes?.service?.id) {
        Swal.fire({
          icon: 'error',
          title: 'Hitilafu',
          text: 'Imeshindikana kuunda ibada.',
        });
        return;
      }

      const serviceId = serviceRes.service.id;

      // Step 2: Create Attendance
      const attendanceRes = await apiFetch('/attendance', {
        method: 'POST',
        body: {
          service_id: serviceId,
          children,
          women,
          men,
          members: [],
        },
      });

      if (attendanceRes.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Imethibitishwa',
          text: 'Mahudhurio yameongezwa kikamilifu.',
          timer: 2000,
          showConfirmButton: false,
        });

        // Auto-refresh parent attendance list
        onAdded?.();

        // Close modal
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hitilafu',
          text: attendanceRes.message || 'Imeshindikana kuunda mahudhurio.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Hitilafu ya mtandao',
        text: 'Tafadhali jaribu tena.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ongeza Mahudhurio</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Tarehe</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Aina ya Ibada</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="Jumapili">Jumapili</option>
              <option value="Midweek">Katikati ya Wiki</option>
              <option value="Special">Maandalizi Maalum</option>
            </select>
          </div>

          {/* Numbers */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">Watoto</label>
              <input
                type="number"
                value={children}
                onChange={e => setChildren(parseInt(e.target.value))}
                min={0}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">Wanawake</label>
              <input
                type="number"
                value={women}
                onChange={e => setWomen(parseInt(e.target.value))}
                min={0}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">Wanaume</label>
              <input
                type="number"
                value={men}
                onChange={e => setMen(parseInt(e.target.value))}
                min={0}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl w-full hover:scale-105 transition-all shadow-lg"
          >
            {loading ? 'Inapakia...' : 'Hifadhi Mahudhurio'}
          </button>
        </div>
      </div>
    </div>
  );
}