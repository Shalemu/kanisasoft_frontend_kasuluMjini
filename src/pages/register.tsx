'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabTitles = ['Taarifa Binafsi', 'Taarifa za Imani', 'Elimu na Kazi', 'Familia'];

  const [form, setForm] = useState({
    fullName: '', gender: '', birthDate: '', birthPlace: '', birthDistrict: '', residence: '',
    maritalStatus: '', spouseName: '', childrenCount: '', zone: '', phone: '', whatsappNumber: '', email: '',
    password: '', passwordConfirmation: '', dateOfConversion: '', churchOfConversion: '',
    baptismDate: '', baptismPlace: '', baptizerName: '', baptizerTitle: '',
    previousChurchStatus: '', tanguLini: '', kanisaUlipotoka: '',
    churchService: '', serviceDuration: '', educationLevel: '', profession: '', occupation: '',
    workPlace: '', workContact: '', livesAlone: '', livesWith: '', familyRole: '', liveWithWho: '',
    nextOfKin: '', nextOfKinPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'maritalStatus' && !['Nimeoa', 'Nimemeolewa'].includes(value) ? { spouseName: '' } : {}),
      ...(name === 'livesAlone' && value === 'yes'
        ? { livesWith: '', familyRole: '', liveWithWho: '' }
        : {}),
    }));
  };

  const validatePersonalInfo = () => {
    const required = ['fullName', 'gender', 'birthDate', 'birthPlace', 'residence', 'zone', 'maritalStatus', 'phone', 'email', 'password', 'passwordConfirmation'];
    for (const key of required) {
      if (!form[key as keyof typeof form]) {
       Swal.fire({
      title: 'Taarifa Inakosekana',
      text: 'Tafadhali jaza taarifa zote muhimu za binafsi kabla ya kuendelea.',
      icon: 'warning',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f0ce32',
    });
        setActiveTab(0);
        return false;
      }
    }
    if (form.password !== form.passwordConfirmation) {
      Swal.fire({
      title: 'Tatizo',
      text: 'Neno la siri na uthibitisho wa neno la siri havilingani.',
      icon: 'warning',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f0ce32', // ← your custom color
    });
      setActiveTab(0);
      return false;
    }

if (!/^\d{10}$/.test(form.phone)) {
  Swal.fire({
    title: 'Namba ya simu si sahihi',
    text: 'Namba ya simu lazima iwe na tarakimu 10 tu.',
    icon: 'error',
    confirmButtonText: 'Sawa',
    confirmButtonColor: '#f0ce32',
  });
  setActiveTab(0);
  return false;
}
    return true;
  };


