'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface Guest {
  id: number;
  full_name: string;
  phone: string | null;
  church_origin: string;
  visit_date: string | null;
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string | null;
}

const reasons = [
  'Yote',
  'Maombi',
  'Kuokoka',
  'Kujiunga na Ushirika',
  'Safari',
  'Nyingine',
];

export default function WageniTab() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState('Yote');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await apiFetch('/guests');
      setGuests(res.guests || []);
    } catch (error) {
      console.error('❌ Failed to fetch guests:', error);
    }
  };

  const filtered = guests.filter((v) => {
    const nameMatch = v.full_name.toLowerCase().includes(search.toLowerCase());
    const reasonMatch =
      selectedReason === 'Yote' ||
      (selectedReason === 'Maombi' && v.prayer) ||
      (selectedReason === 'Kuokoka' && v.salvation) ||
      (selectedReason === 'Kujiunga na Ushirika' && v.joining) ||
      (selectedReason === 'Safari' && v.travel) ||
      (selectedReason === 'Nyingine' && !!v.other);
    return nameMatch && reasonMatch;
  });

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        👥 Wageni Waliohudhuria
      </h2>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 w-full">
        <div className="flex items-center border px-4 py-2 rounded-lg bg-white shadow-sm w-full md:w-1/2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta jina la mgeni..."
            className="w-full outline-none text-sm text-gray-800"
          />
        </div>

        <div className="flex items-center border px-3 py-2 rounded-lg bg-white shadow-sm w-full md:w-1/3">
          <FaFilter className="text-gray-400 mr-2" />
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-700"
          >
            {reasons.map((reason, i) => (
              <option key={i} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              <th className="text-left px-6 py-3">Tarehe</th>
              <th className="text-left px-6 py-3">Jina Kamili</th>
              <th className="text-left px-6 py-3">Simu</th>
              <th className="text-left px-6 py-3">Kanisa Alikotoka</th>
              <th className="text-left px-6 py-3">Sababu ya Kutembelea</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(v.visit_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{v.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{v.phone ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{v.church_origin}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {v.prayer && <ReasonBadge label="Maombi" />}
                    {v.salvation && <ReasonBadge label="Kuokoka" />}
                    {v.joining && <ReasonBadge label="Kujiunga na Ushirika" />}
                    {v.travel && <ReasonBadge label="Safari" />}
                    {v.other && <ReasonBadge label={v.other} />}
                    {!v.prayer && !v.salvation && !v.joining && !v.travel && !v.other && (
                      <span className="text-gray-400 italic">
                        Hakuna sababu iliyoainishwa
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReasonBadge({ label }: { label: string }) {
  return (
    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
      {label}
    </span>
  );
}
