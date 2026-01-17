'use client';

import { useEffect, useState } from 'react';
import {
  FaSpinner,
  FaFilePdf,
  FaFileExcel,
  FaTrash,
  FaCheckSquare,
  FaSquare,
  FaEnvelopeOpenText,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface SmsLog {
  id: number;
  recipient: string;   // e.g. "+255793075599"
  message: string;
  status: string;      // "success", "failed", or Beem status
  sent_at: string;
  receiver?: string | null;
  reason?: string | null; // If you save delivery error (optional)
}

function isSameMonth(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// Converts +2557xxxxxxx to 07xxxxxxx
function localizeNumber(recipient: string) {
  let n = recipient.trim();
  if (n.startsWith('+255')) return '0' + n.slice(4);
  if (n.startsWith('255')) return '0' + n.slice(3);
  return n;
}

// Flexible delivery status detection
function isDelivered(status: string) {
  const good = ['success', 'delivered', 'sent', 'imetumwa'];
  return !!status && good.some((s) => status.toLowerCase().includes(s));
}

export default function UjumbeTab() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // SMS Counter
  const smsSentThisMonth = logs.filter(
    (log) => isDelivered(log.status) && isSameMonth(log.sent_at)
  ).length;
  const smsSentAllTime = logs.filter((log) => isDelivered(log.status)).length;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setLogs(data.logs || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLogs.map((log) => log.id));
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Mpokeaji', 'Ujumbe', 'Hali', 'Tarehe', 'Mlengwa', 'Sababu']],
      body: filteredLogs.map((log) => [
        localizeNumber(log.recipient),
        log.message,
        getStatusLabel(log.status),
        new Date(log.sent_at).toLocaleString(),
        log.receiver || '—',
        log.reason || '—',
      ]),
    });
    doc.save('sms-logs.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        Mpokeaji: localizeNumber(log.recipient),
        Ujumbe: log.message,
        Hali: getStatusLabel(log.status),
        Tarehe: new Date(log.sent_at).toLocaleString(),
        Mlengwa: log.receiver || '—',
        Sababu: log.reason || '—',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SMS Logs');
    XLSX.writeFile(workbook, 'sms-logs.xlsx');
  };

  const deleteSelected = async () => {
    if (!confirm('Una uhakika unataka kufuta ujumbe ulioteuliwa?')) return;

    const token = localStorage.getItem('token');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/logs/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      setLogs((prev) => prev.filter((log) => !selectedIds.includes(log.id)));
      setSelectedIds([]);
    } catch (e) {
      alert('Kufuta ujumbe kumeharibika.');
    }
  };

  // Search logic: phone, name, or message
  const filteredLogs = logs.filter((log) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      q
        .split(' ')
        .every(
          (word) =>
            localizeNumber(log.recipient)?.toLowerCase().includes(word) ||
            log.recipient?.toLowerCase().includes(word) ||
            log.message?.toLowerCase().includes(word) ||
            log.receiver?.toLowerCase().includes(word)
        );
    // Allow custom status filter; default behavior preserved
    const matchesStatus = filterStatus === '' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function getStatusLabel(status: string) {
    if (!status) return '';
    if (isDelivered(status)) return 'Imetumwa';
    if (status === 'failed') return 'Imeshindikana';
    return status;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      {/* SMS COUNTER */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded text-sm font-medium">
          <FaEnvelopeOpenText />
          <span>
            <b>{smsSentThisMonth}</b> Mwezi huu
          </span>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded text-sm font-medium">
          <FaEnvelopeOpenText />
          <span>
            <b>{smsSentAllTime}</b> Jumla zilizotumwa
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-blue-800">Ujumbe Uliotumwa</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tafuta namba, jina, ujumbe au mlengwa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          />
          <button onClick={exportPDF} className="text-sm text-red-600 hover:underline flex items-center gap-1">
            <FaFilePdf /> PDF
          </button>
          <button onClick={exportExcel} className="text-sm text-green-600 hover:underline flex items-center gap-1">
            <FaFileExcel /> Excel
          </button>
          {selectedIds.length > 0 && (
            <button onClick={deleteSelected} className="text-sm text-gray-700 hover:text-red-700 flex items-center gap-1">
              <FaTrash /> Futa ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-blue-600">
          <FaSpinner className="animate-spin mr-2" />
          Inapakia taarifa...
        </div>
      ) : filteredLogs.length === 0 ? (
        <p className="text-gray-600">Hakuna ujumbe uliotumwa bado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-blue-100 text-gray-800 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={toggleAll}>
                  {selectedIds.length === filteredLogs.length && filteredLogs.length > 0 ? <FaCheckSquare /> : <FaSquare />}
                </th>
                <th className="px-4 py-2">Mpokeaji</th>
                <th className="px-4 py-2">Ujumbe</th>
                <th className="px-4 py-2">Hali</th>
                <th className="px-4 py-2">Tarehe</th>
                <th className="px-4 py-2">Mlengwa</th>
                <th className="px-4 py-2">Sababu</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-dotted border-gray-300 hover:bg-blue-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(log.id)}
                      onChange={() => toggleSelect(log.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{localizeNumber(log.recipient)}</td>
                  <td className="px-4 py-2">{log.message}</td>
                  <td className="px-4 py-2">
                    {isDelivered(log.status) ? (
                      <span className="text-green-600 font-bold">Imetumwa</span>
                    ) : log.status === 'failed' ? (
                      <span className="text-red-600 font-bold">Imeshindikana</span>
                    ) : (
                      <span className="text-gray-600">{log.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{new Date(log.sent_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{log.receiver || '—'}</td>
                  <td className="px-4 py-2">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
