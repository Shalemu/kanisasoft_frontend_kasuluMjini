'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface EditMemberModalForm {
  // Personal
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  birthDistrict: string;
  residence: string;
  maritalStatus: string;
  spouseName: string;
  childrenCount: number;
  zone: string;
  phone: string;
  email: string;
  // Faith
  dateOfConversion: string;
  churchOfConversion: string;
  baptismDate: string;
  baptismPlace: string;
  baptizerName: string;
  baptizerTitle: string;
  previousChurchStatus: string;
  tanguLini: string;
  kanisaUlipotoka: string;
  churchService: string;
  serviceDuration: string;
  // Education & Work
  educationLevel: string;
  profession: string;
  occupation: string;
  workPlace: string;
  workContact: string;
  // Family
  livesAlone: string;
  livesWith: string;
  familyRole: string;
  liveWithWho: string;
  nextOfKin: string;
  nextOfKinPhone: string;
}

interface EditMemberModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMember: any) => void;
}

export default function EditMemberModal({ member, isOpen, onClose, onUpdate }: EditMemberModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EditMemberModalForm>({
    fullName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    birthDistrict: '',
    residence: '',
    maritalStatus: '',
    spouseName: '',
    childrenCount: 0,
    zone: '',
    phone: '',
    email: '',
    dateOfConversion: '',
    churchOfConversion: '',
    baptismDate: '',
    baptismPlace: '',
    baptizerName: '',
    baptizerTitle: '',
    previousChurchStatus: '',
    tanguLini: '',
    kanisaUlipotoka: '',
    churchService: '',
    serviceDuration: '',
    educationLevel: '',
    profession: '',
    occupation: '',
    workPlace: '',
    workContact: '',
    livesAlone: '',
    livesWith: '',
    familyRole: '',
    liveWithWho: '',
    nextOfKin: '',
    nextOfKinPhone: '',
  });

  useEffect(() => {
    if (member) {
      setForm({
        fullName: member.full_name || '',
        gender: member.gender === 'M' ? 'Mwanaume' : 'Mwanamke',
        birthDate: member.birth_date || '',
        birthPlace: member.birth_place || '',
        birthDistrict: member.birth_district || '',
        residence: member.residence || '',
        maritalStatus: member.marital_status || '',
        spouseName: member.spouse_name || '',
        childrenCount: member.number_of_children || 0,
        zone: member.zone || '',
        phone: member.phone_number || '',
        email: member.email || '',
        dateOfConversion: member.date_of_conversion || '',
        churchOfConversion: member.church_of_conversion || '',
        baptismDate: member.baptism_date || '',
        baptismPlace: member.baptism_place || '',
        baptizerName: member.baptizer_name || '',
        baptizerTitle: member.baptizer_title || '',
        previousChurchStatus: member.previous_church_status || '',
        tanguLini: member.tangu_lini || '',
        kanisaUlipotoka: member.kanisa_ulipotoka || '',
        churchService: member.church_service || '',
        serviceDuration: member.service_duration || '',
        educationLevel: member.education_level || '',
        profession: member.profession || '',
        occupation: member.occupation || '',
        workPlace: member.work_place || '',
        workContact: member.work_contact || '',
        livesAlone: member.lives_alone ? 'ndio' : 'hapana',
        livesWith: member.lives_with || '',
        familyRole: member.family_role || '',
        liveWithWho: member.live_with_who || '',
        nextOfKin: member.next_of_kin || '',
        nextOfKinPhone: member.next_of_kin_phone || '',
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!member) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        gender: form.gender === 'Mwanaume' ? 'M' : 'F',
        lives_alone: form.livesAlone === 'ndio',
      };

      const response = await apiFetch(`/members/${member.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (response.status === 'success') {
        alert('✅ Taarifa za mshirika zimehifadhiwa.');
        onUpdate(payload);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('⛔ Tatizo limejitokeza. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  const tabTitles = ['Taarifa Binafsi', 'Taarifa za Imani', 'Elimu na Kazi', 'Familia'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Personal
        return (
          <>
            <Field label="Jina Kamili" name="fullName" value={form.fullName} onChange={handleChange} />
            <Select label="Jinsia" name="gender" value={form.gender} onChange={handleChange} options={['Mwanaume','Mwanamke']} />
            <Field label="Tarehe ya Kuzaliwa" type="date" name="birthDate" value={form.birthDate} onChange={handleChange} />
            <Field label="Mahali Ulipozaliwa" name="birthPlace" value={form.birthPlace} onChange={handleChange} />
            <Field label="Kazi / Makazi" name="residence" value={form.residence} onChange={handleChange} />
            <Select label="Zoni" name="zone" value={form.zone} onChange={handleChange} options={['Kigamboni','Kizuiani','Mtongani','Yerusalem','Tandika','Kijichi','Mgeninani','Keko & Kurasini','Kinondoni','Kongowe','Mbande','Kingugi']} />
            <Select label="Hali ya Ndoa" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} options={['Nimeoa','Nimeolewa','Sijaoa','Sijaolewa','Mjane','Mgane']} />
            {['Nimeoa','Nimeolewa'].includes(form.maritalStatus) && (
              <Field label="Jina la Mwenza" name="spouseName" value={form.spouseName} onChange={handleChange} />
            )}
            <Field label="Idadi ya Watoto" type="number" name="childrenCount" value={form.childrenCount} onChange={handleChange} />
            <Field label="Namba ya Simu" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Barua Pepe" name="email" value={form.email} onChange={handleChange} />
          </>
        );
      case 1: // Faith
        return (
          <>
            <Field label="Tarehe ya Kuokoka" type="date" name="dateOfConversion" value={form.dateOfConversion} onChange={handleChange} />
            <Field label="Kanisa Ulipookoka" name="churchOfConversion" value={form.churchOfConversion} onChange={handleChange} />
            <Field label="Tarehe ya Ubatizo" type="date" name="baptismDate" value={form.baptismDate} onChange={handleChange} />
            <Field label="Mahali Ulipobatizwa" name="baptismPlace" value={form.baptismPlace} onChange={handleChange} />
            <Field label="Aliyekubatiza" name="baptizerName" value={form.baptizerName} onChange={handleChange} />
            <Field label="Cheo cha Aliyekubatiza" name="baptizerTitle" value={form.baptizerTitle} onChange={handleChange} />
            <Select label="Umehamia / Umeokoka Hapa?" name="previousChurchStatus" value={form.previousChurchStatus} onChange={handleChange} options={['Nimehamia','Nimeokoka hapa']} />
            {form.previousChurchStatus === 'Nimehamia' && (
              <>
                <Field label="Tangu lini" type="month" name="tanguLini" value={form.tanguLini} onChange={handleChange} />
                <Field label="Kanisa Ulipotoka" name="kanisaUlipotoka" value={form.kanisaUlipotoka} onChange={handleChange} />
              </>
            )}
            <Field label="Huduma Unayofanya (hiari)" name="churchService" value={form.churchService} onChange={handleChange} />
          </>
        );
      case 2: // Education/Work
        return (
          <>
            <Select label="Elimu" name="educationLevel" value={form.educationLevel} onChange={handleChange} options={['Sijasoma','Elimu ya msingi','Elimu ya sekondari','Elimu ya chuo','Elimu ya chuo kikuu']} />
            <Field label="Taaluma" name="profession" value={form.profession} onChange={handleChange} />
            <Select label="Kazi/Shughuli" name="occupation" value={form.occupation} onChange={handleChange} options={['Nimeajiriwa','Nimejiajiri','Mwanafunzi','Sina kazi']} />
            {(form.occupation === 'Nimeajiriwa' || form.occupation === 'Nimejiajiri') && (
              <>
                <Field label="Sehemu ya Kazi" name="workPlace" value={form.workPlace} onChange={handleChange} />
                <Field label="Mawasiliano ya Kazi" name="workContact" value={form.workContact} onChange={handleChange} />
              </>
            )}
          </>
        );
      case 3: // Family
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
            <Field label="Namba ya Simu ya Mtu wa Karibu" name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange} />
          </>
        );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">Rekebisha Mshirika</Dialog.Title>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {['Binafsi','Imani','Elimu/Kazi','Familia'].map((title, idx) => (
                    <button key={idx} className={`px-3 py-1 rounded ${activeTab === idx ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab(idx)}>
                      {title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderTabContent()}</div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Ghairi</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-yellow-600 text-white rounded" disabled={loading}>
                    {loading ? 'Inasajili...' : 'Hifadhi'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Reusable input components
function Field({ label, name, value, onChange, type = 'text' }: any) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500" />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500">
        <option value="">-- Chagua --</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
