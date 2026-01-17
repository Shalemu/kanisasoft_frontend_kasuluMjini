'use client';

import { useEffect, useState } from 'react';
import {
  FaUsers, FaArrowLeft, FaCrown,
  FaFilePdf, FaFileExcel, FaUserPlus, FaTrash,
} from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

interface Member {
  id: number;
  full_name?: string;
  email?: string;
  role?: string;
  photo_url?: string;
}

interface Props {
  groupId: number;
  groupName: string;
  onBack: () => void;
}

export default function GroupMembersScreen({ groupId, groupName, onBack }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<number | null>(null);
  const perPage = 10;

  const isLeader = currentMemberId === leaderId;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memberRes, profileRes, allMembersRes] = await Promise.all([
          apiFetch(`/groups/${groupId}/members`),
          apiFetch('/mtumiaji/profile'),
          apiFetch('/members'),
        ]);

        if (memberRes?.status === 'success') {
          setMembers(Array.isArray(memberRes.members) ? memberRes.members.filter(Boolean) : []);
          setLeaderId(memberRes.leader_id ?? null);
        }

        if (profileRes?.status === 'success') {
          setCurrentMemberId(profileRes.member_id ?? profileRes.member?.id ?? null);
        }

        if (allMembersRes?.status === 'success') {
          setAllMembers(Array.isArray(allMembersRes.members) ? allMembersRes.members.filter(Boolean) : []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('Hitilafu wakati wa kupakia taarifa.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [groupId]);

  const filtered = members.filter((m) =>
    m &&
    (
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Washiriki wa ${groupName}`, 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['#', 'Jina Kamili', 'Barua Pepe', 'Nafasi']],
      body: filtered.map((m, i) => [
        i + 1,
        (m.full_name || '—') + (m.id === leaderId ? ' (Kiongozi)' : ''),
        m.email || '-',
        m.role || '-',
      ]),
    });
    doc.save(`washiriki_${groupName}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((m, i) => ({
        '#': i + 1,
        Jina: (m.full_name || '—') + (m.id === leaderId ? ' (Kiongozi)' : ''),
        BaruaPepe: m.email || '',
        Nafasi: m.role || '',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Washiriki');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `washiriki_${groupName}.xlsx`);
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm('Una uhakika unataka kuondoa mshiriki huyu?')) return;
    try {
      const res = await apiFetch(`/groups/${groupId}/remove-member`, {
        method: 'POST',
        body: JSON.stringify({ group_id: groupId, member_id: memberId }),
      });
      if (res.status === 'success') {
        toast.success('Mshiriki ameondolewa kikundini.');
        setMembers((prev) => prev.filter((m) => m?.id !== memberId));
      } else {
        toast.error('Imeshindikana kuondoa mshiriki.');
      }
    } catch (err) {
      toast.error('Hitilafu ilitokea.');
    }
  };

  const handleAdd = async () => {
    if (!selectedToAdd) return;
    try {
      const res = await apiFetch(`/groups/${groupId}/add-member`, {
        method: 'POST',
        body: JSON.stringify({ group_id: groupId, member_id: selectedToAdd }),
      });
      if (res.status === 'success') {
        toast.success('Mshiriki ameongezwa kikundini.');
        setMembers((prev) => [...prev, res.member]);
        setShowAddModal(false);
        setSelectedToAdd(null);
      } else {
        toast.error('Imeshindikana kuongeza mshiriki.');
      }
    } catch (err) {
      toast.error('Hitilafu ilitokea.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:underline flex items-center gap-1">
          <FaArrowLeft /> Rudi
        </button>
        <h1 className="text-2xl font-bold mt-3 flex items-center gap-2">
          <FaUsers /> Washiriki wa {groupName}
        </h1>
        <p className="text-gray-600">Jumla: {filtered.length}</p>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tafuta mshiriki..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        {isLeader && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowAddModal(true)} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded flex items-center gap-2">
              <FaUserPlus /> Ongeza
            </button>
            <button onClick={exportToPDF} className="bg-red-100 text-red-800 px-3 py-1.5 rounded flex items-center gap-2">
              <FaFilePdf /> PDF
            </button>
            <button onClick={exportToExcel} className="bg-green-100 text-green-800 px-3 py-1.5 rounded flex items-center gap-2">
              <FaFileExcel /> Excel
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p>⏳ Inapakia...</p>
      ) : filtered.length === 0 ? (
        <p className="italic text-gray-500">Hakuna mshiriki waliopatikana.</p>
      ) : (
        <>
          <div className="rounded-xl bg-white shadow border border-gray-300 divide-y divide-dotted divide-gray-300">
            {paginated.map((m, index) => (
              <div key={m.id} className="py-4 px-6 flex items-start md:items-center justify-between gap-4">
                <div className="w-6 text-sm text-gray-500 font-medium">
                  {(currentPage - 1) * perPage + index + 1}.
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    {m.full_name || '—'}
                    {leaderId === m.id && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <FaCrown className="text-yellow-600" size={12} /> Kiongozi
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.email || '-'}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {m.role && <span className="text-xs text-gray-500 italic">{m.role}</span>}
                  {isLeader && m.id !== leaderId && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1"
                    >
                      <FaTrash /> Ondoa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center items-center gap-2 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Ongeza Mshiriki</h2>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={selectedToAdd ?? ''}
              onChange={(e) => setSelectedToAdd(parseInt(e.target.value))}
            >
              <option value="">-- Chagua mshiriki --</option>
              {allMembers
                .filter((m) => m && !members.some((existing) => existing.id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1 bg-gray-200 rounded">
                Funga
              </button>
              <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white rounded">
                Ongeza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
