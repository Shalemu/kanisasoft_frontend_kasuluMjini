'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, EnvelopeIcon, IdentificationIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/solid';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

export type Member = {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  membership_status: string;
  created_at: string;

  /* =========================
   * PERSONAL INFO
   * ========================= */

  gender?: 'M' | 'F';

  marital_status?: string;
  marriage_type?: string;
  spouse_name?: string;

  birth_date?: string;

  birth_place?: string;

  birth_region?: string;
  birth_district?: string;
  birth_ward?: string;
  birth_street?: string;

  /* =========================
   * RESIDENCE
   * ========================= */

  residential_zone?: string;
  residential_ward?: string;
  residential_street?: string;

  residence?: string; // 👈 from payload

  /* =========================
   * FAMILY
   * ========================= */

  number_of_children?: number;
  lives_alone?: 0 | 1;
  lives_with?: string;

  family_role?: string;
  live_with_who?: string;
  next_of_kin?: string;
  next_of_kin_phone?: string;

  /* =========================
   * CONTACT
   * ========================= */

  whatsapp_number?: string;

  /* =========================
   * FAITH INFO
   * ========================= */

  date_of_conversion?: string;
  church_of_conversion?: string;

  conversion_year?: number;
  conversion_month?: number;
  conversion_day?: number;

  baptism_date?: string;
  baptism_place?: string;
  baptizer_name?: string;
  baptizer_title?: string;

  baptism_year?: number;
  baptism_month?: number;
  baptism_day?: number;

  church_service?: string;
  service_duration?: string;

  participates_communion?: 0 | 1;

  previous_church?: string;

  previous_church_status?: string;
  tangu_lini?: string;
  kanisa_ulipotoka?: string;

  /* =========================
   * EDUCATION & WORK
   * ========================= */

  education_level?: string;
  profession?: string;
  occupation?: string;
  work_place?: string;
  work_contact?: string;

  /* =========================
   * DISABILITY
   * ========================= */

  has_disability?: 0 | 1;
  disability_description?: string;

  /* =========================
   * SYSTEM
   * ========================= */

  is_authorized?: 0 | 1;
  membership_number?: string;

  user?: {
    role: string | null;
  };
};

