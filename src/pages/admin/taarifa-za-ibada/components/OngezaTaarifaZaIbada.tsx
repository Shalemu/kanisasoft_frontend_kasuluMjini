'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';

export default function OngezaTaarifaZaIbada() {
  const [formData, setFormData] = useState({
    date: '',
    service_name: '',
    preacher: '',
    preacher_description: '',
    message: '',
    attendance_children: 0,
    attendance_women: 0,
    attendance_men: 0,
    total_attendance: 0,
    total_offerings: 0,
    leaders_on_duty: '',
  });

  const serviceTypes = [
    'Ibada ya kimataifa',
    'Ibada ya Pili',
    'Ibada ya Tatu',
    'Ibada ya Vijana',
    'Ibada ya wanawake',
    'Ibada ya Neno la Mungu',
  ];

  // Auto-calculate total attendance
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_attendance:
        prev.attendance_children + prev.attendance_women + prev.attendance_men,
    }));
  }, [formData.attendance_children, formData.attendance_women, formData.attendance_men]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { total_attendance, ...body } = formData;

      const res = await apiFetch('/service-events', {
        method: 'POST',
        body,
      });

      if (res.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Imefanikiwa',
          text: 'Taarifa imeongezwa kwa mafanikio!',
        });

        setFormData({
          date: '',
          service_name: '',
          preacher: '',
          preacher_description: '',
          message: '',
          attendance_children: 0,
          attendance_women: 0,
          attendance_men: 0,
          total_attendance: 0,
          total_offerings: 0,
          leaders_on_duty: '',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hitilafu',
          text: res.message || 'Imeshindikana kuongeza taarifa.',
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Hitilafu',
        text: err.message || 'Tatizo la mtandao. Jaribu tena.',
      });
    }
  };

  return (
    <div className="bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Ongeza Taarifa za Ibada</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tarehe</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

      
        {/* Service Type */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Aina ya Huduma</label>
        <input
          type="text"
          required
          value={formData.service_name}
          onChange={e =>
            setFormData({ ...formData, service_name: e.target.value })
          }
          placeholder="Andika aina ya huduma"
          className="border border-gray-300 px-4 py-3 rounded-md"
        />
      </div>
        {/* Preacher */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Mhubiri</label>
          <input
            type="text"
            required
            placeholder="Ingiza jina la mhubiri"
            value={formData.preacher}
            onChange={e => setFormData({ ...formData, preacher: e.target.value })}
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Preacher Description */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Mahubiri / Somo</label>
          <input
            type="text"
            placeholder="Maelezo mafupi kuhusu mhubiri"
            value={formData.preacher_description}
            onChange={e =>
              setFormData({ ...formData, preacher_description: e.target.value })
            }
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Leaders on Duty */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Kiongozi Wa Ibada</label>
          <input
            type="text"
            placeholder="Weka Jina la Kiongozi wa Ibada"
            value={formData.leaders_on_duty}
            onChange={e => setFormData({ ...formData, leaders_on_duty: e.target.value })}
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Kiongozi Wa Zamu</label>
          <input
            type="text"
            placeholder="Weka Jina la Kiongozi wa Zamu"
            value={formData.leaders_on_duty}
            onChange={e => setFormData({ ...formData, leaders_on_duty: e.target.value })}
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Attendance: Children */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Watoto Waliohudhuria</label>
          <input
            type="number"
            min={0}
            value={formData.attendance_children}
            onChange={e =>
              setFormData({ ...formData, attendance_children: Number(e.target.value) })
            }
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Attendance: Women */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Wanawake Waliohudhuria</label>
          <input
            type="number"
            min={0}
            value={formData.attendance_women}
            onChange={e =>
              setFormData({ ...formData, attendance_women: Number(e.target.value) })
            }
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Attendance: Men */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Wanaume Waliohudhuria</label>
          <input
            type="number"
            min={0}
            value={formData.attendance_men}
            onChange={e =>
              setFormData({ ...formData, attendance_men: Number(e.target.value) })
            }
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Total Attendance & Total Offerings in one row */}
      <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
        {/* Total Attendance */}
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Jumla ya Mahudhurio</label>
          <input
            type="number"
            value={formData.total_attendance}
            readOnly
            className="border border-gray-300 px-4 py-3 rounded-md bg-gray-100"
          />
        </div>

        {/* Total Offerings */}
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Jumla ya Sadaka Zilizotolewa(Tsh)</label>
          <input
            type="number"
            min={0}
            value={formData.total_offerings}
            onChange={e =>
              setFormData({ ...formData, total_offerings: Number(e.target.value) })
            }
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>
      </div>

        {/* Message */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">Maelezo ya ziada kama yapo</label>
          <textarea
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="Maelezo yoyote ya ziada..."
            className="border border-gray-300 px-4 py-3 rounded-md"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-800 text-white px-6 py-3 font-semibold rounded-md shadow hover:bg-blue-700 transition"
          >
            Ongeza Taarifa
          </button>
        </div>
      </form>
    </div>
  );
}