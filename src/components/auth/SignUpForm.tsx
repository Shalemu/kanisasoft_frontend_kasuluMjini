'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  isMarriedStatus,
  MARITAL_STATUS_OPTIONS,
  normalizeGenderValue,
  normalizeMaritalStatusForApi,
} from '@/lib/memberLabels';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabTitles = ['Taarifa Binafsi', 'Taarifa za Imani', 'Elimu na Kazi', 'Familia'];

  const [form, setForm] = useState({
    // Personal Info
    fullName: '', gender: '', birthDate: '',
    birthRegion: '', birthDistrict: '', birthWard: '', birthStreet: '',
    birthPlace: '', // kept for backward compat
    residentialWard: '', residentialStreet: '', residence: '',
    maritalStatus: '', marriageType: '', spouseName: '', childrenCount: '',
    zone: '', phone: '', whatsappNumber: '', email: '',
    password: '', passwordConfirmation: '',
    hasDisability: '', disabilityDescription: '',
    // Faith Info
    conversionYear: '', conversionMonth: '', conversionDay: '',
    churchOfConversion: '',
    baptismYear: '', baptismMonth: '', baptismDay: '',
    baptismPlace: '', baptizerName: '', baptizerTitle: '',
    previousChurchStatus: '', tanguLini: '', kanisaUlipotoka: '',
    churchService: '', participatesCommunion: '',
    // Education & Work
    serviceDuration: '', educationLevel: '', profession: '', occupation: '',
    workPlace: '', workContact: '',
    // Family
    livesAlone: '', livesWith: '', familyRole: '', liveWithWho: '',
    nextOfKin: '', nextOfKinPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Clear spouse & marriage type when marital status changes to non-married
      ...(name === 'maritalStatus' && !isMarriedStatus(normalizeMaritalStatusForApi(value, prev.gender))
        ? { spouseName: '', marriageType: '' } : {}),
      // Clear disability description when hasDisability = hapana
      ...(name === 'hasDisability' && value === 'hapana'
        ? { disabilityDescription: '' } : {}),
      // Clear family fields when living alone
      ...(name === 'livesAlone' && value === 'ndio'
        ? { livesWith: '', familyRole: '', liveWithWho: '' } : {}),
    }));
  };

  // ── Validation ──────────────────────────────────────────────
  const validatePersonalInfo = () => {
    const required = [
      'fullName', 'gender', 'birthDate', 'birthRegion', 'birthDistrict',
      'residentialWard', 'residentialStreet', 'zone', 'maritalStatus',
      'phone', 'password', 'passwordConfirmation', 'hasDisability'
    ];
    for (const key of required) {
      if (!form[key as keyof typeof form]) {
        Swal.fire({ title: 'Taarifa Inakosekana', text: 'Tafadhali jaza taarifa zote muhimu za binafsi kabla ya kuendelea.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
        setActiveTab(0);
        return false;
      }
    }
    if (form.hasDisability === 'ndio' && !form.disabilityDescription.trim()) {
      Swal.fire({ title: 'Taarifa Inakosekana', text: 'Tafadhali eleza aina ya ulemavu.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
      setActiveTab(0);
      return false;
    }
    if (isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender)) && !form.marriageType) {
      Swal.fire({ title: 'Taarifa Inakosekana', text: 'Tafadhali chagua aina ya ndoa.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
      setActiveTab(0);
      return false;
    }
    if (form.password !== form.passwordConfirmation) {
      Swal.fire({ title: 'Tatizo', text: 'Neno la siri na uthibitisho wa neno la siri havilingani.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
      setActiveTab(0);
      return false;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
  Swal.fire({
    title: 'Barua pepe si sahihi',
    text: 'Tafadhali ingiza barua pepe sahihi.',
    icon: 'error',
    confirmButtonText: 'Sawa',
    confirmButtonColor: '#f0ce32'
  });
  setActiveTab(0);
  return false;
}
    if (!/^\d{10}$/.test(form.phone)) {
      Swal.fire({ title: 'Namba ya simu si sahihi', text: 'Namba ya simu lazima iwe na tarakimu 10 tu.', icon: 'error', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
      setActiveTab(0);
      return false;
    }
    return true;
  };

  const validateFaithInfo = () => {
    const required = ['conversionYear', 'churchOfConversion', 'baptismYear', 'baptizerName', 'baptizerTitle', 'previousChurchStatus'];
    for (const key of required) {
      const value = form[key as keyof typeof form];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        Swal.fire({ title: 'Tahadhari', text: 'Tafadhali jaza taarifa zote muhimu za imani kabla ya kuendelea.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
        setActiveTab(1);
        return false;
      }
    }
    if (form.previousChurchStatus === 'Nimehamia') {
      if (!form.tanguLini?.trim() || !form.kanisaUlipotoka?.trim()) {
        Swal.fire({ title: 'Tahadhari', text: 'Tafadhali jaza taarifa za kanisa ulipotoka.', icon: 'warning', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
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

  // ── Submit ──────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePersonalInfo()) return;
    if (!validateFaithInfo()) return;

    const payload = {
      full_name: form.fullName,
      gender: normalizeGenderValue(form.gender),
      birth_date: form.birthDate,
      birth_place: form.birthPlace || form.birthDistrict,
      birth_region: form.birthRegion,
      birth_district: form.birthDistrict,
      birth_ward: form.birthWard,
      birth_street: form.birthStreet,
      residence: form.residence || `${form.residentialStreet}, ${form.residentialWard}`,
      residential_ward: form.residentialWard,
      residential_street: form.residentialStreet,
      marital_status: normalizeMaritalStatusForApi(form.maritalStatus, form.gender),
      marriage_type: isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender)) ? form.marriageType || null : null,
      spouse_name: isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender)) ? form.spouseName : '',
      children_count: Number(form.childrenCount) || 0,
      zone: form.zone,
      phone: form.phone,
      whatsapp_number: form.whatsappNumber,
      email: form.email,
      password: form.password,
      password_confirmation: form.passwordConfirmation,
      has_disability: form.hasDisability === 'ndio',
      disability_description: form.hasDisability === 'ndio' ? form.disabilityDescription : null,
      // Faith - split date fields
      conversion_year: Number(form.conversionYear) || null,
      conversion_month: form.conversionMonth ? Number(form.conversionMonth) : null,
      conversion_day: form.conversionDay ? Number(form.conversionDay) : null,
      church_of_conversion: form.churchOfConversion,
      baptism_year: Number(form.baptismYear) || null,
      baptism_month: form.baptismMonth ? Number(form.baptismMonth) : null,
      baptism_day: form.baptismDay ? Number(form.baptismDay) : null,
      baptism_place: form.baptismPlace,
      baptizer_name: form.baptizerName,
      baptizer_title: form.baptizerTitle,
      previous_church_status: form.previousChurchStatus,
      tangu_lini: form.tanguLini,
      kanisa_ulipotoka: form.kanisaUlipotoka,
      church_service: form.churchService,
      participates_communion: form.participatesCommunion === 'ndio',
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
        Swal.fire({ title: 'Usajili umefanikiwa!', text: 'Tafadhali ingia kwenye akaunti yako.', icon: 'success', confirmButtonText: 'Ingia' }).then(() => {
          router.push('/login');
        });
        return;
      } else {
        Swal.fire({ title: 'Tatizo', text: `${response.message || 'Kuna Tatizo la kiufundi.'}`, icon: 'error', confirmButtonText: 'Sawa', confirmButtonColor: '#f0ce32' });
      }
    } catch (error: any) {
      if (error?.errors?.email?.[0]) {
        Swal.fire({ title: 'Barua pepe tayari imesajiliwa', text: error.errors.email[0], icon: 'error', confirmButtonText: 'Sawa' });
      } else if (error?.errors?.phone?.[0]) {
        Swal.fire({ title: 'Namba ya simu tayari imesajiliwa', text: error.errors.phone[0], icon: 'error', confirmButtonText: 'Sawa' });
      } else {
        Swal.fire({ title: 'Tatizo', text: error?.message || 'Tatizo limetokea. Jaribu tena.', icon: 'error', confirmButtonText: 'Sawa' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Year / Month / Day helpers ──────────────────────────────
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));
  const months = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Machi' },
    { value: '4', label: 'Aprili' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Julai' }, { value: '8', label: 'Agosti' }, { value: '9', label: 'Septemba' },
    { value: '10', label: 'Oktoba' }, { value: '11', label: 'Novemba' }, { value: '12', label: 'Desemba' },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // ── Tab Content ─────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Field label="Jina Kamili *" name="fullName" value={form.fullName} onChange={handleChange} />
            <Select label="Jinsia *" name="gender" value={form.gender} onChange={handleChange} options={['Mwanaume', 'Mwanamke']} />
            <Field label="Tarehe ya Kuzaliwa *" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />

            {/* Birth Place - 4 fields */}
            <Field label="Mkoa Ulipozaliwa *" name="birthRegion" value={form.birthRegion} onChange={handleChange} />
            <Field label="Wilaya Ulipozaliwa *" name="birthDistrict" value={form.birthDistrict} onChange={handleChange} />
            <Field label="Kata Ulipozaliwa" name="birthWard" value={form.birthWard} onChange={handleChange} />
            <Field label="Mtaa Ulipozaliwa" name="birthStreet" value={form.birthStreet} onChange={handleChange} />

            {/* Residential - 2 fields */}
            <Field label="Kata Unapoishi *" name="residentialWard" value={form.residentialWard} onChange={handleChange} />
            <Field label="Mtaa Unapoishi *" name="residentialStreet" value={form.residentialStreet} onChange={handleChange} />

            {/* Zone - dropdown with new values */}
            <Select label="Mtaa *" name="zone" value={form.zone} onChange={handleChange}
              options={['MURUBOMBO', 'MURUSI B', 'KIGANAMO', 'MURUSI A', 'KUMUNYIKA B', 'KAGUNGA C', 'KUMUNYIKA A', 'KAGUNGA B', 'MURUBONA A', 'KAGUNGA A','MURUBONA B']}
            />

            <Select label="Hali ya ndoa *" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}
              options={MARITAL_STATUS_OPTIONS} />

            {/* Marriage Type - conditional */}
            {isMarriedStatus(form.maritalStatus) && (
              <>
                <Select label="Aina ya Ndoa *" name="marriageType" value={form.marriageType} onChange={handleChange}
                  options={['Kikristo', 'Kiserikali', 'Kienyeji']} />
                <Field label="Jina la Mwenza *" name="spouseName" value={form.spouseName} onChange={handleChange} />
              </>
            )}

            <Field label="Idadi ya Watoto" name="childrenCount" type="number" value={form.childrenCount} onChange={handleChange} />
            <Field label="Namba ya Simu *" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field label="Namba ya WhatsApp (Hiari)" name="whatsappNumber" type="tel" value={form.whatsappNumber} onChange={handleChange} />
            <Field label="Barua Pepe " name="email" type="email" value={form.email} onChange={handleChange} />

            {/* Password with eye toggle */}
            <PasswordField label="Neno la siri *" name="password" value={form.password} onChange={handleChange} />
            <PasswordField label="Thibitisha Neno la siri *" name="passwordConfirmation" value={form.passwordConfirmation} onChange={handleChange} />

            {/* Disability section */}
            <Select label="Je, una ulemavu? *" name="hasDisability" value={form.hasDisability} onChange={handleChange} options={['ndio', 'hapana']} />
            {form.hasDisability === 'ndio' && (
              <Field label="Eleza aina ya ulemavu *" name="disabilityDescription" value={form.disabilityDescription} onChange={handleChange} />
            )}
          </>
        );

      case 1:
        return (
          <>
            {/* Conversion date - split into 3 */}
            <div className="col-span-full">
              <label className="block mb-1 text-sm font-medium text-white">Tarehe ya Kuokoka *</label>
              <div className="grid grid-cols-3 gap-2">
                <select name="conversionYear" value={form.conversionYear} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Mwaka *</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select name="conversionMonth" value={form.conversionMonth} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Mwezi</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select name="conversionDay" value={form.conversionDay} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Siku</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <Field label="Kanisa Ulipookoka " name="churchOfConversion" value={form.churchOfConversion} onChange={handleChange} />

            {/* Baptism date - split into 3 */}
            <div className="col-span-full">
              <label className="block mb-1 text-sm font-medium text-white">Tarehe ya Ubatizo *</label>
              <div className="grid grid-cols-3 gap-2">
                <select name="baptismYear" value={form.baptismYear} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Mwaka *</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select name="baptismMonth" value={form.baptismMonth} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Mwezi</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select name="baptismDay" value={form.baptismDay} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-[#2d314b] text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Siku</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <Field label="Mahali Ulipobatizwa" name="baptismPlace" value={form.baptismPlace} onChange={handleChange} />
            <Field label="Aliyekubatiza *" name="baptizerName" value={form.baptizerName} onChange={handleChange} />
            <Field label="Cheo cha Aliyekubatiza *" name="baptizerTitle" value={form.baptizerTitle} onChange={handleChange} />

            <Select label="Umehamia / Umeokoka Hapa? *" name="previousChurchStatus" value={form.previousChurchStatus} onChange={handleChange}
              options={['Nimehamia', 'Nimeokoka hapa']} />
            {form.previousChurchStatus === 'Nimehamia' && (
              <>
                <Field label="Tangu lini (Mwezi na Mwaka) *" name="tanguLini" value={form.tanguLini} onChange={handleChange} type="month" />
                <Field label="Kanisa Ulipotoka *" name="kanisaUlipotoka" value={form.kanisaUlipotoka} onChange={handleChange} />
              </>
            )}

            <Field label="Huduma Unayofanya" name="churchService" value={form.churchService} onChange={handleChange} />

            {/* Meza ya Bwana */}
            <Select label="Je, unashiriki Meza ya Bwana?" name="participatesCommunion" value={form.participatesCommunion} onChange={handleChange}
              options={['ndio', 'hapana']} />
          </>
        );

      case 2:
        return (
          <>
            <Select label="Kiwango cha Elimu *" name="educationLevel" value={form.educationLevel} onChange={handleChange}
              options={['Sijasoma', 'Elimu ya msingi', 'Elimu ya sekondari', 'Elimu ya chuo', 'Elimu ya chuo kikuu']} />
            <Field label="Taaluma (Hiari)" name="profession" value={form.profession} onChange={handleChange} />
            <Select label="Aina ya Kazi au Shughuli *" name="occupation" value={form.occupation} onChange={handleChange}
              options={['Nimeajiriwa', 'Nimejiajiri', 'Mwanafunzi', 'Sina kazi']} />
            {(form.occupation === 'Nimeajiriwa' || form.occupation === 'Nimejiajiri') && (
              <>
                <Field label="Kazi au Shughuli gani? (Hiari)" name="workPlace" value={form.workPlace} onChange={handleChange} />
                <Field label="Mawasiliano ya Kazi (Hiari)" name="workContact" value={form.workContact} onChange={handleChange} />
              </>
            )}
          </>
        );

      case 3:
        return (
          <>
            <Select label="Unaishi Peke Yako?" name="livesAlone" value={form.livesAlone} onChange={handleChange} options={['ndio', 'hapana']} />
            {form.livesAlone === 'hapana' && (
              <>
                <Select label="Nafasi yako katika Familia" name="familyRole" value={form.familyRole} onChange={handleChange}
                  options={['Mzazi', 'Mtoto', 'Ndugu','Mume','Mke']} />
                <Select label="unaoishi nao" name="liveWithWho" value={form.liveWithWho} onChange={handleChange}
                  options={['Wazazi', 'Ndugu', 'Marafiki','Mume','Mke','Wengine']} />
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
    {/* ❌ Remove Head if using App Router (optional) */}
    <Head>
      <title>Jisajili | FPCT Mahali Pamoja</title>
    </Head>

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] px-4 py-10">
      
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8 text-white">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Fomu ya Usajili wa Mshirika
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-6 gap-3 flex-wrap">
          {tabTitles.map((title, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              type="button"
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeTab === index
                  ? "bg-[#f0ce32] text-black font-bold shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={
            activeTab === tabTitles.length - 1
              ? handleRegister
              : handleNext
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {renderTabContent()}

          <button
            type="submit"
            disabled={loading}
            className="col-span-full mt-6 py-3 bg-[#f0ce32] rounded-lg text-black font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all"
          >
            {loading
              ? "Inasajili..."
              : activeTab === tabTitles.length - 1
              ? "JISAJILI SASA"
              : "Endelea"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-sm">
            Tayari una akaunti?{" "}
            <a
              href="/login"
              className="text-[#f0ce32] underline font-medium"
            >
              Ingia hapa
            </a>
          </p>

          <Link
            href="/"
            className="text-sm font-medium text-[#f0ce32] hover:underline"
          >
            ← Rudi Nyumbani
          </Link>
        </div>
      </div>
    </div>
  </>
);
}

// ── Reusable Components ───────────────────────────────────────

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

function PasswordField({ label, name, value, onChange }: any) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input id={name} name={name} value={value} onChange={onChange} type={show ? 'text' : 'password'}
          className="w-full px-4 py-2 pr-10 border rounded-md bg-[#2d314b] text-white border-gray-500
          focus:outline-none focus:ring-2 focus:ring-pink-500" autoComplete="off" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
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
        {options.map((opt: string | { value: string; label: string }) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