export default function WashirikaDetails({
   userId, 
  onBack,
}: {
  userId: number;
  onBack: () => void;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({});

 useEffect(() => {
  if (!userId) return;

  const fetchMember = async () => {
    try {
      const response = await apiFetch(`/members/by-user/${userId}`);
      if (response?.member) {
        setMember(response.member);
        setEditValues(response.member);
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchMember();
}, [userId]);

  if (loading) return <p className="text-gray-500 p-8">Inapakia...</p>;
  if (!member) return <p className="text-red-500 p-8">Mshirika hakupatikana.</p>;

  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const normalizePayload = () => {
    const payload: any = { ...editValues };

    // Normalize empty dropdowns / selects to null
    ['marital_status', 'gender', 'membership_status'].forEach((key) => {
      if (!payload[key] || payload[key] === '-Chagua-') payload[key] = null;
    });

    // Normalize numbers
    payload.number_of_children =
      payload.number_of_children === '' || payload.number_of_children === undefined
        ? null
        : Number(payload.number_of_children);

    // Normalize booleans
    payload.lives_alone = payload.lives_alone ?? false;
    payload.is_authorized = payload.is_authorized ?? member.is_authorized ?? 0;

    // Ensure defaults for membership fields
    payload.membership_status = payload.membership_status || member.membership_status || 'active';
    payload.membership_number = payload.membership_number || member.membership_number || '0002';

    // Clear spouse_name if not married
    if (payload.marital_status !== 'Ndoa') payload.spouse_name = null;

    return payload;
  };

const handleSave = async () => {
  try {
    const payload = normalizePayload();

    const data = await apiFetch(`/members/${member.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(payload),
    });

  
    if (data?.status === 'success') {
      Swal.fire({
  title: 'Imefanikiwa!',
  text: data.message || 'Mabadiliko yamehifadhiwa!',
  icon: 'success',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
      setMember(data.member); // update local state with fresh data
      setEditValues(data.member);
      setIsEditing(false);
    } else {
      alert('Something went wrong.');
      console.log('Unexpected response:', data);
    }

  } catch (err: any) {
    if (err.response?.status === 422) {
      const errorData = await err.response.json();
      console.log("Validation errors:", errorData.errors);
      alert(JSON.stringify(errorData.errors, null, 2));
      return;
    }

    alert(`Network / Server error:\n${err.message}`);
  }
};


  const renderField = (field: string, type: string = 'text') => {
    const value = isEditing ? editValues[field] : member[field as keyof Member];
    if (isEditing) {
      if (type === 'select') {
        if (field === 'gender') {
          return (
            <select
              value={value || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className="border p-1 rounded w-full"
            >
              <option value="">-Chagua-</option>
              <option value="M">Me</option>
              <option value="F">Ke</option>
            </select>
          );
        }
        if (field === 'marital_status') {
          return (
            <select
              value={value || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className="border p-1 rounded w-full"
            >
              <option value="">-Chagua-</option>
              <option value="Ndoa">Ndoa</option>
              <option value="Bila ndoa">Bila ndoa</option>
            </select>
          );
        }
      } else if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleChange(field, e.target.checked)}
          />
        );
      } else if (type === 'date') {
        return (
          <input
            type="date"
            value={value?.slice(0, 10) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="border p-1 rounded w-full"
          />
        );
      } else {
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="border p-1 rounded w-full"
          />
        );
      }
    } else {
      if (type === 'checkbox') return value ? 'Ndiyo' : 'Hapana';
      if (type === 'date') return value ? value.slice(0, 10) : '-';
      return value ?? '-';
    }
  };

  return (
    <div className="py-10 px-4 md:px-10 bg-white rounded shadow-sm border border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
         <h1 className="text-xl font-bold text-gray-800">
  {isEditing ? (
    <input
      type="text"
      value={editValues.full_name || ''}
      onChange={(e) => handleChange('full_name', e.target.value)}
      className="border p-1 rounded w-full text-xl font-bold"
    />
  ) : (
    member.full_name
  )}
</h1>
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              🔙 Rudi kwenye orodha
            </button>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`text-sm px-4 py-2 rounded ${
                isEditing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {isEditing ? 'Hifadhi Mabadiliko' : '✏️ Hariri Mshirika'}
            </button>
          </div>
        </div>

        {/* Top Info */}
<div className="flex flex-col md:flex-row gap-8 border-b pb-6 mb-8">
  
  {/* Avatar */}
  <div className="w-32 h-32 border rounded shadow flex items-center justify-center bg-gray-100">
    <UserIcon className="w-16 h-16 text-gray-400" />
  </div>

  {/* Info */}
  <div>
    <span className="text-sm inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded mb-2">
      {member.user?.role || 'Hakuna Nafasi'}
    </span>

    <div className="space-y-2 text-sm text-gray-700">

      {/* Phone */}
      <p className="flex items-center gap-2">
        <PhoneIcon className="w-4 h-4 text-gray-500" />
        <span>{member.phone_number ?? '-'}</span>
      </p>

      {/* Email */}
      <p className="flex items-center gap-2">
        <EnvelopeIcon className="w-4 h-4 text-gray-500" />
        <span>{member.email ?? '-'}</span>
      </p>

      {/* Membership */}
      <p className="flex items-center gap-2">
        <IdentificationIcon className="w-4 h-4 text-gray-500" />
        <span>
          Namba ya Ushirika:{' '}
          <span className="text-blue-700 font-bold">
            {member.membership_number || '-'}
          </span>
        </span>
      </p>

      {/* Date joined */}
      <p className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span>
          Alijiunga:{' '}
          {member.created_at
            ? new Date(member.created_at).toLocaleDateString()
            : '-'}
        </span>
      </p>

    </div>
  </div>
</div>

       {/* Tables */}
        <div className="grid md:grid-cols-2 gap-10">

       {/* Personal Info */}
<div>
  <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">
    Taarifa Binafsi
  </h2>

  <table className="w-full text-sm">
    <tbody className="divide-y divide-gray-200">

      <tr>
        <td className="py-2 font-bold">Jina Kamili</td>
        <td>{member.full_name ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Namba ya Uanachama</td>
        <td>{member.membership_number ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Hali ya Idhini</td>
        <td>
          {member.is_authorized == 1
            ? 'Imeidhinishwa'
            : member.is_authorized == 0
            ? 'Haijaidhinishwa'
            : '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Jinsia</td>
        <td>{member.gender ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Tarehe ya Kuzaliwa</td>
        <td>{member.birth_date ?? '-'}</td>
      </tr>

      {/* BIRTH DETAILS (FULL) */}
      <tr>
        <td className="py-2 font-bold">Mkoa wa Kuzaliwa</td>
        <td>{member.birth_region ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Wilaya ya Kuzaliwa</td>
        <td>{member.birth_district ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kata ya Kuzaliwa</td>
        <td>{member.birth_ward ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mtaa wa Kuzaliwa</td>
        <td>{member.birth_street ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mahali pa Kuzaliwa (Combined)</td>
        <td>
          {[
            member.birth_region,
            member.birth_district,
            member.birth_ward,
            member.birth_street
          ].filter(Boolean).join(' / ') || '-'}
        </td>
      </tr>

      {/* RESIDENCE */}
      <tr>
        <td className="py-2 font-bold">Mkoa wa Makazi</td>
        <td>{member.residential_zone ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kata ya Makazi</td>
        <td>{member.residential_ward ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mtaa wa Makazi</td>
        <td>{member.residential_street ?? '-'}</td>
      </tr>

      {/* FAMILY CORE */}
      <tr>
        <td className="py-2 font-bold">Hali ya Ndoa</td>
        <td>{member.marital_status ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Aina ya Ndoa</td>
        <td>{member.marriage_type ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Jina la Mwenza</td>
        <td>{member.spouse_name ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Idadi ya Watoto</td>
        <td>{member.number_of_children ?? '-'}</td>
      </tr>

      {/* CONTACT */}
      <tr>
        <td className="py-2 font-bold">Simu</td>
        <td>{member.phone_number ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">WhatsApp</td>
        <td>{member.whatsapp_number ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Barua Pepe</td>
        <td>{member.email ?? '-'}</td>
      </tr>

      {/* DISABILITY */}
      <tr>
        <td className="py-2 font-bold">Ulemavu</td>
        <td>
          {member.has_disability == 1
            ? member.disability_description ?? 'Ndiyo'
            : 'Hapana'}
        </td>
      </tr>

      {/* FAITH */}
      <tr>
        <td className="py-2 font-bold">Siku ya Uongofu</td>
        <td>
          {[
            member.conversion_year,
            member.conversion_month,
            member.conversion_day
          ].filter(Boolean).join('-') || member.date_of_conversion || '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kanisa la Uongofu</td>
        <td>{member.church_of_conversion ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Huduma ya Kanisa</td>
        <td>{member.church_service ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Muda wa Huduma</td>
        <td>{member.service_duration ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Komunyo</td>
        <td>
          {member.participates_communion == 1
            ? 'Ndiyo'
            : member.participates_communion == 0
            ? 'Hapana'
            : '-'}
        </td>
      </tr>

      {/* STATUS */}
      <tr>
        <td className="py-2 font-bold">Hali ya Uanachama</td>
        <td className="text-green-700">
          {member.membership_status ?? '-'}
        </td>
      </tr>

    </tbody>
  </table>
</div>
          {/* Faith Info */}
<div>
  <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">
    Taarifa za Imani
  </h2>

  <table className="w-full text-sm">
    <tbody className="divide-y divide-gray-200">

      <tr>
        <td className="py-2 font-bold">Tarehe ya Kuokoka</td>
        <td>
          {[
            member.conversion_year,
            member.conversion_month,
            member.conversion_day
          ].filter(Boolean).join('-') || member.date_of_conversion || '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kanisa alipo okoka</td>
        <td>{member.church_of_conversion ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Tarehe ya Ubatizo</td>
        <td>
          {[
            member.baptism_year,
            member.baptism_month,
            member.baptism_day
          ].filter(Boolean).join('-') || member.baptism_date || '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mahali pa Ubatizo</td>
        <td>{member.baptism_place ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Aliyebatiza</td>
        <td>
          {[member.baptizer_name, member.baptizer_title]
            .filter(Boolean)
            .join(' - ') || '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kanisa alilotoka</td>
        <td>{member.previous_church ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Huduma anayofanya</td>
        <td>{member.church_service ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Muda wa huduma</td>
        <td>{member.service_duration ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Anashiriki Komunyo</td>
        <td>{member.participates_communion == 1 ? 'Ndiyo' : 'Hapana'}</td>
      </tr>

    </tbody>
  </table>
</div>

  {/* Education & Work */}
<div>
  <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">
    Elimu & Kazi
  </h2>

  <table className="w-full text-sm">
    <tbody className="divide-y divide-gray-200">

      <tr>
        <td className="py-2 font-bold">Kiwango cha Elimu</td>
        <td>{member.education_level ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Taaluma</td>
        <td>{member.profession ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Kazi</td>
        <td>{member.occupation ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Sehemu ya Kazi</td>
        <td>{member.work_place ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mawasiliano ya Kazi</td>
        <td>{member.work_contact ?? '-'}</td>
      </tr>

      {/* EXTRA (from your payload) */}
      <tr>
        <td className="py-2 font-bold">Jukumu la Familia</td>
        <td>{member.family_role ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Anaishi na Nani</td>
        <td>{member.live_with_who ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Ndugu wa Karibu</td>
        <td>{member.next_of_kin ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Simu ya Ndugu wa Karibu</td>
        <td>{member.next_of_kin_phone ?? '-'}</td>
      </tr>

    </tbody>
  </table>
</div>
    {/* Family */}
<div>
  <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">
    Familia
  </h2>

  <table className="w-full text-sm">
    <tbody className="divide-y divide-gray-200">

      <tr>
        <td className="py-2 font-bold">Idadi ya Watoto</td>
        <td>{member.number_of_children ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Makazi/Mtaa</td>
        <td>{member.residential_zone ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Anaishi peke yake?</td>
        <td>
          {member.lives_alone == 1
            ? 'Ndiyo'
            : member.lives_alone == 0
            ? 'Hapana'
            : '-'}
        </td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Anaishi na nani?</td>
        <td>{member.lives_with ?? '-'}</td>
      </tr>

      {/* EXTRA FAMILY INFO (FROM YOUR PAYLOAD) */}

      <tr>
        <td className="py-2 font-bold">Jukumu la Familia</td>
        <td>{member.family_role ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Anaishi na (maelezo)</td>
        <td>{member.live_with_who ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Mtu wa Karibu (Next of Kin)</td>
        <td>{member.next_of_kin ?? '-'}</td>
      </tr>

      <tr>
        <td className="py-2 font-bold">Simu ya Next of Kin</td>
        <td>{member.next_of_kin_phone ?? '-'}</td>
      </tr>

    </tbody>
  </table>
</div>
        </div>
      </div>
    </div>
  );
}
