'use client';

import { useEffect, useRef, useState } from 'react';
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
  const ACTIVE_STATUS = 'active';
  const [selectedMemberForLeader, setSelectedMemberForLeader] = useState<Member | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]); // to store added leaders
  const [roles, setRoles] = useState<Role[]>([]); // fetch roles from API
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);



  const allSelected = selectedMembers.length === members.length;
  const isAdminSelected = selectedMembers.some(id => members.find(m => m.id === id)?.role === 'admin');



useEffect(() => {
  const fetchMembers = async () => {
    try {
      const data: { users: any[] } = await apiFetch('/users');
      if (!data?.users) return;

      // Map users to User type
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
        membership_status: u.membership_status ?? 'pending', // default to pending
        membership_number: u.membership_number ?? '—',
        deactivation_reason: u.deactivation_reason ?? null,
        groups: u.groups ?? [],
        created_at: u.created_at,
      }));

      // Separate pending members for easy approval
      const pendingMembers = users.filter(u => u.membership_status === 'pending');
      const approvedMembers = users.filter(u => u.membership_status !== 'pending');

      // Sort approved members (admins first)
      approvedMembers.sort((a: User, b: User) => {
        if (a.role === 'admin') return -1;
        if (b.role === 'admin') return 1;
        return 0;
      });

      // Set state: pending members first so admin can approve
      setMembers([...pendingMembers, ...approvedMembers]);
      setPendingMembers(pendingMembers); // optional separate state
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const data: { roles: any[] } = await apiFetch('/leadership-roles');
      if (data?.roles) setRoles(data.roles);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const data: { groups: any[] } = await apiFetch('/groups');
      if (data?.groups) setGroups(data.groups);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  fetchMembers();
  fetchRoles();
  fetchGroups();
}, []);

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
        (m.membership_status === ACTIVE_STATUS || m.membership_status === null)
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
             message: `Bwana Yesu asifiwe ${member.full_name}, Sasa wewe ni mshirika rasmi wa fpct kurasini Namba yako ya ushirika ni:  ${response.member.membership_number}`,
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

  const filteredMembers = members.filter(
  (m) =>
    m.role !== 'mchungaji' &&
    (m.membership_status === ACTIVE_STATUS ||
      m.membership_status === 'pending' ||
      m.membership_status === null) &&
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGroupFilter === '' ||
      (m.groups && m.groups.some((g) => g.name === selectedGroupFilter)))
);

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
            📥 Pakua Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            🧾 Pakua PDF
          </button>
        </div>
      </div>
  
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="🔍 Tafuta kwa jina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          />
  
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full sm:w-64 border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
          >
            <option value="">Makundi yote</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
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

            alert(`✅ ${success} mshirika amepotezwa kwa sababu ya "${deactivationReason}".`);
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

<div className="mb-4 text-gray-700 font-semibold text-sm sm:text-base">
  Jumla ya Washirika: {
    members.filter(
      (m) =>
        m.role !== 'mchungaji' &&
        (m.membership_status === ACTIVE_STATUS || m.membership_status === null)
    ).length
  }
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

<div className="bg-white rounded shadow border border-gray-200 overflow-x-auto">
  {/* Table Header */}
  <div className="hidden md:grid grid-cols-12 items-center px-6 py-3 border-b border-gray-200 text-sm font-semibold text-gray-600">
    <div className="col-span-1 flex items-center">
      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="mr-2" />
      #
    </div>
    <div className="col-span-3">Jina</div>
    {/* <div className="col-span-2">Nafasi</div> */}
    <div className="col-span-2">Simu</div>
    <div className="col-span-2">Zone</div>
    <div className="col-span-2">Idhinisha</div>
  </div>

  {paginatedMembers.map((member, index) => (
  <div
    key={member.id}
    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-4 md:px-6 py-4 border-t border-gray-100 text-sm hover:bg-gray-50"
  >
    {/* Index + checkbox */}
    <div className="flex items-center md:col-span-1">
      <input
        type="checkbox"
        checked={selectedMembers.includes(member.id)}
        onChange={() => toggleSelect(member.id)}
        className="mr-2"
      />
      <span className="font-semibold">{startIndex + index + 1}</span>
    </div>

    {/* Name */}
    <div className="flex flex-col md:col-span-3">
      <button
        onClick={() => setSelectedMemberId(member.id)}
        className="text-left font-semibold text-gray-800 hover:underline text-base"
      >
        {member.full_name}
      </button>
      <span className="text-xs text-gray-500">
        <strong>{member.membership_number || '—'}</strong>
      </span>
    </div>

    {/* Phone */}
    <div className="md:col-span-2 text-gray-700 font-semibold">
      {member.phone}
    </div>

    {/* Zone */}
    <div className="md:col-span-2 text-gray-600 capitalize">
      {member.residential_zone || '—'}
    </div>

    {/* Approve / Reject or Status */}
    <div className="md:col-span-2 flex flex-wrap gap-2">
      {member.role === null || !member.membership_number ? (
        <>
          <button
            onClick={() => handleApprove(member.user_id)}
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <FaCheck /> Idhinisha
          </button>

          <button
            onClick={() => {
              if (confirm("Una uhakika unataka kumkataa mshirika huyu?")) {
                handleReject(member.user_id, member.role);
              }
            }}
            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <FaTimes /> Kataa
          </button>
        </>
      ) : (
        <div
          className={`text-white px-3 py-1 rounded text-sm flex items-center gap-2 ${
            member.role === 'admin' ? 'bg-blue-700' : 'bg-gray-400'
          }`}
        >
          <FaCheck /> {member.role === 'admin' ? 'Admin' : 'Imeidhinishwa'}
        </div>
      )}
    </div>
  </div>
  
))}
</div>
<div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">

  {/* Showing entries */}
  <div className="text-sm text-gray-600">
    Showing {startIndex + 1} – {Math.min(endIndex, totalMembers)} of {totalMembers} washirika
  </div>

  {/* Rows per page */}
  <div className="flex items-center gap-2 text-sm">
    <span>Rows:</span>
    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="border rounded px-2 py-1"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>
  </div>

  {/* Page buttons */}
  <div className="flex items-center gap-1">

    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded disabled:opacity-40"
    >
      Prev
    </button>

    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 border rounded ${
          currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded disabled:opacity-40"
    >
      Next
    </button>

  </div>

</div>
    </>
  );
} 