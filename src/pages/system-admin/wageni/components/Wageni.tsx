'use client';
import { useEffect, useState } from 'react';
import { FaSearch, FaFilter, FaUserPlus, FaTrash, FaFilePdf, FaFileExcel, FaUpload } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface Visitor {
  id?: number;
  full_name: string;
  phone: string;
  church_origin: string;
  visit_date: string;
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string;
}

const reasons = ['Yote', 'Maombi', 'Kuokoka', 'Kujiunga na Ushirika', 'Safari', 'Nyingine'];

export default function WageniTab() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState('Yote');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Visitor>({
    full_name: '',
    phone: '',
    church_origin: '',
    visit_date: new Date().toISOString().split('T')[0],
    prayer: false,
    salvation: false,
    joining: false,
    travel: false,
    other: '',
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await apiFetch('/guests');
      setVisitors(res.guests || []);
    } catch (error) {
      console.error('Failed to fetch guests', error);
    }
  };

  const filtered = visitors.filter((v) => {
    const nameMatch = v.full_name.toLowerCase().includes(search.toLowerCase());
    const reasonMatch =
      selectedReason === 'Yote' ||
      (selectedReason === 'Maombi' && v.prayer) ||
      (selectedReason === 'Kuokoka' && v.salvation) ||
      (selectedReason === 'Kujiunga na Ushirika' && v.joining) ||
      (selectedReason === 'Safari' && v.travel) ||
      (selectedReason === 'Nyingine' && v.other);
    return nameMatch && reasonMatch;
  });

  const handleAddVisitor = async () => {
    if (!form.full_name || !form.phone || !form.church_origin) {
      alert('Tafadhali jaza taarifa zote muhimu.');
      return;
    }
    try {
      await apiFetch('/guests', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setShowModal(false);
      fetchVisitors();
      resetForm();
    } catch {
      alert('Hitilafu wakati wa kuhifadhi.');
    }
  };

  const resetForm = () => {
    setForm({
      full_name: '',
      phone: '',
      church_origin: '',
      visit_date: new Date().toISOString().split('T')[0],
      prayer: false,
      salvation: false,
      joining: false,
      travel: false,
      other: '',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Je, una uhakika unataka kufuta wageni walioteuliwa?')) return;
    for (const id of selectedIds) {
      try {
        await apiFetch(`/guests/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Delete failed for ID', id);
      }
    }
    setSelectedIds([]);
    setSelectAll(false);
    fetchVisitors();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((v) => v.id!));
    }
    setSelectAll(!selectAll);
  };

  // --- Sababu formatting helpers ---
  function sababuToString(v: Visitor) {
    // Compact string for sababu column
    const reasons: string[] = [];
    if (v.prayer) reasons.push('Maombi');
    if (v.salvation) reasons.push('Kuokoka');
    if (v.joining) reasons.push('Kujiunga na Ushirika');
    if (v.travel) reasons.push('Safari');
    if (v.other) reasons.push(v.other);
    return reasons.join(', ');
  }

  function parseSababu(str: string) {
    // Converts comma-separated sababu to booleans/other
    const s = str.toLowerCase();
    return {
      prayer: s.includes('maombi'),
      salvation: s.includes('kuokoka'),
      joining: s.includes('kujiunga'),
      travel: s.includes('safari'),
      // anything not matching above becomes other, unless empty
      other: extractOtherFromSababu(str)
    };
  }
  function extractOtherFromSababu(str: string) {
    // Find any reason in the sababu string that's not standard, treat as other
    if (!str) return '';
    const known = ['maombi','kuokoka','kujiunga','ushirika','safari'];
    return str.split(',').map(x => x.trim()).filter(x =>
      !known.some(k => x.toLowerCase().includes(k)) && x
    ).join(', ');
  }

  // --- Export & Import ---
  const exportToExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(filtered.map((v) => ({
      'Tarehe': v.visit_date,
      'Jina Kamili': v.full_name,
      'Simu': v.phone,
      'Kanisa Alikotoka': v.church_origin,
      'Sababu': sababuToString(v),
    })));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Wageni');
    saveAs(new Blob([XLSX.write(book, { bookType: 'xlsx', type: 'array' })]), 'wageni.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Tarehe', 'Jina Kamili', 'Simu', 'Kanisa', 'Sababu']],
      body: filtered.map((v) => [
        v.visit_date,
        v.full_name,
        v.phone,
        v.church_origin,
        sababuToString(v)
      ]),
    });
    doc.save('wageni.pdf');
  };

  // --- Accept uploads with Sababu column ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Expect "Sababu" column (or legacy columns)
        const headers = Object.keys(rows[0] || {});
        const hasName = headers.some(h => h.trim().toLowerCase() === 'jina kamili');
        const hasPhone = headers.some(h => h.trim().toLowerCase().includes('simu'));
        const hasChurch = headers.some(h => h.trim().toLowerCase().includes('kanisa'));
        const hasDate = headers.some(h => h.trim().toLowerCase() === 'tarehe');
        const hasSababu = headers.some(h => h.trim().toLowerCase() === 'sababu');

        if (!hasName || !hasPhone || !hasChurch || !hasDate) {
          alert('Excel lazima iwe na "Tarehe", "Jina Kamili", "Namba ya Simu", na "Kanisa Alikotoka".');
          setUploading(false);
          return;
        }

        let imported = 0, failed = 0;
        for (const row of rows) {
          // Parse sababu (use either "Sababu" column or legacy columns)
          let parsed = { prayer: false, salvation: false, joining: false, travel: false, other: '' };
          if (row['Sababu']) {
            parsed = parseSababu(row['Sababu']);
          } else {
            parsed = {
              prayer: !!(row['Maombi'] && (row['Maombi'] === true || row['Maombi'].toString().toLowerCase() === 'ndio' || row['Maombi'] === 1)),
              salvation: !!(row['Kuokoka'] && (row['Kuokoka'] === true || row['Kuokoka'].toString().toLowerCase() === 'ndio' || row['Kuokoka'] === 1)),
              joining: !!(row['Kujiunga na Ushirika'] && (row['Kujiunga na Ushirika'] === true || row['Kujiunga na Ushirika'].toString().toLowerCase() === 'ndio' || row['Kujiunga na Ushirika'] === 1)),
              travel: !!(row['Safari'] && (row['Safari'] === true || row['Safari'].toString().toLowerCase() === 'ndio' || row['Safari'] === 1)),
              other: row['Sababu Nyingine'] || '',
            };
          }
          const v: Visitor = {
            full_name: row['Jina Kamili'] || '',
            phone: row['Namba ya Simu'] || row['Simu'] || '',
            church_origin: row['Kanisa Alikotoka'] || row['Kanisa'] || '',
            visit_date: row['Tarehe'] ? String(row['Tarehe']).split('T')[0] : new Date().toISOString().split('T')[0],
            ...parsed,
          };
          if (!v.full_name || !v.phone || !v.church_origin || !v.visit_date) { failed++; continue; }
          try {
            await apiFetch('/guests', {
              method: 'POST',
              body: JSON.stringify(v),
            });
            imported++;
          } catch {
            failed++;
          }
        }
        fetchVisitors();
        alert(`✅ ${imported} wageni wameongezwa! ${failed ? failed + ' walishindwa.' : ''}`);
      } else {
        alert('Tafadhali chagua faili la Excel (.xlsx/.xls).');
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // --- Template has "Sababu" example ---
  const downloadTemplate = () => {
    const sampleRow = {
      'Jina Kamili': 'Mgeni Mfano',
      'Namba ya Simu': '0712345678',
      'Kanisa Alikotoka': 'FPCT Buguruni',
      'Tarehe': new Date().toISOString().split('T')[0],
      'Sababu': 'Maombi, Safari', // Example: comma separated, can add custom reason
    };
    const ws = XLSX.utils.json_to_sheet([sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })]), 'wageni_template.xlsx');
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      {/* Button Group */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">👥 Wageni Waliohudhuria</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleDelete} disabled={selectedIds.length === 0}
            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium hover:bg-red-700 shadow-sm transition-all duration-100"
            style={{ minWidth: 60 }}>
            <FaTrash className="text-sm" /> Futa
          </button>
          <button onClick={exportToExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium hover:bg-green-700 shadow-sm transition-all duration-100"
            style={{ minWidth: 60 }}>
            <FaFileExcel className="text-sm" /> Excel
          </button>
          <button onClick={exportToPDF}
            className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium hover:bg-gray-900 shadow-sm transition-all duration-100"
            style={{ minWidth: 60 }}>
            <FaFilePdf className="text-sm" /> PDF
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium hover:bg-blue-700 shadow-sm transition-all duration-100"
            style={{ minWidth: 60 }}>
            <FaUserPlus className="text-sm" /> Ongeza Mgeni
          </button>
          <label className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium shadow-sm cursor-pointer transition-all duration-100"
            style={{ minWidth: 60 }}>
            <FaUpload className="text-sm" /> Pakia Excel
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
          <button onClick={downloadTemplate}
            className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1.5 rounded-[0.6rem] text-xs font-medium hover:bg-indigo-700 shadow-sm transition-all duration-100"
            style={{ minWidth: 60 }}>
            Pakua Template
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center border px-3 py-2 rounded bg-white w-full md:w-1/2 shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta jina la mgeni..."
            className="w-full outline-none text-sm"
          />
        </div>
        <div className="flex items-center border px-3 py-2 rounded bg-white w-full md:w-1/3 shadow-sm">
          <FaFilter className="text-gray-400 mr-2" />
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          >
            {reasons.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th className="text-left px-4 py-3">Tarehe</th>
              <th className="text-left px-4 py-3">Jina Kamili</th>
              <th className="text-left px-4 py-3">Simu</th>
              <th className="text-left px-4 py-3">Kanisa</th>
              <th className="text-left px-4 py-3">Sababu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.includes(v.id!)} onChange={() => toggleSelect(v.id!)} />
                </td>
                <td className="px-4 py-3">{v.visit_date}</td>
                <td className="px-4 py-3">{v.full_name}</td>
                <td className="px-4 py-3">{v.phone}</td>
                <td className="px-4 py-3">{v.church_origin}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {v.prayer && <ReasonBadge label="Maombi" />}
                    {v.salvation && <ReasonBadge label="Kuokoka" />}
                    {v.joining && <ReasonBadge label="Kujiunga na Ushirika" />}
                    {v.travel && <ReasonBadge label="Safari" />}
                    {v.other && <ReasonBadge label={v.other} />}
                    {!v.prayer && !v.salvation && !v.joining && !v.travel && !v.other && (
                      <span className="text-gray-400 italic">Hakuna sababu</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Ongeza Taarifa za Mgeni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Jina Kamili" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="border px-3 py-2 rounded-md" />
              <input type="text" placeholder="Namba ya Simu" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border px-3 py-2 rounded-md" />
              <input type="text" placeholder="Kanisa Alikotoka" value={form.church_origin}
                onChange={(e) => setForm({ ...form, church_origin: e.target.value })}
                className="border px-3 py-2 rounded-md" />
              <input type="date" value={form.visit_date}
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                className="border px-3 py-2 rounded-md" />
              <textarea placeholder="Sababu Nyingine (hiari)" value={form.other}
                onChange={(e) => setForm({ ...form, other: e.target.value })}
                className="border px-3 py-2 rounded-md col-span-2" />
              <div className="col-span-2 flex flex-wrap gap-4">
                <Checkbox label="Maombi" checked={form.prayer} onChange={() => setForm({ ...form, prayer: !form.prayer })} />
                <Checkbox label="Kuokoka" checked={form.salvation} onChange={() => setForm({ ...form, salvation: !form.salvation })} />
                <Checkbox label="Kujiunga na Ushirika" checked={form.joining} onChange={() => setForm({ ...form, joining: !form.joining })} />
                <Checkbox label="Safari" checked={form.travel} onChange={() => setForm({ ...form, travel: !form.travel })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100">Ghairi</button>
              <button onClick={handleAddVisitor} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Hifadhi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReasonBadge({ label }: { label: string }) {
  return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">{label}</span>;
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox" />
      {label}
    </label>
  );
}
