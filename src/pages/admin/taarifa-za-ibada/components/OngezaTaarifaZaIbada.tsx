'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';

type EventForm = 'attendance' | 'offering';

export default function OngezaTaarifaZaIbada() {
  const [activeForm, setActiveForm] = useState<EventForm>('attendance');
  const [formData, setFormData] = useState({
    date: '',
    service_name: '',
    preacher: '',
    preacher_description: '', // new field
    message: '',
    attendance_children: 0,
    attendance_women: 0,
    attendance_men: 0,
    total_attendance: 0,
    total_offerings: 0,
    leaders_on_duty: '',
  });

  // Predefined service types
  const serviceTypes = ['Huduma ya Jumapili', 'Mafunzo ya Biblia Jumatano', 'Kikundi cha Vijana', 'Mkutano wa Sala'];

  // Automatically calculate total attendance
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_attendance: prev.attendance_children + prev.attendance_women + prev.attendance_men,
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
      {/* Form Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 font-semibold ${activeForm === 'attendance' ? 'bg-blue-800 shadow text-white' : 'bg-gray-100 text-gray-800'}`}
          onClick={() => setActiveForm('attendance')}
        >
          Mahudhurio
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeForm === 'offering' ? 'bg-blue-800 shadow text-white' : 'bg-gray-100 text-gray-800'}`}
          onClick={() => setActiveForm('offering')}
        >
          Sadaka
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tarehe</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Service Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Aina ya Huduma</label>
          <select
            required
            value={formData.service_name}
            onChange={e => setFormData({ ...formData, service_name: e.target.value })}
            className="border border-gray-300 px-4 py-3"
          >
            <option value="" disabled>Chagua Huduma</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Preacher */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Mhubiri / Kiongozi</label>
          <input
            type="text"
            required
            placeholder="Ingiza jina la mhubiri"
            value={formData.preacher}
            onChange={e => setFormData({ ...formData, preacher: e.target.value })}
            className="border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Preacher Description */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Maelezo ya Mhubiri</label>
          <input
            type="text"
            placeholder="Maelezo mafupi kuhusu mhubiri"
            value={formData.preacher_description}
            onChange={e => setFormData({ ...formData, preacher_description: e.target.value })}
            className="border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Leaders on Duty */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Viongozi Waliopo Huduma</label>
          <input
            type="text"
            placeholder="Weka majina ya viongozi"
            value={formData.leaders_on_duty}
            onChange={e => setFormData({ ...formData, leaders_on_duty: e.target.value })}
            className="border border-gray-300 px-4 py-3"
          />
        </div>

        {activeForm === 'attendance' && (
          <>
            {/* Children */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Watoto</label>
              <input
                type="number"
                min={0}
                value={formData.attendance_children}
                onChange={e => setFormData({ ...formData, attendance_children: Number(e.target.value) })}
                className="border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Women */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Wanawake</label>
              <input
                type="number"
                min={0}
                value={formData.attendance_women}
                onChange={e => setFormData({ ...formData, attendance_women: Number(e.target.value) })}
                className="border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Men */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Wanaume</label>
              <input
                type="number"
                min={0}
                value={formData.attendance_men}
                onChange={e => setFormData({ ...formData, attendance_men: Number(e.target.value) })}
                className="border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Total Attendance (readonly) */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Jumla ya Mahudhurio</label>
              <input
                type="number"
                value={formData.total_attendance}
                readOnly
                className="border border-gray-300 px-4 py-3 bg-gray-100"
              />
            </div>
          </>
        )}

        {activeForm === 'offering' && (
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium text-gray-700">Jumla ya Sadaka (Tsh)</label>
            <input
              type="number"
              min={0}
              value={formData.total_offerings}
              onChange={e => setFormData({ ...formData, total_offerings: Number(e.target.value) })}
              className="border border-gray-300 px-4 py-3"
            />
          </div>
        )}

        {/* Message */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">Ujumbe / Maelezo</label>
          <textarea
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="Maelezo yoyote ya ziada..."
            className="border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-800 shadow text-white px-6 py-3 font-semibold hover:bg-blue-700"
          >
            Ongeza Taarifa
          </button>
        </div>
      </form>
    </div>
  );
}