'use client';

import { useEffect, useState } from 'react';
import { UserIcon } from '@heroicons/react/24/solid';
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
  spouse_name?: string;
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
  is_authorized?: number;
  membership_number?: string;
  number_of_children?: number;
  residential_zone?: string;
  user?: { role: string | null };
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

    // ✅ Show success
    if (data?.status === 'success') {
      alert(data.message || 'Mabadiliko yamehifadhiwa!');
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
          <div className="w-32 h-32 border rounded shadow flex items-center justify-center bg-gray-100">
  <UserIcon className="w-16 h-16 text-gray-400" />
</div>
          <div>
            <span className="text-sm inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded mb-2">
              {member.user?.role || 'Hakuna Nafasi'}
            </span>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <strong>📱</strong> {renderField('phone_number')}
              </p>
              <p>
                <strong>📧</strong> {renderField('email')}
              </p>
              <p>
                <strong>🆔</strong> Namba ya Ushirika:{' '}
                <span className="text-blue-700 font-bold">{member.membership_number || '-'}</span>
              </p>
              <p>📅 Alijiunga: {new Date(member.created_at).toLocaleDateString()}</p>
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
                  <td className="py-2 font-bold">Jinsia</td>
                  <td>{renderField('gender', 'select')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Hali ya Ndoa</td>
                  <td>{renderField('marital_status', 'select')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Tarehe ya Kuzaliwa</td>
                  <td>{renderField('birth_date', 'date')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Mahali pa Kuzaliwa</td>
                  <td>{renderField('birth_place')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Jina la Mke/Mume</td>
                  <td>{renderField('spouse_name')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Hali ya Uanachama</td>
                  <td className="text-green-700">{member.membership_status}</td>
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
                  <td>{renderField('date_of_conversion', 'date')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Kanisa alipo okoka</td>
                  <td>{renderField('church_of_conversion')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Tarehe ya Ubatizo</td>
                  <td>{renderField('baptism_date', 'date')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Mahali pa Ubatizo</td>
                  <td>{renderField('baptism_place')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Aliyebatiza</td>
                  <td>{renderField('baptizer_name')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Kanisa alilotoka</td>
                  <td>{renderField('previous_church')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Huduma anayofanya</td>
                  <td>{renderField('church_service')}</td>
                </tr>
                <tr>
                  {/* <td className="py-2 font-bold">Muda wa huduma</td>
                  <td>{renderField('service_duration')}</td> */}
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
                  <td>{renderField('education_level')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Taaluma</td>
                  <td>{renderField('profession')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Kazi</td>
                  <td>{renderField('occupation')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Sehemu ya Kazi</td>
                  <td>{renderField('work_place')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Mawasiliano ya Kazi</td>
                  <td>{renderField('work_contact')}</td>
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
                  <td>{renderField('number_of_children')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Makazi/Zoni</td>
                  <td>{renderField('residential_zone')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Anaishi peke yake?</td>
                  <td>{renderField('lives_alone', 'checkbox')}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold">Anaishi na nani?</td>
                  <td>{renderField('lives_with')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
