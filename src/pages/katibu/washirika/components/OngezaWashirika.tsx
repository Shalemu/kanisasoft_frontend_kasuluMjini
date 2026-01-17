'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';

interface FormData {
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  maritalStatus: string;
  spouseName: string;
  childrenCount: string;
  zone: string;
  phone: string;
  email: string;
  dateOfConversion: string;
  churchOfConversion: string;
  baptismDate: string;
  baptismPlace: string;
  baptizerName: string;
  baptizerTitle: string;
  previousChurch: string;
  churchService: string;
  serviceDuration: string;
  educationLevel: string;
  profession: string;
  occupation: string;
  workPlace: string;
  workContact: string;
  livesAlone: string;
  livesWith: string;
}

interface OngezaWashirikaProps {
  onBack: () => void;
}

interface FieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

interface SelectProps {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function OngezaWashirika({ onBack }: OngezaWashirikaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabTitles = ['Taarifa Binafsi', 'Taarifa za Imani', 'Elimu na Kazi', 'Familia'];

  const [form, setForm] = useState<FormData>({
    fullName: '', gender: '', birthDate: '', birthPlace: '', maritalStatus: '',
    spouseName: '', childrenCount: '', zone: '', phone: '', email: '',
    dateOfConversion: '', churchOfConversion: '', baptismDate: '', baptismPlace: '',
    baptizerName: '', baptizerTitle: '', previousChurch: '', churchService: '',
    serviceDuration: '', educationLevel: '', profession: '', occupation: '',
    workPlace: '', workContact: '', livesAlone: '', livesWith: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'maritalStatus' && value === 'Bila ndoa' ? { spouseName: '' } : {}),
      ...(name === 'livesAlone' && value === 'yes' ? { livesWith: '' } : {}),
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab < tabTitles.length - 1) setActiveTab(activeTab + 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.gender || !form.phone) {
      alert('Jaza taarifa zote muhimu.');
      return;
    }

    const storedId = localStorage.getItem('user_id');
    if (!storedId) {
      alert('User ID haijapatikana. Ingia kwanza.');
      return;
    }

    const payload = {
      user_id: storedId,
      full_name: form.fullName,
      gender: form.gender,
      birth_date: form.birthDate,
      birth_place: form.birthPlace,
      marital_status: form.maritalStatus,
      spouse_name: form.spouseName,
      number_of_children: parseInt(form.childrenCount) || 0,
      residential_zone: form.zone,
      phone_number: form.phone,
      email: form.email,
      date_of_conversion: form.dateOfConversion,
      church_of_conversion: form.churchOfConversion,
      baptism_date: form.baptismDate,
      baptism_place: form.baptismPlace,
      baptizer_name: form.baptizerName,
      baptizer_title: form.baptizerTitle,
      previous_church: form.previousChurch,
      church_service: form.churchService,
      service_duration: form.serviceDuration,
      education_level: form.educationLevel,
      profession: form.profession,
      occupation: form.occupation,
      work_place: form.workPlace,
      work_contact: form.workContact,
      lives_alone: form.livesAlone === 'yes',
      lives_with: form.livesWith,
    };

    setLoading(true);
    const result = await apiFetch('/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (result.status === 'error') return alert(result.message);
    alert('✅ Mshirika ameongezwa!');
    onBack(); // 👈 use the callback to return
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Field label="Jina Kamili" name="fullName" value={form.fullName} onChange={handleChange} />
            <Select label="Jinsia" name="gender" value={form.gender} onChange={handleChange} options={['M', 'F']} />
            <Field label="Tarehe ya Kuzaliwa" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
            <Field label="Mahali Ulipozaliwa" name="birthPlace" value={form.birthPlace} onChange={handleChange} />
            <Select label="Hali ya Ndoa" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} options={['Ndoa', 'Bila ndoa']} />
            {form.maritalStatus === 'Ndoa' && <Field label="Jina la Mwenza" name="spouseName" value={form.spouseName} onChange={handleChange} />}
            <Field label="Idadi ya Watoto" name="childrenCount" type="number" value={form.childrenCount} onChange={handleChange} />
            <Field label="Zoni" name="zone" value={form.zone} onChange={handleChange} />
            <Field label="Namba ya Simu" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Barua Pepe" name="email" value={form.email} onChange={handleChange} />
          </>
        );
      case 1:
        return (
          <>
            <Field label="Tarehe ya Kuokoka" name="dateOfConversion" type="date" value={form.dateOfConversion} onChange={handleChange} />
            <Field label="Kanisa Ulipookoka" name="churchOfConversion" value={form.churchOfConversion} onChange={handleChange} />
            <Field label="Tarehe ya Ubatizo" name="baptismDate" type="date" value={form.baptismDate} onChange={handleChange} />
            <Field label="Mahali Ulipobatizwa" name="baptismPlace" value={form.baptismPlace} onChange={handleChange} />
            <Field label="Aliyekubatiza" name="baptizerName" value={form.baptizerName} onChange={handleChange} />
            <Field label="Cheo cha Aliyekubatiza" name="baptizerTitle" value={form.baptizerTitle} onChange={handleChange} />
            <Field label="Kanisa Uliyotoka" name="previousChurch" value={form.previousChurch} onChange={handleChange} />
            <Field label="Huduma" name="churchService" value={form.churchService} onChange={handleChange} />
            <Select label="Miaka Kanisani" name="serviceDuration" value={form.serviceDuration} onChange={handleChange} options={years} />
          </>
        );
      case 2:
        return (
          <>
            <Field label="Elimu" name="educationLevel" value={form.educationLevel} onChange={handleChange} />
            <Field label="Taaluma" name="profession" value={form.profession} onChange={handleChange} />
            <Field label="Kazi" name="occupation" value={form.occupation} onChange={handleChange} />
            <Field label="Mahali pa Kazi" name="workPlace" value={form.workPlace} onChange={handleChange} />
            <Field label="Mawasiliano ya Kazi" name="workContact" value={form.workContact} onChange={handleChange} />
          </>
        );
      case 3:
        return (
          <>
            <Select label="Unaishi Peke Yako?" name="livesAlone" value={form.livesAlone} onChange={handleChange} options={['ndio', 'hapana']} />
            {form.livesAlone === 'hapana' && <Field label="Unaishi na Nani?" name="livesWith" value={form.livesWith} onChange={handleChange} />}
          </>
        );
    }
  };

  return (
    <>
      <Head><title>Ongeza Mshirika</title></Head>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
          <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">
            ← Rudi kwenye orodha ya washirika
          </button>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Fomu ya Ongeza Mshirika</h2>
          <div className="flex justify-center mb-6">
            {tabTitles.map((title, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 ${activeTab === i ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:border-gray-300'}`}
              >
                {title}
              </button>
            ))}
          </div>
          <form onSubmit={activeTab === tabTitles.length - 1 ? handleSave : handleNext} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            {renderTabContent()}
            <button
              type="submit"
              className={`col-span-full w-full py-3 mt-6 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-semibold transition`}
              disabled={loading}
            >
              {loading ? 'Inatuma...' : activeTab === tabTitles.length - 1 ? 'Hifadhi Mshirika' : 'Next'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, name, value, onChange, type = 'text' }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Chagua --</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
