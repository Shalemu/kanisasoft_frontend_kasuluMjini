'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaUserTie } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import AddLeaderModal, { Member, Role } from '@/components/katibu/viongozi/dialogs/AddLeaderModal';
import Swal from 'sweetalert2';




import {
  FaUserPlus,
  FaFilter,
  FaSms,
  FaCheck,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import WashirikaDetails from './WashirikaDetails';
import { apiFetch } from '@/lib/api';

interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;


  // Basic info
  full_name: string;
  residential_zone: string;
  user_id: number;
  email: string | null;
  phone: string | null;
  gender?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;

  // Church info
  role: string | null;
  membership_number?: string | null;
  membership_status?: string | null;
  deactivation_reason?: string | null;

  // Relations
  groups?: Group[];

  // Meta
  created_at: string;
  member_id?: number | null;
}

export default function Washirika({ onAddNew }: { onAddNew: () => void }) {
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [deactivationReason, setDeactivationReason] = useState<string | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  LEFT: 'left',
  DETAINED: 'detained',
  DECEASED: 'deceased',
  LOST: 'lost',
};
  const [selectedMemberForLeader, setSelectedMemberForLeader] = useState<Member | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]); // to store added leaders
  const [roles, setRoles] = useState<Role[]>([]); // fetch roles from API
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [selectedMonth, setSelectedMonth] = useState('');

const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
const [loading, setLoading] = useState(true);



  const allSelected = selectedMembers.length === members.length;
  const isAdminSelected = selectedMembers.some(id => members.find(m => m.id === id)?.role === 'admin');
const roleStyles: Record<string, string> = {
  admin: 'bg-blue-600',
  mchungaji: 'bg-green-600',
  katibu: 'bg-purple-600',
  mhadhini: 'bg-orange-600',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  mchungaji: 'Mchungaji',
  katibu: 'Katibu',
  mhadhini: 'Mhadhini',
};





useEffect(() => {
  fetchMembers(selectedMonth);
  fetchRoles();
  fetchGroups();
}, [selectedMonth]);

const fetchMembers = async (month?: string) => {
  try {
    setLoading(true);

    let endpoint = '/users';

    if (month) {
      endpoint = `/users/filter-by-month?month=${month}`;
    }

    const data: { users: any[] } = await apiFetch(endpoint);

    if (!data?.users) {
      setMembers([]);
      return;
    }

    const users: User[] = data.users.map((u: any) => ({
      id: u.id,
      user_id: u.id,
      member_id: u.member_id ?? null,
      full_name: u.full_name,
      residential_zone: u.residential_zone ?? '',
      email: u.email ?? null,
      phone: u.phone ?? null,
      gender: u.gender ?? null,
      birth_date: u.birth_date ?? null,
      birth_place: u.birth_place ?? null,
      role: u.role ?? null,
      membership_status: u.membership_status ?? 'pending',
      membership_number: u.membership_number ?? '—',
      deactivation_reason: u.deactivation_reason ?? null,
      groups: u.groups ?? [],
      created_at: u.created_at,
    }));

    const pendingMembers = users.filter(
      (u) => u.membership_status === MEMBERSHIP_STATUS.PENDING
    );

    const approvedMembers = users.filter(
      (u) => u.membership_status !== MEMBERSHIP_STATUS.PENDING
    );

    setMembers([...pendingMembers, ...approvedMembers]);
    setPendingMembers(pendingMembers);
  } catch (err) {
    console.error('Error fetching members:', err);
  } finally {
    setLoading(false);
  }
};

const filteredMembers = useMemo(() => {
  return members.filter((member: User) => {
    const createdDate = new Date(member.created_at);

    const matchesRole =
      member.role !== 'mchungaji' &&
      (member.membership_status === MEMBERSHIP_STATUS.ACTIVE ||
        member.membership_status === MEMBERSHIP_STATUS.PENDING ||
        member.membership_status === null);

    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFrom = !fromDate || createdDate >= new Date(fromDate + 'T00:00:00');
    const matchesTo   = !toDate   || createdDate <= new Date(toDate + 'T23:59:59');

    const matchesMonth =
      !selectedMonth || (createdDate.getMonth() + 1) === Number(selectedMonth);

    const matchesGroup =
      !selectedGroupFilter ||
      member.groups?.some((g) => g.name === selectedGroupFilter);

    return (
      matchesRole &&
      matchesSearch &&
      matchesFrom &&
      matchesTo &&
      matchesMonth &&
      matchesGroup
    );
  });
}, [members, searchTerm, fromDate, toDate, selectedMonth, selectedGroupFilter]);

