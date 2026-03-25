'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaChild, FaFemale, FaMale, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';

interface ServiceAttendance {
  id: number;
  date: string;
  type: string;
  uploaded_by?: string;
  children: number;
  women: number;
  men: number;
  total: number;
}

export default function MahudhurioTab() {
  const [attendanceData, setAttendanceData] = useState<ServiceAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('Jumapili');
  const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/attendance');
        if (res.status === 'success') {
          setAttendanceData(res.attendance || []);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Hitilafu',
            text: 'Imeshindikana kupata data ya mahudhurio',
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Hitilafu',
          text: 'Tatizo la mtandao. Tafadhali jaribu tena.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredByType = attendanceData
    .filter(s => s.type === selectedType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredByType.length / itemsPerPage);
  const paginatedDates = filteredByType.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedDate = attendanceData.find(s => s.id === selectedDateId);

  return (
    <div className="flex flex-col md:flex-row min-h-[75vh] w-full bg-gray-50 text-sm rounded-xl shadow-xl overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gradient-to-b from-blue-100 to-blue-50 text-gray-800 border-b md:border-b-0 md:border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-blue-800 font-extrabold text-xs uppercase tracking-widest mb-5">
            Aina za Ibada
          </h2>
          <ul className="flex md:flex-col gap-3">
            {['Jumapili', 'Midweek', 'Special'].map(type => (
              <li
                key={type}
                className={`px-6 py-3 rounded-xl cursor-pointer font-semibold transition-all text-center
                  ${selectedType === type ? 'bg-white text-blue-700 shadow-lg scale-105' : 'hover:bg-white hover:text-blue-600 hover:scale-105'}
                `}
                onClick={() => {
                  setSelectedType(type);
                  setSelectedDateId(null);
                  setCurrentPage(1);
                }}
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-white overflow-auto">
        {loading ? (
          <p className="text-gray-500 text-center mt-10 text-lg animate-pulse">⏳ Inapakia...</p>
        ) : filteredByType.length === 0 ? (
          <p className="text-gray-500 text-center mt-10 text-lg">Hakuna mahudhurio ya aina hii.</p>
        ) : (
          <>
            {/* Dates Table */}
            <h3 className="font-extrabold text-xl text-gray-700 mb-5">Tarehe za {selectedType}</h3>
            <div className="overflow-x-auto mb-6 rounded-xl shadow-md">
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-blue-50 text-blue-800 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left">Tarehe</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDates.map(service => (
                    <tr
                      key={service.id}
                      className={`hover:bg-blue-50 cursor-pointer transition-all
                        ${selectedDateId === service.id ? 'bg-blue-100 font-semibold' : ''}
                      `}
                      onClick={() => setSelectedDateId(service.id)}
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-500 text-lg" />
                        {new Date(service.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mb-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition disabled:opacity-50"
              >
                <FaChevronLeft /> <span>Prev</span>
              </button>
              <span className="px-4 py-2 font-semibold text-gray-700 border rounded-xl">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition disabled:opacity-50"
              >
                <span>Next</span> <FaChevronRight />
              </button>
            </div>

            {/* Attendance Summary */}
            {selectedDate && (
              <div className="bg-blue-50 p-6 rounded-2xl shadow-lg">
                <h3 className="font-extrabold text-xl text-gray-700 mb-6">
                  Muhtasari wa {new Date(selectedDate.date).toLocaleDateString()}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-xl shadow-sm">
                    <thead className="bg-blue-100 text-blue-800 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-center"><FaChild className="inline mr-1" />Watoto</th>
                        <th className="px-6 py-4 text-center"><FaFemale className="inline mr-1" />Wanawake</th>
                        <th className="px-6 py-4 text-center"><FaMale className="inline mr-1" />Wanaume</th>
                        <th className="px-6 py-4 text-center"><FaUsers className="inline mr-1" />Jumla</th>
                        <th className="px-6 py-4 text-center"><FaCheckCircle className="inline mr-1" />Imeingizwa na</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center bg-white">
                        <td className="px-6 py-4">{selectedDate.children}</td>
                        <td className="px-6 py-4">{selectedDate.women}</td>
                        <td className="px-6 py-4">{selectedDate.men}</td>
                        <td className="px-6 py-4 font-semibold">{selectedDate.total}</td>
                        <td className="px-6 py-4">{selectedDate.uploaded_by || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}