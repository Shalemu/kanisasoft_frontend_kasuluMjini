'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Member {
  id: number;
  full_name: string;
  phone_number?: string;
  gender?: string;
}

export default function GroupMembers({ groupId, onBack }: { groupId: number; onBack: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchGroup = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGroupName(data.group.name);
        setMembers(data.group.members || []);
        setLeaderId(data.group.leader_id || null);
      }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    let filtered = members;
    if (search) {
      filtered = filtered.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()));
    }
    if (genderFilter) {
      filtered = filtered.filter((m) => m.gender === genderFilter);
    }
    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, search, genderFilter]);

  const currentMembers = filteredMembers.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredMembers.length / perPage);

  const toggleSelect = (id: number) => {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const currentIds = currentMembers.map((m) => m.id);
    if (currentIds.every((id) => selectedMemberIds.includes(id))) {
      setSelectedMemberIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedMemberIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Orodha ya Washirika - ${groupName}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['#', 'Jina Kamili', 'Jinsia', 'Namba ya Simu']],
      body: filteredMembers.map((m, index) => [
        index + 1,
        m.full_name,
        m.gender === 'M' ? 'Me' : m.gender === 'F' ? 'Ke' : '—',
        m.phone_number || '—',
      ]),
    });
    doc.save(`${groupName}_members.pdf`);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredMembers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GroupMembers');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${groupName}_members.xlsx`);
  };

  const appointLeader = async () => {
    if (selectedMemberIds.length !== 1) return alert('Chagua mshirika mmoja tu.');
    const selectedId = selectedMemberIds[0];
    const isSame = selectedId === leaderId;
    if (!confirm(isSame ? 'Ondoa kiongozi huyu?' : 'Teua huyu kuwa kiongozi?')) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/assign-leader`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ member_id: isSame ? null : selectedId }),
    });
    const result = await res.json();
    if (result.status === 'success') {
      setLeaderId(isSame ? null : selectedId);
      setSelectedMemberIds([]);
    }
  };

  const removeMembers = async () => {
    if (selectedMemberIds.length === 0) return alert('Chagua washirika wa kuondoa.');
    if (!confirm('Una uhakika unataka kuwaondoa hawa washirika?')) return;
    for (const memberId of selectedMemberIds) {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ member_id: memberId }),
      });
    }
    setMembers((prev) => prev.filter((m) => !selectedMemberIds.includes(m.id)));
    setSelectedMemberIds([]);
  };

  return (
    <div className="bg-white p-6 rounded shadow border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Wanachama wa <span className="text-blue-600">{groupName}</span></h2>
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm">⬅️ Rudi</button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex flex-grow gap-3 w-full md:w-2/3">
          <input
            type="text"
            placeholder="🔍 Tafuta kwa jina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          >
            <option value="">Jinsia zote</option>
            <option value="M">Me</option>
            <option value="F">Ke</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {selectedMemberIds.length === 1 && (
            <button onClick={appointLeader} className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded text-sm">
              ⭐ {selectedMemberIds[0] === leaderId ? 'Ondoa Kiongozi' : 'Teua Kiongozi'}
            </button>
          )}
          {selectedMemberIds.length > 0 && (
            <button onClick={removeMembers} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm">
              ❌ Ondoa {selectedMemberIds.length} Mshirika
            </button>
          )}
          <button onClick={handleExport} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm">📥 Excel</button>
          <button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">📄 PDF</button>
        </div>
      </div>

      {currentMembers.length === 0 ? (
        <p className="text-sm text-gray-500">Hakuna washirika wa kuonyesha.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          <div className="flex items-center gap-4 py-3 px-2 font-semibold text-gray-700">
            <input type="checkbox" checked={currentMembers.every(m => selectedMemberIds.includes(m.id))} onChange={toggleSelectAll} className="form-checkbox h-5 w-5 text-blue-600" />
            <div className="w-6">#</div>
            <div className="w-12"></div>
            <div className="flex-1">Jina</div>
          </div>
          {currentMembers.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center gap-4 py-4 px-2 hover:bg-gray-50 transition-all ${leaderId === member.id ? 'bg-yellow-100' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(member.id)}
                onChange={() => toggleSelect(member.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <div className="w-6 text-xs text-gray-500 font-bold">{(currentPage - 1) * perPage + index + 1}</div>
              <img
                src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${member.full_name}`}
                alt="avatar"
                className="w-12 h-12 rounded-full border shadow-sm"
              />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800">
                  {member.full_name}
                  {leaderId === member.id && <span className="ml-2 text-xs text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">⭐ Kiongozi</span>}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="block">Jinsia: {member.gender === 'M' ? 'Me' : member.gender === 'F' ? 'Ke' : '—'}</span>
                  <span className="block">Simu: {member.phone_number || 'Hakuna namba ya simu'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">⬅️</button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-sm rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">➡️</button>
        </div>
      )}
    </div>
  );
}
