'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFilter, FaUsers, FaMoneyBillWave, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ServiceAttendance {
  id: number;
  date: string;
  service_name: string;
  preacher: string;
  message?: string;
  attendance_children: number;
  attendance_women: number;
  attendance_men: number;
  total_offerings: number;
  leaders_on_duty?: string;
  created_at: string;
  updated_at: string;
}

export default function MahudhurioDashboard() {
  const [attendanceData, setAttendanceData] = useState<ServiceAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Editing state
  const [editingService, setEditingService] = useState<ServiceAttendance | null>(null);
  const [editFormData, setEditFormData] = useState({
    service_name: '',
    preacher: '',
    attendance_children: 0,
    attendance_women: 0,
    attendance_men: 0,
    total_offerings: 0,
    leaders_on_duty: '',
    date: ''
  });

  // Fetch attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/service-events');
      if (res.status === 'success') {
        setAttendanceData(res.events || []);
      } else {
        Swal.fire({ icon: 'error', title: 'Hitilafu', text: 'Imeshindikana kupata data ya mahudhurio' });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Hitilafu', text: err.message || 'Tatizo la mtandao. Tafadhali jaribu tena.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Delete record
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Thibitisha',
      text: 'Una hakika unataka kufuta taarifa hii?',
      showCancelButton: true,
      confirmButtonText: 'Ndiyo',
      cancelButtonText: 'Hapana',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await apiFetch(`/service-events/${id}`, { method: 'DELETE' });
        if (res.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Imefanikiwa', text: 'Taarifa imefutwa.' });
          fetchAttendance();
        } else {
          Swal.fire({ icon: 'error', title: 'Hitilafu', text: 'Imeshindikana kufuta taarifa' });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Hitilafu', text: 'Tatizo la mtandao. Tafadhali jaribu tena.' });
      }
    }
  };

  // Start editing
  const handleEdit = (service: ServiceAttendance) => {
    setEditingService(service);
    setEditFormData({
      service_name: service.service_name,
      preacher: service.preacher,
      attendance_children: service.attendance_children,
      attendance_women: service.attendance_women,
      attendance_men: service.attendance_men,
      total_offerings: service.total_offerings,
      leaders_on_duty: service.leaders_on_duty || '',
      date: service.date.slice(0,10)
    });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingService) return;

    try {
      const res = await apiFetch(`/service-events/${editingService.id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData)
      });

      if (res.status === 'success') {
        Swal.fire({ icon: 'success', title: 'Imefanikiwa', text: 'Taarifa imehifadhiwa.' });
        fetchAttendance();
        setEditingService(null);
      } else {
        Swal.fire({ icon: 'error', title: 'Hitilafu', text: 'Imeshindikana kuhifadhi taarifa' });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Hitilafu', text: err.message || 'Tatizo la mtandao.' });
    }
  };

  // Apply filters
  const filteredData = attendanceData.filter(item => {
    const itemDate = new Date(item.date);
    const fromDate = filterFrom ? new Date(filterFrom) : null;
    const toDate = filterTo ? new Date(filterTo) : null;

    const matchesDate =
      (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
    const matchesSearch =
      filterSearch === '' ||
      item.service_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.preacher.toLowerCase().includes(filterSearch.toLowerCase());

    return matchesDate && matchesSearch;
  });

  // Summary totals
  const totalMembers = filteredData.reduce(
    (sum, s) => sum + s.attendance_children + s.attendance_women + s.attendance_men,
    0
  );
  const totalSadaka = filteredData.reduce((sum, s) => sum + s.total_offerings, 0);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export Excel
  const exportExcel = () => {
    const wsData = filteredData.map(s => ({
      Tarehe: new Date(s.date).toLocaleDateString(),
      Huduma: s.service_name,
      Mhubiri: s.preacher,
      Watoto: s.attendance_children,
      Wanawake: s.attendance_women,
      Wanaume: s.attendance_men,
      Jumla: s.attendance_children + s.attendance_women + s.attendance_men,
      Sadaka: s.total_offerings,
      Viongozi: s.leaders_on_duty || '',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mahudhurio');
    XLSX.writeFile(wb, 'Mahudhurio.xlsx');
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Ripoti ya Mahudhurio & Sadaka', 14, 15);
    const tableData = filteredData.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.service_name,
      s.preacher,
      s.attendance_children,
      s.attendance_women,
      s.attendance_men,
      s.attendance_children + s.attendance_women + s.attendance_men,
      s.total_offerings.toLocaleString(),
      s.leaders_on_duty || '',
    ]);
    (doc as any).autoTable({
      head: [['Tarehe','Huduma','Mhubiri','Watoto','Wanawake','Wanaume','Jumla','Sadaka','Viongozi']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [11,61,47] }
    });
    doc.save('Mahudhurio.pdf');
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#0b3d2f] mb-4">Mahudhurio & Sadaka</h2>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Jumla ya Washirika */}
        <div className="flex flex-col items-center justify-center border border-[#1e293b] rounded-xl px-6 py-3 flex-1 bg-white hover:shadow-lg transition">
            <FaUsers className="text-[#0b3d2f] text-2xl mb-1" />
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide text-center">Jumla ya Washirika</p>
            <p className="text-[#1e293b] font-bold text-2xl text-center">
            {loading ? '...' : totalMembers.toLocaleString()}
            </p>
        </div>

        {/* Jumla ya Sadaka */}
        <div className="flex flex-col items-center justify-center border border-[#1e293b] rounded-xl px-6 py-3 flex-1 bg-white hover:shadow-lg transition">
            <FaMoneyBillWave className="text-[#1e293b] text-2xl mb-1" />
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide text-center">Jumla ya Sadaka (TZS)</p>
          <p className="text-[#1e293b] font-bold text-2xl text-center">
  {loading ? '...' : Number(totalSadaka).toLocaleString('en-US', { minimumFractionDigits: 0 })}
</p>
        </div>
        </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div className="flex flex-col">
          <label className="text-gray-700 text-sm">Tarehe Kutoka</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-2 py-2 text-sm"
            value={filterFrom}
            onChange={e => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 text-sm">Tarehe Hadi</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-2 py-2 text-sm"
            value={filterTo}
            onChange={e => setFilterTo(e.target.value)}
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-gray-700 text-sm">Tafuta Huduma au Mhubiri</label>
          <input
            type="text"
            placeholder="Tafuta huduma au mhubiri..."
            className="border border-gray-300 rounded-md px-2 py-3 text-sm"
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
          />
        </div>
     
      
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaFileExcel /> Excel
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaFilePdf /> PDF
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10 text-lg animate-pulse">⏳ Inapakia...</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500 text-center mt-10 text-lg">Hakuna taarifa zilizopo.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-[#1e293b]  text-white">
              <tr>
                <th className="px-4 py-2 text-left">Tarehe</th>
                <th className="px-4 py-2 text-left">Huduma</th>
                <th className="px-4 py-2 text-left">Mhubiri</th>
                <th className="px-4 py-2 text-left">Watoto</th>
                <th className="px-4 py-2 text-left">Wanawake</th>
                <th className="px-4 py-2 text-left">Wanaume</th>
                <th className="px-4 py-2 text-left">Jumla</th>
                <th className="px-4 py-2 text-left">Sadaka</th>
                <th className="px-4 py-2 text-left">Viongozi</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(service => {
                const total = service.attendance_children + service.attendance_women + service.attendance_men;
                const rowBg = paginatedData.indexOf(service) % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                return (
                  <tr key={service.id} className={`${rowBg} hover:bg-[#e5f2ed] transition-all`}>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-[#1e293b]" /> {new Date(service.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{service.service_name}</td>
                    <td className="px-4 py-2">{service.preacher}</td>
                    <td className="px-4 py-2">{service.attendance_children}</td>
                    <td className="px-4 py-2">{service.attendance_women}</td>
                    <td className="px-4 py-2">{service.attendance_men}</td>
                    <td className="px-4 py-2 font-semibold">{total}</td>
                    <td className="px-4 py-2">{service.total_offerings.toLocaleString()}</td>
                    <td className="px-4 py-2">{service.leaders_on_duty}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-2 py-1 bg-yellow-400 text-white rounded-md text-xs"
                        onClick={() => handleEdit(service)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded-md text-xs"
                        onClick={() => handleDelete(service.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-3 flex justify-center items-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#1e293b] text-white rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-semibold text-gray-700 border rounded-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#1e293b] text-white rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

{/* Edit Modal */}
{editingService && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-5 text-[#1e293b]">Hariri Taarifa</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Huduma</label>
          <input
            type="text"
            value={editFormData.service_name}
            onChange={e => setEditFormData({ ...editFormData, service_name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Mhubiri</label>
          <input
            type="text"
            value={editFormData.preacher}
            onChange={e => setEditFormData({ ...editFormData, preacher: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Tarehe</label>
          <input
            type="date"
            value={editFormData.date}
            onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Watoto</label>
          <input
            type="number"
            value={editFormData.attendance_children}
            onChange={e => setEditFormData({ ...editFormData, attendance_children: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Wanawake</label>
          <input
            type="number"
            value={editFormData.attendance_women}
            onChange={e => setEditFormData({ ...editFormData, attendance_women: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Wanaume</label>
          <input
            type="number"
            value={editFormData.attendance_men}
            onChange={e => setEditFormData({ ...editFormData, attendance_men: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Sadaka (TZS)</label>
          <input
            type="number"
            value={editFormData.total_offerings}
            onChange={e => setEditFormData({ ...editFormData, total_offerings: parseInt(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Viongozi</label>
          <input
            type="text"
            value={editFormData.leaders_on_duty}
            onChange={e => setEditFormData({ ...editFormData, leaders_on_duty: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-[#0b3d2f] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setEditingService(null)}
          className="px-5 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition"
        >
          Funga
        </button>
        <button
          onClick={saveEdit}
          className="px-5 py-2 bg-[#1e293b] text-white rounded-lg font-medium hover:bg-[#1e293b] transition"
        >
          Hifadhi
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}