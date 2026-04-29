'use client';

import { useState } from 'react';
import Head from 'next/head';
import { apiFetch } from '@/lib/api';

interface FormData {
  childName: string;
  birthDate: string;
  gender: string;
  parentName: string;
  relationship: string;
  phone: string;
}

export default function OngezaWatoto({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    childName: '',
    birthDate: '',
    gender: '',
    parentName: '',
    relationship: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.childName || !form.gender || !form.phone) {
      alert('Tafadhali jaza taarifa zote muhimu.');
      return;
    }

    setLoading(true);

    const payload = {
      child_name: form.childName,
      birth_date: form.birthDate,
      gender: form.gender,
      parent_name: form.parentName,
      relationship: form.relationship,
      phone: form.phone,
    };

    const result = await apiFetch('/children', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (result.status === 'error') return alert(result.message);

    alert('Mtoto amesajiliwa kikamilifu!');
    onBack();
  };

  return (
    <>
      <Head><title>Ongeza Mtoto</title></Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-10">

          {/* Back */}
          <button
            onClick={onBack}
            className="text-sm text-blue-600 mb-6 hover:underline"
          >
            ← Rudi
          </button>

          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Usajili wa Mtoto
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Tafadhali jaza taarifa sahihi za mtoto na mzazi/mlezi
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">

            {/* TAARIFA ZA MTOTO */}
            <div className="bg-gray-50 rounded-2xl p-6 border">
              <h3 className="font-semibold text-gray-700 mb-5">
                Taarifa za Mtoto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field
                  label="Jina Kamili"
                  name="childName"
                  value={form.childName}
                  onChange={handleChange}
                  placeholder="Jina kamili la mtoto"
                />

                <Field
                  label="Tarehe ya Kuzaliwa"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                />

                <Select
                  label="Jinsia"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={['Mwanaume', 'Mwanamke']}
                />
              </div>
            </div>

            {/* TAARIFA ZA MZAZI */}
            <div className="bg-gray-50 rounded-2xl p-6 border">
              <h3 className="font-semibold text-gray-700 mb-5">
                Taarifa za Mzazi / Mlezi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field
                  label="Jina la Mzazi/Mlezi"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Jina kamili la mzazi au mlezi"
                />

                <Field
                  label="Uhusiano"
                  name="relationship"
                  value={form.relationship}
                  onChange={handleChange}
                  placeholder="Mama, Baba, Shangazi"
                />

                <Field
                  label="Namba ya Simu"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-semibold transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#1e293b] hover:bg-[#334155]'
              } text-white shadow-md`}
              disabled={loading}
            >
              {loading ? 'Inahifadhi...' : 'ONGEZA MTOTO'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* Reusable Components */

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 border rounded-xl border-gray-300 bg-white 
        focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent 
        transition"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-600">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border rounded-xl border-gray-300 bg-white 
        focus:outline-none focus:ring-2 focus:ring-[#1e293b]"
      >
        <option value="">-- Chagua --</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}