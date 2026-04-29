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
    duty_leader: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const serviceTypes = [
    'Ibada ya kimataifa',
    'Ibada ya Pili',
    'Ibada ya Tatu',
    'Ibada ya Vijana',
    'Ibada ya wanawake',
    'Ibada ya Neno la Mungu',
  ];

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_attendance:
        prev.attendance_children +
        prev.attendance_women +
        prev.attendance_men,
    }));
  }, [
    formData.attendance_children,
    formData.attendance_women,
    formData.attendance_men,
  ]);

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
          duty_leader: '',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hitilafu',
          text: res.message || 'Imeshindikana kuongeza taarifa.',
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Hitilafu',
        text: err.message || 'Tatizo la mtandao. Jaribu tena.',
      });
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Ongeza Taarifa za Ibada
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tarehe</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Service */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Aina ya Ibada</label>
          <input
            type="text"
            name="service_name"
            placeholder="Andika aina ya ibada"
            value={formData.service_name}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Preacher */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Mhubiri</label>
          <input
            type="text"
            name="preacher"
            placeholder="Ingiza jina la mhubiri"
            value={formData.preacher}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Mahubiri</label>
          <input
            type="text"
            name="preacher_description"
            placeholder="Maelezo mafupi"
            value={formData.preacher_description}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Leaders */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Kiongozi wa Ibada
          </label>
          <input
            type="text"
            name="leaders_on_duty"
            placeholder="Jina la kiongozi"
            value={formData.leaders_on_duty}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Kiongozi wa Zamu
          </label>
          <input
            type="text"
            name="duty_leader"
            placeholder="Jina la kiongozi wa zamu"
            value={formData.duty_leader}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Attendance */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Watoto</label>
          <input
            type="number"
            value={formData.attendance_children}
            onChange={e =>
              handleNumberChange('attendance_children', e.target.value)
            }
            className="border px-4 py-3 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Wanawake</label>
          <input
            type="number"
            value={formData.attendance_women}
            onChange={e =>
              handleNumberChange('attendance_women', e.target.value)
            }
            className="border px-4 py-3 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Wanaume</label>
          <input
            type="number"
            value={formData.attendance_men}
            onChange={e =>
              handleNumberChange('attendance_men', e.target.value)
            }
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Totals */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Jumla ya Mahudhurio
          </label>
          <input
            type="number"
            value={formData.total_attendance}
            readOnly
            className="border px-4 py-3 rounded-md bg-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Sadaka (Tsh)
          </label>
          <input
            type="number"
            value={formData.total_offerings}
            onChange={e =>
              handleNumberChange('total_offerings', e.target.value)
            }
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Message */}
        <div className="md:col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Maelezo</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="border px-4 py-3 rounded-md"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-700"
          >
            Ongeza Taarifa
          </button>
        </div>
      </form>
    </div>
  );
}