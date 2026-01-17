'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function OngezaWashirika({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabTitles = ['Taarifa Binafsi', 'Taarifa za Imani', 'Elimu na Kazi', 'Familia'];

  const [form, setForm] = useState({
    fullName: '', gender: '', birthDate: '', birthPlace: '', birthDistrict: '', residence: '',
    maritalStatus: '', spouseName: '', childrenCount: '', zone: '', phone: '', email: '',
    dateOfConversion: '', churchOfConversion: '', baptismDate: '', baptismPlace: '', baptizerName: '', baptizerTitle: '',
    previousChurchStatus: '', tanguLini: '', kanisaUlipotoka: '',
    churchService: '', serviceDuration: '', educationLevel: '', profession: '', occupation: '',
    workPlace: '', workContact: '', livesAlone: '', livesWith: '', familyRole: '', liveWithWho: '',
    nextOfKin: '', nextOfKinPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'maritalStatus' && !['Ameoa', 'Ameolewa'].includes(value) ? { spouseName: '' } : {}),
      ...(name === 'livesAlone' && value === 'yes'
        ? { livesWith: '', familyRole: '', liveWithWho: '' }
        : {}),
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab < tabTitles.length - 1) setActiveTab(activeTab + 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone) {
      alert('Tafadhali jaza taarifa zote muhimu.');
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
      gender: form.gender === 'Mwanaume' ? 'M' : 'F',
      birth_date: form.birthDate,
      birth_place: form.birthPlace,
      birth_district: form.birthDistrict,
      residence: form.residence,
      marital_status: form.maritalStatus,
      spouse_name: form.spouseName,
      number_of_children: Number(form.childrenCount),
      residential_zone: form.zone,
      phone_number: form.phone,
      email: form.email,
      date_of_conversion: form.dateOfConversion,
      church_of_conversion: form.churchOfConversion,
      baptism_date: form.baptismDate,
      baptism_place: form.baptismPlace,
      baptizer_name: form.baptizerName,
      baptizer_title: form.baptizerTitle,
      previous_church_status: form.previousChurchStatus,
      tangu_lini: form.tanguLini,
      kanisa_ulipotoka: form.kanisaUlipotoka,
      church_service: form.churchService,
      service_duration: form.serviceDuration,
      education_level: form.educationLevel,
      profession: form.profession,
      occupation: form.occupation,
      work_place: form.workPlace,
      work_contact: form.workContact,
      lives_alone: form.livesAlone === 'yes',
      lives_with: form.livesWith,
      family_role: form.familyRole,
      live_with_who: form.liveWithWho,
      next_of_kin: form.nextOfKin,
      next_of_kin_phone: form.nextOfKinPhone,
    };

    try {
      setLoading(true);
      const result = await apiFetch('/members', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setLoading(false);

      if (result.status === 'error') return alert(result.message);
      alert('✅ Mshirika ameongezwa!');
      onBack();
    } catch (err: any) {
      alert(`⛔ ${err?.message || 'Tatizo limetokea. Jaribu tena.'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Field label="Jina Kamili" name="fullName" value={form.fullName} onChange={handleChange} />
            <Select label="Jinsia" name="gender" value={form.gender} onChange={handleChange} options={['Mwanaume', 'Mwanamke']} />
            <Field label="Tarehe ya Kuzaliwa" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
            <Field label="Mahali Ulipozaliwa (Wilaya / Mkoa)" name="birthPlace" value={form.birthPlace} onChange={handleChange} />
            <Field label="Wilaya ya Kuzaliwa" name="birthDistrict" value={form.birthDistrict} onChange={handleChange} />
            <Field label="Mahali Unapoishi (Mtaa / Wilaya)" name="residence" value={form.residence} onChange={handleChange} />
            <Select label="Zoni" name="zone" value={form.zone} onChange={handleChange}
              options={['Kigamboni','Kizuiani','Mtongani','Yerusalem','Tandika','Kijichi','Mgeninani','Keko & Kurasini','Kinondoni','Kongowe','Mbande','Kingugi']} />
            <Select label="Hali ya Ndoa" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}
              options={['Ameoa', 'Ameolewa', 'Hajaoa', 'Hajaolewa', 'Mjane', 'Mgane']} />
            {['Ameoa', 'Ameolewa'].includes(form.maritalStatus) && (
              <Field label="Jina la Mwenza" name="spouseName" value={form.spouseName} onChange={handleChange} />
            )}
            <Field label="Idadi ya Watoto" name="childrenCount" type="number" value={form.childrenCount} onChange={handleChange} />
            <Field label="Namba ya Simu" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field label="Barua Pepe" name="email" type="email" value={form.email} onChange={handleChange} />
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
            
            <Select label="Umehamia / Umeokoka Hapa?" name="previousChurchStatus" value={form.previousChurchStatus} onChange={handleChange}
              options={['Nimehamia','Nimeokoka hapa']} />
            {form.previousChurchStatus === 'Nimehamia' && (
              <>
                <Field label="Tangu lini (Mwezi na Mwaka)" name="tanguLini" type="month" value={form.tanguLini} onChange={handleChange} />
                <Field label="Kanisa Ulipotoka" name="kanisaUlipotoka" value={form.kanisaUlipotoka} onChange={handleChange} />
              </>
            )}
            <Field label="Huduma Unayofanya" name="churchService" value={form.churchService} onChange={handleChange} />
          </>
        );
      case 2:
        return (
          <>
            <Select label="Kiwango cha Elimu" name="educationLevel" value={form.educationLevel} onChange={handleChange}
              options={['Sijasoma','Elimu ya msingi','Elimu ya sekondari','Elimu ya chuo','Elimu ya chuo kikuu']} />
            <Select label="Shughuli" name="occupation" value={form.occupation} onChange={handleChange}
              options={['Nimeajiriwa','Nimejiajiri','Mwanafunzi','Sina kazi']} />
            {(form.occupation === 'Nimeajiriwa' || form.occupation === 'Nimejiajiri') && (
              <>
                <Field label="Mahali pa Kazi" name="workPlace" value={form.workPlace} onChange={handleChange} />
                <Field label="Mawasiliano ya Kazi" name="workContact" value={form.workContact} onChange={handleChange} />
              </>
            )}
          </>
        );
      case 3:
        return (
          <>
            <Select label="Unaishi Peke Yako?" name="livesAlone" value={form.livesAlone} onChange={handleChange} options={['ndio','hapana']} />
            {form.livesAlone === 'hapana' && (
              <>
                <Select label="Nafasi yako katika Familia" name="familyRole" value={form.familyRole} onChange={handleChange} options={['Mzazi','Mtoto','Ndugu']} />
                <Select label="Unayoishi Nao" name="liveWithWho" value={form.liveWithWho} onChange={handleChange} options={['Wazazi','Ndugu','Marafiki','Wengine']} />
              </>
            )}
            <Field label="Jina la Mtu wako wa Karibu" name="nextOfKin" value={form.nextOfKin} onChange={handleChange} />
            <Field label="Namba ya Simu ya Mtu wa Karibu" name="nextOfKinPhone" type="tel" value={form.nextOfKinPhone} onChange={handleChange} />
          </>
        );
    }
  };

  return (
    <>
      <Head><title>Ongeza Mshirika | FPCT Mahali Pamoja</title></Head>
      <div className="min-h-screen bg-[#cbb2ff] flex items-center justify-center relative overflow-hidden px-4 py-10">
        <div className="absolute inset-0 z-0">
          <Image src="/hero-worship.jpg" alt="background" fill className="object-cover opacity-40 blur-sm" />
        </div>
        <div className="relative z-10 w-full max-w-4xl bg-[#1c1e2d]/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 p-8">
          <button onClick={onBack} className="text-sm text-blue-300 mb-4 hover:underline">← Rudi kwenye orodha</button>
          <h2 className="text-2xl font-bold text-center text-white mb-6">Fomu ya Ongeza Mshirika</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-6 gap-3 flex-wrap">
            {tabTitles.map((title, index) => (
              <button key={index} onClick={() => setActiveTab(index)} type="button"
                className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === index
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {title}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={activeTab === tabTitles.length - 1 ? handleSave : handleNext} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTabContent()}
            <button type="submit" disabled={loading}
            className="col-span-full mt-6 py-3 bg-[#f0ce32] rounded-lg text-black font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all">
              {loading ? 'Inahifadhi...' : activeTab === tabTitles.length - 1 ? 'Hifadhi Mshirika' : 'Endelea'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Reusable components
function Field({ label, name, value, onChange, type = 'text' }: any) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-white">{label}</label>
      <input id={name} name={name} value={value} onChange={onChange} type={type}
        className="w-full px-4 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500
        focus:outline-none focus:ring-2 focus:ring-pink-500" autoComplete="off" />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-white">{label}</label>
      <select id={name} name={name} value={value} onChange={onChange}
        className="w-full px-4 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500
        focus:outline-none focus:ring-2 focus:ring-pink-500">
        <option value="">-- Chagua --</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
