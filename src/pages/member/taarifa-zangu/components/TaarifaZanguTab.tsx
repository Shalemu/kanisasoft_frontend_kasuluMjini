'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Member = {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  membership_status: string;
  created_at: string;
  birth_date?: string;
  birth_place?: string;
  gender?: string;
  marital_status?: string;
  date_of_conversion?: string;
  church_of_conversion?: string;
  baptism_date?: string;
  baptism_place?: string;
  baptizer_name?: string;
  previous_church?: string;
  church_service?: string;
  service_duration?: string;
  education_level?: string;
  profession?: string;
  occupation?: string;
  work_place?: string;
  work_contact?: string;
  lives_alone?: boolean;
  lives_with?: string;
  membership_number?: string;
  number_of_children?: number;
  residential_zone?: string;
  user?: {
    role: string | null;
  };
};

export default function TaarifaZangu() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/mtumiaji/profile');
        if (res?.member || res?.full_name) {
          setMember(res.member ?? res);
        }
      } catch (err) {
        console.error('Error fetching member info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const renderRow = (label: string, value: any, highlight = false) => (
    <tr>
      <td className={`py-2 pr-2 w-1/2 font-medium ${highlight ? 'text-green-700' : 'text-gray-700'}`}>{label}</td>
      <td className="py-2 text-gray-800 break-words">{value ?? '-'}</td>
    </tr>
  );

  if (loading) return <p className="p-6 text-gray-600">⏳ Inapakia taarifa zako...</p>;
  if (!member) return <p className="p-6 text-red-600">❌ Hakuna taarifa za kuonyesha.</p>;

  return (
    <div className="py-8 px-4 md:px-10 bg-white rounded shadow-sm border border-gray-200 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 border-b pb-6">
        <img
          src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${member.full_name}`}
          alt="Avatar"
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border shadow"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{member.full_name}</h1>
          <p className="text-sm text-gray-600">{member.user?.role ? `Nafasi: ${member.user.role}` : 'Hakuna Nafasi'}</p>
          <p className="text-sm text-gray-600">📱 {member.phone_number}</p>
          <p className="text-sm text-gray-600">📧 {member.email}</p>
          <p className="text-sm text-gray-600">🆔 Namba ya Ushirika: <strong className="text-blue-700">{member.membership_number || '—'}</strong></p>
          <p className="text-sm text-gray-600">📅 Alijiunga: {new Date(member.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Taarifa Binafsi */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">Taarifa Binafsi</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {renderRow('Jinsia', member.gender === 'M' ? 'Me' : member.gender === 'F' ? 'Ke' : '-')}
              {renderRow('Hali ya Ndoa', member.marital_status)}
              {renderRow('Tarehe ya Kuzaliwa', member.birth_date?.slice(0, 10))}
              {renderRow('Mahali pa Kuzaliwa', member.birth_place)}
              {renderRow('Hali ya Uanachama', member.membership_status, true)}
            </tbody>
          </table>
        </div>

        {/* Taarifa za Imani */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">Taarifa za Imani</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {renderRow('Tarehe ya Kuokoka', member.date_of_conversion)}
              {renderRow('Kanisa alipo okoka', member.church_of_conversion)}
              {renderRow('Tarehe ya Ubatizo', member.baptism_date)}
              {renderRow('Mahali pa Ubatizo', member.baptism_place)}
              {renderRow('Aliyebatiza', member.baptizer_name)}
              {renderRow('Kanisa alilotoka', member.previous_church)}
              {renderRow('Huduma anayofanya', member.church_service)}
              {renderRow('Muda wa huduma', member.service_duration)}
            </tbody>
          </table>
        </div>

        {/* Elimu & Kazi */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">Elimu &amp; Kazi</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {renderRow('Kiwango cha Elimu', member.education_level)}
              {renderRow('Taaluma', member.profession)}
              {renderRow('Kazi', member.occupation)}
              {renderRow('Sehemu ya Kazi', member.work_place)}
              {renderRow('Mawasiliano ya Kazi', member.work_contact)}
            </tbody>
          </table>
        </div>

        {/* Familia */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">Familia</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {renderRow('Idadi ya Watoto', member.number_of_children)}
              {renderRow('Makazi/Zoni', member.residential_zone)}
              {renderRow('Anaishi peke yake?', member.lives_alone ? 'Ndiyo' : 'Hapana')}
              {renderRow('Anaishi na nani?', member.lives_with)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
