'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import {
  FaArrowLeft,
  FaUsers,
  FaCrown,
  FaWhatsapp,
  FaFileExcel,
  FaFilePdf,
  FaTrash,
  FaUserTie,
  FaSearch,
} from 'react-icons/fa';


interface Member {
  id: number;
  full_name: string;
  phone_number?: string;
  gender?: string;
  membership_number: string;
}

interface Leader {
  id: number;
  full_name: string;
  membership_number: string;
}

export default function GroupMembers({
  groupId,
  onBack,
}: {
  groupId: number;
  onBack: () => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  const [groupName, setGroupName] = useState('');
  const [leader, setLeader] = useState<Leader | null>(null);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [whatsappLink, setWhatsappLink] = useState('');

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        const group = data.group;

        setGroupName(group.name);
        setMembers(group.members || []);
        setLeader(group.leader || null);
        setLeaderId(group.leader?.id || null);
        setWhatsappLink(group.whatsapp_link || '');
      }
    };

    fetchGroup();
  }, [groupId]);

  // Filtering
  useEffect(() => {
    let filtered = members;

    if (search) {
      filtered = filtered.filter((m) =>
        m.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (genderFilter) {
      filtered = filtered.filter((m) => m.gender === genderFilter);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, search, genderFilter]);

  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const totalPages = Math.ceil(filteredMembers.length / perPage);

  // Selection logic
  const toggleSelect = (id: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = currentMembers.map((m) => m.id);

    if (currentIds.every((id) => selectedMemberIds.includes(id))) {
      setSelectedMemberIds((prev) =>
        prev.filter((id) => !currentIds.includes(id))
      );
    } else {
      setSelectedMemberIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  // Assign / Remove Leader
  const appointLeader = async () => {
  if (selectedMemberIds.length !== 1) {
    Swal.fire({
      title: 'Tahadhari!',
      text: 'Chagua mshirika mmoja tu.',
      icon: 'warning',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f44336',
    });
    return;
  }

  const selectedId = selectedMemberIds[0];
  const selectedMember = members.find((m) => m.id === selectedId);
  if (!selectedMember) return;

  const isSame = selectedId === leaderId;

  Swal.fire({
    title: 'Uhakika?',
    text: isSame ? 'Ondoa kiongozi huyu?' : 'Teua huyu kuwa kiongozi?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: isSame ? 'Ndio, ondoa' : 'Ndio, teua',
    cancelButtonText: 'Hapana',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#3085d6',
  }).then(async (result) => {
    if (!result.isConfirmed) return; // stop if user clicks "Hapana"

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/assign-leader`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            membership_number: isSame ? null : selectedMember.membership_number,
          }),
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        setLeader(isSame ? null : selectedMember);
        setLeaderId(isSame ? null : selectedId);
        setSelectedMemberIds([]);

        Swal.fire({
          title: 'Imefanikiwa!',
          text: isSame ? 'Kiongozi ameondolewa kikamilifu.' : 'Kiongozi amewekwa kikamilifu.',
          icon: 'success',
          confirmButtonText: 'Sawa',
          confirmButtonColor: '#f0ce32',
        });
      } else {
        Swal.fire({
          title: 'Hitilafu!',
          text: data.message || 'Imeshindikana kubadilisha kiongozi.',
          icon: 'error',
          confirmButtonText: 'Sawa',
          confirmButtonColor: '#f44336',
        });
      }
    } catch (err) {
      console.error('Error assigning leader', err);
      Swal.fire({
        title: 'Hitilafu!',
        text: 'Imeshindikana kubadilisha kiongozi.',
        icon: 'error',
        confirmButtonText: 'Sawa',
        confirmButtonColor: '#f44336',
      });
    }
  });
};
  // Remove Members
const removeMembers = async () => {
  if (selectedMemberIds.length === 0) {
    Swal.fire({
      title: 'Tahadhari!',
      text: 'Chagua washirika wa kuondoa.',
      icon: 'warning',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f44336',
    });
    return;
  }

  Swal.fire({
    title: 'Uhakika?',
    text: 'Una uhakika unataka kuwaondoa hawa washirika?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ndio, ondoa',
    cancelButtonText: 'Hapana',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#3085d6',
  }).then(async (result) => {
    if (!result.isConfirmed) return; // stop if user clicks "Hapana"

    // deletion logic goes **inside here**
    for (const memberId of selectedMemberIds) {
      const member = members.find((m) => m.id === memberId);
      if (!member) continue;

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/remove-member`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              membership_number: member.membership_number,
            }),
          }
        );
      } catch (err) {
        console.error(`Failed to remove member ${member.membership_number}`, err);
      }
    }

    // update state after deletion
    setMembers((prev) =>
      prev.filter((m) => !selectedMemberIds.includes(m.id))
    );
    setSelectedMemberIds([]);

    // show success notification
    Swal.fire({
      title: 'Imefanikiwa!',
      text: 'Washirika wameondolewa kikamilifu.',
      icon: 'success',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f0ce32',
    });
  });
};

  // Export Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredMembers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `${groupName}.xlsx`);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Wanachama - ${groupName}`, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [['#', 'Jina', 'Jinsia', 'Simu']],
      body: filteredMembers.map((m, i) => [
        i + 1,
        m.full_name,
        m.gender || '-',
        m.phone_number || '-',
      ]),
    });

    doc.save(`${groupName}.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded shadow border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaUsers className="text-blue-600" /> {groupName}
        </h2>

        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          <FaArrowLeft /> Rudi
        </button>
      </div>

      {/* Leader */}
      {leader && (
        <div className="mb-4 p-3 bg-yellow-100 rounded flex items-center gap-2">
          <FaCrown className="text-yellow-600" />
          <span>
            <strong>Kiongozi:</strong> {leader.full_name} ({leader.membership_number})
          </span>
        </div>
      )}

      {/* WhatsApp */}
      {whatsappLink && (
        <div className="mb-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
          >
            <FaWhatsapp /> Jiunge WhatsApp
          </a>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="flex items-center border px-2 py-1 rounded">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            placeholder="Tafuta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none"
          />
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded"
        >
          <FaFileExcel /> Excel
        </button>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded"
        >
          <FaFilePdf /> PDF
        </button>

        {selectedMemberIds.length === 1 && (
          <button
            onClick={appointLeader}
            className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded"
          >
            <FaUserTie /> Leader
          </button>
        )}

        {selectedMemberIds.length > 0 && (
          <button
            onClick={removeMembers}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded"
          >
            <FaTrash /> Remove
          </button>
        )}
      </div>

      {/* Members */}
      {currentMembers.length === 0 ? (
        <p className="text-gray-500">Hakuna washirika wa kuonyesha.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {currentMembers.map((member, idx) => (
            <div
              key={member.id}
              className={`flex items-center gap-2 py-2 px-1 hover:bg-gray-50 transition-all ${
                leaderId === member.id ? 'bg-yellow-100' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(member.id)}
                onChange={() => toggleSelect(member.id)}
              />
              <span className="flex-1">
                {member.full_name}
                {leaderId === member.id && (
                  <FaCrown className="inline ml-2 text-yellow-600" />
                )}
              </span>
              <span className="text-gray-500">{member.gender || '-'}</span>
              <span className="text-gray-500">
                {member.phone_number || '-'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaArrowLeft />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaArrowLeft className="rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}