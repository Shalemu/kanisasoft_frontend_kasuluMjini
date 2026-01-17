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

export default function WashirikaDetails({
  memberId,
  onBack,
}: {
  memberId: number;
  onBack: () => void;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    const fetchMember = async () => {
      try {
        const response = await apiFetch(`/members/${memberId}`);
        if (response?.member) {
          setMember(response.member);
        }
      } catch (error) {
        console.error('Failed to fetch member:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  if (loading) return <p className="text-gray-500 p-8">Inapakia...</p>;
  if (!member) return <p className="text-red-500 p-8">Mshirika hakupatikana.</p>;

  const renderRow = (label: string, value: any, highlight = false) => (
    <tr>
      <td className={`py-2 w-1/3 font-bold ${highlight ? 'text-green-700' : 'text-gray-700'}`}>
        {label}
      </td>
      <td className="text-gray-800">{value ?? '-'}</td>
    </tr>
  );

  return (
    <div className="py-10 px-4 md:px-10 bg-white rounded shadow-sm border border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">{member.full_name}</h1>
          <button
            onClick={onBack}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            🔙 Rudi kwenye orodha
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 border-b pb-6 mb-8">
          <img
            src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${member.full_name}`}
            alt="Avatar"
            className="w-32 h-32 border rounded shadow"
          />
          <div>
            <span className="text-sm inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded mb-2">
              {member.user?.role || 'Hakuna Nafasi'}
            </span>

            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>📱</strong> {member.phone_number}</p>
              <p><strong>📧</strong> {member.email}</p>
              <p><strong>🆔</strong> Namba ya Ushirika: <span className="text-blue-700 font-bold">{member.membership_number || '—'}</span></p>
              <p>📅 Alijiunga: {new Date(member.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
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
    </div>
  );
}