const fetchRoles = async () => {
  try {
    const data: { roles: any[] } = await apiFetch(
      '/leadership-roles'
    );

    if (data?.roles) {
      setRoles(data.roles);
    }
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
};

const fetchGroups = async () => {
  try {
    const data: { groups: any[] } = await apiFetch(
      '/groups'
    );

    if (data?.groups) {
      setGroups(data.groups);
    }
  } catch (err) {
    console.error('Error fetching groups:', err);
  }
};

  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (

      
    ) => document.removeEventListener('mousedown', handleClickOutside);
  }, []);




  const toggleSelect = (id: number) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedMembers(allSelected ? [] : members.map(m => m.id));
  };

  const handleExportExcel = () => {
  const exportData = members.map((m, i) => ({
    '#': i + 1,
    'Jina Kamili': m.full_name || '—',
    'Namba ya Ushirika': m.membership_number || '—',
    'Namba ya Simu': m.phone || '—',
    'Zone': m.residential_zone || '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Washirika');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, 'washirika.xlsx');
};

 const handleExportPdf = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Prepare table data
  const tableData = members
  .filter(
    (m) =>
      m.role !== 'mchungaji' &&
      (
        m.membership_status === MEMBERSHIP_STATUS.ACTIVE ||
        m.membership_status === null
      )
  )
  .map((m, i) => [
    i + 1,
    m.full_name || '—',
    m.membership_number || '—',
    m.phone || '—',
    m.residential_zone || '—',
  ]);

  // Title
  doc.setFontSize(14);
  doc.text('ORODHA YA WASHIRIKA', 14, 14);

  // Table
  autoTable(doc, {
    startY: 20,
    head: [[
      '#',
      'Jina Kamili',
      'Namba ya Ushirika',
      'Namba ya Simu',
      'Zone',
    ]],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [22, 163, 74], // green
      textColor: 255,
      halign: 'center',
    },
    bodyStyles: {
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10 },  // #
      1: { cellWidth: 60 },  // Jina
      2: { cellWidth: 40 },  // Membership No
      3: { cellWidth: 40 },  // Simu
      4: { cellWidth: 50 },  // Zone
    },
    margin: { left: 10, right: 10 },
    didDrawPage: () => {
      doc.setFontSize(9);
      doc.text(
        `Imetolewa: ${new Date().toLocaleDateString('en-GB')}`,
        doc.internal.pageSize.getWidth() - 60,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // Save
  doc.save('orodha_ya_washirika.pdf');
};



const handleAddLeader = () => {
  if (selectedMembers.length !== 1) {
    alert('⚠️ Tafadhali chagua mshirika mmoja tu kumfanya kiongozi.');
    return;
  }

  const memberId = selectedMembers[0];


  router.push(`/viongozi/ongeza?member_id=${memberId}`);

 
};

const handleAssignToGroups = async () => {
  if (selectedGroupIds.length === 0 || selectedMembers.length === 0) {
   Swal.fire({
  title: 'Tahadhari',
  text: 'Chagua angalau mshirika mmoja na kundi moja.',
  icon: 'warning',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32',
});
    return;
  }

  let successful = 0;
  const failed: string[] = [];

  for (const memberId of selectedMembers) {
    const user = members.find(m => m.id === memberId);
    if (!user?.membership_number) continue;

    let memberFailed = false;

    for (const groupId of selectedGroupIds) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/add-member`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ membership_number: user.membership_number }),
          }
        );

        const data = await res.json();

        // success OR already exists
        if (res.ok || res.status === 409) {
          continue;
        }

        // real failure (403, 404, 500)
        memberFailed = true;

      } catch (error) {
        memberFailed = true;
      }
    }

    if (memberFailed) {
      failed.push(`${user.full_name} (${user.membership_number})`);
    } else {
      successful++;
    }
  }

  if (successful > 0) {
   Swal.fire({
  title: 'Imefanikiwa!',
  text: `${successful} mshirika ameongezwa kwenye kundi/kundi.`,
  icon: 'success',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // matches your theme
});
  }

  if (failed.length > 0) {
   Swal.fire({
  title: 'Haikuweza',
  text: `Wale hawakuongezwa: ${failed.join(', ')}`,
  icon: 'error', // or 'warning' if you prefer
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // match your app theme
});
  }

  setGroupDialogOpen(false);
  setSelectedGroupIds([]);
  setSelectedMembers([]);
};

 const handleApprove = async (userId: number) => {
  const response = await apiFetch('/authorize-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });

  if (response.status === 'success') {
    const approvedMemberId = response.member.id;

    // Update state
    setMembers(prev =>
      prev.map(m =>
        m.user_id === userId
          ? { ...m, role: 'mshirika', member_id: approvedMemberId, membership_number: response.member.membership_number }
          : m
      )
    );

  Swal.fire({
  title: 'Umefanikiwa',
  text: 'Mshirika ameidhinishwa.',
  icon: 'success',
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // your theme color
});

    // Send SMS and Email
    const member = members.find(m => m.user_id === userId);
    if (member) {
      try {
        const smsResponse = await apiFetch('/send-sms', {
          method: 'POST',
          body: JSON.stringify({
            phone: member.phone,
            email: member.email,
            name: member.full_name,
             message: `Bwana Yesu asifiwe ${member.full_name}, Sasa wewe ni mshirika rasmi wa fpct kasulu Namba yako ya ushirika ni:  ${response.member.membership_number}`,
            // message: `Hello ${member.full_name}, your membership number is ${response.member.membership_number}`,
            send_email: true
          })
        });

        if (smsResponse.status === 'success') {
          console.log('SMS and Email sent successfully', smsResponse);
        } else {
          console.warn('Failed to send SMS/Email', smsResponse);
        }
      } catch (err) {
        console.error('Error sending SMS/Email:', err);
      }
    }
  } else {
   Swal.fire({
  title: 'Tatizo',
  text: response.message || 'Imeshindikana.',
  icon: 'error',             // shows an error icon
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional: change to your theme color
});
  }
};


const handleReject = async (id: number, role: string | null) => {
  if (role === 'admin') return;

  const reason = prompt("Tafadhali andika sababu ya kukataa mshirika huyu:") || "Rejected";

  const response = await apiFetch(`/users/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

  if (response.status === 'success') {
    setMembers(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, membership_status: 'rejected', deactivation_reason: reason }
          : m
      )
    );
    Swal.fire({
  title: 'Mshirika amekataliwa',
  text: 'Sababu imehifadhiwa.',
  icon: 'warning',              
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional: match your theme
});
  } else {
  Swal.fire({
  title: 'Tatizo',
  text: response.message || 'Imeshindikana kumkataa mshirika.',
  icon: 'error',                
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional: your theme color
});
  }
};

  const reasons = [
    { label: 'Amehama', value: 'Amehama' },
    { label: 'Ametegwa ushirika', value: 'Ametegwa ushirika' },
    { label: 'Amefariki', value: 'Amefariki' },
    { label: 'Amepotea', value: 'Amepotea' },
    { label: 'Amejisajiri kimakosa', value: 'Amejisajiri kimakosa' },
  ];

  const isAnyAlreadyInGroup = selectedMembers.some(memberId => {
    const user = members.find(m => m.id === memberId);
    return user?.groups?.some(g => selectedGroupIds.includes(g.id));
  });

  const handleDeactivate = () => {
    if (isAdminSelected) return;
    setShowReasonDialog(true);
  };

  const handleSingleDeactivate = (name: string, role: string | null) => {
    if (role === 'admin') return;
    Swal.fire({
  title: 'Imefanikiwa',
  text: `Mshirika ${name} amezimwa.`,
  icon: 'success',               
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional: match your theme
});
  };

const totalMembers = filteredMembers.length;
const totalPages = Math.ceil(totalMembers / rowsPerPage);

const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;

const paginatedMembers = filteredMembers.slice(startIndex, endIndex);



  if (selectedMemberId) {
    return (
      <WashirikaDetails
        userId={selectedMemberId}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }
  return (


      <>
{selectedMemberForLeader && (
  <AddLeaderModal
    isOpen={isLeaderModalOpen}
    setIsOpen={setIsLeaderModalOpen}
    roles={roles}
    members={members}               // full list of members
    selectedMember={selectedMemberForLeader}
    onLeaderAdded={async () => {
      Swal.fire({
  title: 'Imefanikiwa!',
  text: `${selectedMemberForLeader.full_name} ameongezwa kama kiongozi!`,
  icon: 'success',               
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional, match your theme
});

      // no need to refresh assignments manually; modal handles it internally
      setIsLeaderModalOpen(false);
      setSelectedMemberForLeader(null);
    }}
  />
)}





      {/* Top Heading and Buttons */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Washirika</h1>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            onClick={() => router.push(`/register?from=${pathname}`)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
          >
            <FaUserPlus /> Ongeza Washirika
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
          >
            Pakua Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            Pakua PDF
          </button>
        </div>
      </div>
  
      {/* Search and Filter Panel */}
<div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    
    {/* Search */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tafuta
      </label>
      <input
        type="text"
        placeholder="Jina au simu..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1e293b]"
      />
    </div>

    {/* From Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        From Date
      </label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
    </div>

    {/* To Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        To Date
      </label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
    </div>

    {/* Month */}
    {/* <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mwezi
      </label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Miezi yote</option>
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
    </div> */}

    {/* Group */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Kundi
      </label>
      <select
        value={selectedGroupFilter}
        onChange={(e) =>
          setSelectedGroupFilter(e.target.value)
        }
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Makundi yote</option>
        {groups.map((group) => (
          <option
            key={group.id}
            value={group.name}
          >
            {group.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Buttons */}
  {/* <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-end">
    <button
      onClick={() => {
        setSearchTerm('');
        setFromDate('');
        setToDate('');
        setSelectedMonth('');
        setSelectedGroupFilter('');
      }}
      className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
    >
      Clear
    </button>

    <button
      className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
    >
      Apply Filter
    </button>
  </div> */}
</div>
  
      {showReasonDialog && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Sababu ya Kupoteza Ushirika</h2>

      <div className="space-y-3 text-sm text-gray-700">
        {reasons.map(({ label, value }) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              name="deactivationReason"
              value={value}
              checked={deactivationReason === value}
              onChange={() => setDeactivationReason(value)}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => {
            setShowReasonDialog(false);
            setDeactivationReason(null);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          Ghairi
        </button>
        <button
          onClick={async () => {
            if (!deactivationReason) {
             Swal.fire({
  title: 'Tahadhari',
  text: 'Tafadhali chagua sababu ya deactivation.',
  icon: 'warning',               
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional, match your theme
});
              return;
            }

            let success = 0;
            for (const userId of selectedMembers) {
              const user = members.find(m => m.id === userId);
              if (!user?.member_id) continue;

              try {
                const response = await apiFetch(`/members/${user.member_id}/deactivate`, {
                  method: 'POST',
                  body: JSON.stringify({ reason: deactivationReason }),
                });

                if (response.status === 'success') {
                  success++;
                }
              } catch (err) {
                console.error(` Failed to deactivate member ${user?.full_name}:`, err);
              }
            }

           Swal.fire({
          title: 'Imefanikiwa!',
          text: `${success} mshirika amepotezwa kwa sababu ya "${deactivationReason}".`,
          icon: 'success',
          confirmButtonText: 'Sawa',
          confirmButtonColor: '#f0ce32',
        });
            setShowReasonDialog(false);
            setDeactivationReason(null);
          }}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded"
        >
          Thibitisha
        </button>
      </div>
    </div>
  </div>
)}

<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
  {/* Jumla ya Washirika Wote */}
  <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">Jumla ya Washirika</p>
      <h2 className="text-2xl font-bold text-[#1e293b] mt-1">
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          filteredMembers.length
        )}
      </h2>
      </div>
      <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center">
        <FaUsers className="text-[#1e293b] text-xl" />
      </div>
    </div>
  </div>

  {/* Washirika Waliothibitishwa */}
<div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">
        Washirika Walioidhinishwa
      </p>
      <h2 className="text-2xl font-bold text-[#1e293b] mt-1">
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          filteredMembers.filter(
            (m) => m.membership_status === MEMBERSHIP_STATUS.ACTIVE
          ).length
        )}
      </h2>
    </div>
    <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center">
      <FaUsers className="text-[#1e293b] text-xl" />
    </div>
  </div>
</div>


  {/* Washirika Wanaosubiri */}
<div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">
        Washirika Wanaosubiri Kuidhinishwa
      </p>
      <h2 className="text-2xl font-bold text-[#1e293b] mt-1">
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          filteredMembers.filter(
            (m) => m.membership_status === MEMBERSHIP_STATUS.PENDING
          ).length
        )}
      </h2>
    </div>
    <div className="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
      <FaUsers className="text-[#1e293b] text-xl" />
    </div>
  </div>
</div>
</div>

{selectedMembers.length > 0 && (
  <div className="mb-4 bg-white border border-blue-200 px-4 sm:px-6 py-3 rounded shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm font-medium text-gray-600">
      {selectedMembers.length} washirika wamechaguliwa
    </p>
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
  {/* ➕ Ongeza Kiongozi */}
<button
  onClick={() => {
    if (selectedMembers.length !== 1) {
      Swal.fire({
  title: 'Tahadhari',
  text: 'Tafadhali chagua mshirika mmoja tu kumfanya kiongozi.',
  icon: 'warning',               // warning icon
  confirmButtonText: 'Sawa',
  confirmButtonColor: '#f0ce32', // optional, matches your theme
});
      return;
    }
    const member = members.find(m => m.id === selectedMembers[0]);
    if (!member) return;

    setSelectedMemberForLeader(member);
    setIsLeaderModalOpen(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
>
  <FaUserPlus /> Ongeza Kiongozi
</button>





  <button
    onClick={() => setGroupDialogOpen(true)}
    className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
  >
    <FaUsers /> Weka Kundi
  </button>

  <button
    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
  >
    <FaSms /> Tuma SMS
  </button>

  <button
    onClick={handleDeactivate}
    disabled={isAdminSelected}
    className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
      isAdminSelected
        ? 'bg-yellow-200 text-white cursor-not-allowed'
        : 'bg-yellow-500 hover:bg-yellow-400 text-white'
    }`}
  >
    🛡️ Deactivate
  </button>
</div>

  </div>
)}

{groupDialogOpen && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Chagua Makundi ya Kuongeza
      </h2>

      <div className="space-y-2 max-h-64 overflow-y-auto text-sm text-gray-700 pr-1">
        {groups.map(group => (
          <label key={group.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedGroupIds.includes(group.id)}
              onChange={e => {
                const checked = e.target.checked;
                setSelectedGroupIds(prev =>
                  checked ? [...prev, group.id] : prev.filter(id => id !== group.id)
                );
              }}
            />
            {group.name}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => setGroupDialogOpen(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
        >
          Ghairi
        </button>

        <button
          onClick={handleAssignToGroups}
          disabled={selectedGroupIds.length === 0 || selectedMembers.length === 0}
          className={`px-4 py-2 text-sm rounded text-white ${
            selectedGroupIds.length === 0 || selectedMembers.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          Hifadhi
        </button>
      </div>
    </div>
  </div>
)}

<div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
  {/* Header Title */}
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-xl font-bold text-[#1e293b]">
      Orodha ya Washirika
    </h2>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-[#1e293b] text-white text-sm">
          <th className="px-6 py-4 text-left w-12">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
          </th>

          <th className="px-6 py-4 text-left">
            Jina
          </th>

          <th className="px-6 py-4 text-left">
            Simu
          </th>

          <th className="px-6 py-4 text-left">
            Zone
          </th>

          <th className="px-6 py-4 text-left">
            Tarehe
          </th>

          <th className="px-6 py-4 text-left">
            Hatua
          </th>
        </tr>
      </thead>

      <tbody>
     
          {loading ? (
    <tr>
      <td
        colSpan={6}
        className="px-6 py-10 text-center text-gray-500"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#1e293b] rounded-full animate-spin"></div>
          <span className="text-sm font-medium">
            Inapakia taarifa za washirika...
          </span>
        </div>
      </td>
    </tr>
  ) :
 paginatedMembers.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        className="px-6 py-10 text-center text-gray-500"
      >
        Hakuna washirika waliopatikana
      </td>
    </tr>
  ) : paginatedMembers.map((member) => (
          <tr
            key={member.id}
            className="border-b border-gray-100 hover:bg-gray-50 text-sm"
          >
            {/* Checkbox */}
            <td className="px-6 py-4">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => toggleSelect(member.id)}
                className="w-4 h-4"
              />
            </td>

            {/* Name */}
            <td className="px-6 py-4">
              <button
                onClick={() =>
                  setSelectedMemberId(member.id)
                }
                className="font-semibold text-gray-800 hover:text-blue-600"
              >
                {member.full_name}
              </button>

              <div className="text-xs text-gray-500 mt-1">
                {member.membership_number || '—'}
              </div>
            </td>

            {/* Phone */}
            <td className="px-6 py-4 text-gray-700">
              {member.phone || '—'}
            </td>

            {/* Zone */}
            <td className="px-6 py-4 text-gray-600">
              {member.residential_zone || '—'}
            </td>

            {/* Date */}
            <td className="px-6 py-4 text-gray-600">
              {new Date(
                member.created_at
              ).toLocaleDateString()}
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
              <div className="flex gap-2">
                {member.role === null ||
                !member.membership_number ? (
                  <>
                    <button
                      onClick={() =>
                        handleApprove(member.user_id)
                      }
                      className="border border-green-600 text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-xs font-medium"
                    >
                      Idhinisha
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Una uhakika?',
                          text: 'Unataka kumkataa mshirika huyu?',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText:
                            'Ndiyo, Kataa',
                          cancelButtonText: 'Ghairi',
                          confirmButtonColor:
                            '#dc2626',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleReject(
                              member.user_id,
                              member.role
                            );
                          }
                        });
                      }}
                      className="border border-red-600 text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-xs font-medium"
                    >
                      Kataa
                    </button>
                  </>
                ) : (
            <span
              className={`inline-block px-3 py-2 rounded-md text-xs font-medium text-white ${
                roleStyles[(member.role || '').toLowerCase()] || 'bg-gray-500'
              }`}
            >
              {roleLabels[(member.role || '').toLowerCase()] || 'Ameidhinishwa'}
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



{/* Pagination */}
<div className="flex flex-col md:flex-row justify-between items-center mt-5 gap-4 text-sm">
  {/* Showing Entries */}
  <div className="text-gray-600">
    Showing{' '}
    <span className="font-semibold">{startIndex + 1}</span> –{' '}
    <span className="font-semibold">{Math.min(endIndex, totalMembers)}</span> of{' '}
    <span className="font-semibold">{totalMembers}</span> washirika
  </div>

  {/* Rows Per Page */}
  <div className="flex items-center gap-2">
    <span className="text-gray-600">Rows:</span>
    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>
  </div>

  {/* Page Buttons */}
  <div className="flex items-center gap-2 flex-wrap">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
    >
      Prev
    </button>

    {/* Dynamic page numbers */}
    {(() => {
      const pageNumbers: (number | string)[] = [];
      const visiblePages = 5; // show current ±2 pages
      const left = Math.max(1, currentPage - 2);
      const right = Math.min(totalPages, currentPage + 2);

      if (left > 1) {
        pageNumbers.push(1);
        if (left > 2) pageNumbers.push('...');
      }

      for (let i = left; i <= right; i++) {
        pageNumbers.push(i);
      }

      if (right < totalPages) {
        if (right < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }

      return pageNumbers.map((p, idx) =>
        typeof p === 'number' ? (
          <button
            key={idx}
            onClick={() => setCurrentPage(p)}
            className={`min-w-[36px] h-9 border rounded-md text-sm font-medium transition ${
              currentPage === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={idx} className="px-2">…</span>
        )
      );
    })()}

    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
    >
      Next
    </button>
  </div>
</div>
    </>
  );
} 