const validateFaithInfo = () => {
  // Required fields for faith info
  const required = [
    'dateOfConversion',
    'churchOfConversion',
    'baptismDate',
    'baptizerName',
    'baptizerTitle',
    'previousChurchStatus'
  ];

  // 1️⃣ Check all required fields
  for (const key of required) {
    const value = form[key as keyof typeof form];
    if (!value || (typeof value === 'string' && value.trim() === "")) {
      Swal.fire({
  title: 'Tahadhari',
  text: 'Tafadhali jaza taarifa zote muhimu za imani kabla ya kuendelea.',
  icon: 'warning',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
      setActiveTab(1);
      return false;
    }
  }

  // 2️⃣ Conditional required fields if user has moved from another church
  if (form.previousChurchStatus === 'Nimehamia') {
    if (!form.tanguLini || form.tanguLini.trim() === "" || !form.kanisaUlipotoka || form.kanisaUlipotoka.trim() === "") {
 

Swal.fire({
  title: 'Tahadhari',
  text: 'Tafadhali jaza taarifa za kanisa ulipotoka.',
  icon: 'warning',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
      setActiveTab(1);
      return false;
    }
  }

  
  return true;
};



  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 0 && !validatePersonalInfo()) return;
    if (activeTab === 1 && !validateFaithInfo()) return;
    if (activeTab < tabTitles.length - 1) setActiveTab(activeTab + 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Tabs 1 & 2 before register
    if (!validatePersonalInfo()) return;
    if (!validateFaithInfo()) return;

    const payload = {
      full_name: form.fullName,
      gender: form.gender === 'Mwanaume' ? 'M' : 'F',
      birth_date: form.birthDate,
      birth_place: form.birthPlace,
      birth_district: form.birthDistrict,
      residence: form.residence,
      marital_status: {
        'Nimeoa': 'Ameoa',
        'Nimeolewa': 'Ameolewa',
        'Sijaoa': 'Hajaoa',
        'Sijaolewa': 'Hajaolewa',
        'Mjane': 'Mjane',
        'Mgane': 'Mgane'
      }[form.maritalStatus] || form.maritalStatus,      
      spouse_name: form.spouseName,
      children_count: Number(form.childrenCount),
      zone: form.zone,
      phone: form.phone,
      whatsapp_number: form.whatsappNumber,
      email: form.email,
      password: form.password,
      password_confirmation: form.passwordConfirmation,
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
      lives_alone: form.livesAlone === 'ndio',
      lives_with: form.livesWith,
      family_role: form.familyRole,
      live_with_who: form.liveWithWho,
      next_of_kin: form.nextOfKin,
      next_of_kin_phone: form.nextOfKinPhone,
    };

    try {
      setLoading(true);
      const response = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.error) {
        
  Swal.fire({
  title: ' Usajili umefanikiwa!',
  text: 'Tafadhali ingia kwenye akaunti yako.',
  icon: 'success',
  confirmButtonText: 'Ingia',
}).then(() => {
  router.push('/login'); // navigate after user clicks confirm
});
        // Immediately navigate to login page
        router.push('/login');
        return;
      } else {
       Swal.fire({
  title: 'Tatizo',
  text: `${response.message || 'Kuna Tatizo la kiufundi.'}`,
  icon: 'error',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // custom button color
});
      }      
    } catch (error: any) {
      if (error?.errors?.email?.[0]) {
         Swal.fire({
    title: ' Barua pepe tayari imesajiliwa',
    text: error.errors.email[0],
    icon: 'error',
    confirmButtonText: 'Sawa',
  });
      } else if (error?.errors?.phone?.[0]) {
       Swal.fire({
    title: 'Namba ya simu tayari imesajiliwa',
    text: error.errors.phone[0],
    icon: 'error',
    confirmButtonText: 'Sawa',
  });
      } else {
       Swal.fire({
    title: 'Tatizo',
    text: error?.message || 'Tatizo limetokea. Jaribu tena.',
    icon: 'error',
    confirmButtonText: 'Sawa',
  });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Field label="Jina Kamili *" name="fullName" value={form.fullName} onChange={handleChange} />
            <Select label="Jinsia*" name="gender" value={form.gender} onChange={handleChange} options={['Mwanaume', 'Mwanamke']} />
            <Field label="Tarehe ya Kuzaliwa *" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
            <Field label="Mahali Ulipozaliwa (Wilaya / Mkoa) *" name="birthPlace" value={form.birthPlace} onChange={handleChange} />
            <Field label="Mahali Unapoishi (Mtaa / Wilaya) *" name="residence" value={form.residence} onChange={handleChange} />
            <Select label="Zoni *" name="zone" value={form.zone} onChange={handleChange}
              options={['Kigamboni','Kizuiani','Mtongani','Yerusalem','Tandika','Kijichi','Mgeninani','Keko & Kurasini','Kinondoni','Kongowe','Mbande','Kingugi']}
            />
            <Select label="Hali ya Ndoa *" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}
              options={['Nimeoa', 'Nimeolewa', 'Sijaoa', 'Sijaolewa', 'Mjane', 'Mgane']} />
            {['Nimeoa', 'Nimeolewa'].includes(form.maritalStatus) && (
              <Field label="Jina la Mwenza *" name="spouseName" value={form.spouseName} onChange={handleChange} />
            )}
            <Field label="Idadi ya Watoto *" name="childrenCount" type="number" value={form.childrenCount} onChange={handleChange} />
            <Field label="Namba ya Simu *" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field
            label="Namba ya WhatsApp (Hiari)"
            name="whatsappNumber"
            type="tel"
            value={form.whatsappNumber}
            onChange={handleChange}
          />
            <Field label="Barua Pepe *" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field label="Neno la siri *" name="password" type="password" value={form.password} onChange={handleChange} />
            <Field label="Thibitisha Neno la siri *" name="passwordConfirmation" type="password" value={form.passwordConfirmation} onChange={handleChange} />
          </>
        );
      case 1:
        return (
          <>
            <Field label="Tarehe ya Kuokoka *" name="dateOfConversion" type="date" value={form.dateOfConversion} onChange={handleChange} />
            <Field label="Kanisa Ulipookoka *" name="churchOfConversion" value={form.churchOfConversion} onChange={handleChange} />
            <Field label="Tarehe ya Ubatizo *" name="baptismDate" type="date" value={form.baptismDate} onChange={handleChange} />
            <Field label="Mahali Ulipobatizwa *" name="baptismPlace" value={form.baptismPlace} onChange={handleChange} />
            <Field label="Aliyekubatiza *" name="baptizerName" onChange={handleChange} value={form.baptizerName} />
            <Field label="Cheo cha Aliyekubatiza *" name="baptizerTitle" onChange={handleChange} value={form.baptizerTitle} />
            
            <Select 
              label="Umehamia / Umeokoka Hapa? *" 
              name="previousChurchStatus" 
              value={form.previousChurchStatus} 
              onChange={handleChange} 
              options={['Nimehamia','Nimeokoka hapa']} 
            />
            {form.previousChurchStatus === 'Nimehamia' && (
              <>
                <Field label="Tangu lini (Mwezi na Mwaka) *" name="tanguLini" value={form.tanguLini} onChange={handleChange} type="month" />
                <Field label="Kanisa Ulipotoka *" name="kanisaUlipotoka" value={form.kanisaUlipotoka} onChange={handleChange} />
              </>
            )}

            <Field label="Huduma Unayofanya (hiari)" name="churchService" onChange={handleChange} value={form.churchService} />
          </>
        );
     case 2:
  return (
    <>
      <Select 
        label="Kiwango cha Elimu *" 
        name="educationLevel" 
        value={form.educationLevel} 
        onChange={handleChange} 
        options={[
          'Sijasoma',
          'Elimu ya msingi',
          'Elimu ya sekondari',
          'Elimu ya chuo',
          'Elimu ya chuo kikuu'
        ]} 
      />

      {/* ✅ TAALUMA (HIARI) */}
      <Field
        label="Taaluma (Hiari)"
        name="profession"
        value={form.profession}
        onChange={handleChange}
      />

      <Select 
        label="Kazi / Shughuli *" 
        name="occupation" 
        value={form.occupation} 
        onChange={handleChange} 
        options={[
          'Nimeajiriwa',
          'Nimejiajiri',
          'Mwanafunzi',
          'Sina kazi'
        ]} 
      />

      {(form.occupation === 'Nimeajiriwa' || form.occupation === 'Nimejiajiri') && (
        <>
          <Field
            label="Sehemu ya Kazi (Hiari)"
            name="workPlace"
            value={form.workPlace}
            onChange={handleChange}
          />
          <Field
            label="Mawasiliano ya Kazi (Hiari)"
            name="workContact"
            value={form.workContact}
            onChange={handleChange}
          />
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
                <Select 
                  label="Nafasi yako katika Familia" 
                  name="familyRole" 
                  value={form.familyRole} 
                  onChange={handleChange} 
                  options={['Mzazi','Mtoto','Ndugu']} 
                />
                <Select 
                  label="Unayoishi Nao" 
                  name="liveWithWho" 
                  value={form.liveWithWho} 
                  onChange={handleChange} 
                  options={['Wazazi','Ndugu','Marafiki','Wengine']} 
                />
              </>
            )}
            <Field label="Jina la Mtu wako wa Karibu" name="nextOfKin" value={form.nextOfKin} onChange={handleChange} />
            <Field label="Namba ya Simu ya Mtu wa Karibu" name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange} type="tel" />
          </>
        );
    }
  };

  return (
    <>
      <Head><title>Jisajili | FPCT Mahali Pamoja</title></Head>
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] rounded-3xl shadow-2xl border border-white/10 p-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-6">Fomu ya Usajili wa Mshirika</h2>
          <div className="flex justify-center mb-6 gap-3 flex-wrap">
            {tabTitles.map((title, index) => (
              <button key={index} onClick={() => setActiveTab(index)} type="button"
                className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === index
                  ? 'bg-[#f0ce32] text-black font-bold shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {title}
              </button>
            ))}
          </div>

          <form onSubmit={activeTab === tabTitles.length - 1 ? handleRegister : handleNext}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTabContent()}
            <button type="submit" disabled={loading}
              className="col-span-full mt-6 py-3 bg-[#f0ce32] rounded-lg text-black font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all">
              {loading ? 'Inasajili...' : activeTab === tabTitles.length - 1 ? 'JISAJILI SASA' : 'Endelea'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-sm">
              Tayari una akaunti?{' '}
              <a href="/login" className="text-[#f0ce32] underline font-medium">Ingia hapa</a>
            </p>
            <Link href="/" className="text-sm font-medium text-[#f0ce32] hover:underline">
              ← Rudi Nyumbani
            </Link>
          </div>
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
