'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { subDays, parseISO, isAfter } from 'date-fns';
import { FaSearch, FaPlus, FaClock, FaFileImport, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Report {
  id: number;
  date: string;
  type: string;
  amount: number;
  method: string;
  giver: string;
  user_id?: number | null;
  phone?: string; // Will be resolved using users table if not present
}
interface User {
  id: number;
  full_name: string;
  phone: string;
}
interface TypeOption {
  id: number;
  name: string;
}

function EditableTypeRow({
  type,
  refreshTypes,
}: {
  type: { id: number; name: string };
  refreshTypes: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(type.name);

  const saveEdit = async () => {
    if (editedName.trim() !== '') {
      await apiFetch(`/contribution-types/${type.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editedName }),
      });
      await refreshTypes();
      setIsEditing(false);
    }
  };
  const cancelEdit = () => {
    setEditedName(type.name);
    setIsEditing(false);
  };
  const deleteType = async () => {
    if (confirm('Thibitisha kufuta aina hii?')) {
      await apiFetch(`/contribution-types/${type.id}`, { method: 'DELETE' });
      await refreshTypes();
    }
  };
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">
        {isEditing ? (
          <input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full border px-2 py-1 rounded" />
        ) : (
          <span>{type.name}</span>
        )}
      </td>
      <td className="px-4 py-2 space-x-2">
        {isEditing ? (
          <>
            <button onClick={saveEdit} className="text-green-600 hover:underline text-sm">💾 Hifadhi</button>
            <button onClick={cancelEdit} className="text-gray-500 hover:underline text-sm">✖ Ghairi</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline text-sm">Hariri</button>
            <button onClick={deleteType} className="text-red-600 hover:underline text-sm">🗑️ Futa</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function Mchango() {
  const [reports, setReports] = useState<Report[]>([]);
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [filter, setFilter] = useState<string>('Yote');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [form, setForm] = useState<{ date: string; type: string; amount: string; method: string; giver: string; phone: string; user_id: number | null }>({
    date: '', type: '', amount: '', method: '', giver: '', phone: '', user_id: null
  });
  const [newType, setNewType] = useState('');
  const [giverType, setGiverType] = useState('mshirika');
  const [washirika, setWashirika] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showTypesList, setShowTypesList] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [duration, setDuration] = useState<number>(Infinity);
  const [importing, setImporting] = useState(false);

  // New: Cache all users with phone numbers
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const durations = [
    { label: 'Siku 7', days: 7 },
    { label: 'Mwezi 1', days: 30 },
    { label: 'Miezi 3', days: 90 },
    { label: 'Mwaka 1', days: 365 },
    { label: 'Yote', days: Infinity },
  ];

  // Fetchers
  const fetchContributions = async () => {
    const res = await apiFetch('/contributions');
    if (res?.reports) setReports(res.reports.map((r: any) => ({ ...r, amount: Number(r.amount) })));
  };
  const fetchTypes = async () => {
    const res = await apiFetch('/contribution-types');
    if (res?.types) setTypes(res.types);
  };
  const fetchWashirika = async () => {
    const res = await apiFetch('/users');
    if (res?.users) {
      setWashirika(res.users.map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        phone: u.phone || '',
      })));
    }
  };
  // Fetch ALL users (for phone lookup)
  const fetchAllUsers = async () => {
    const res = await apiFetch('/users');
    if (res?.users) {
      setAllUsers(res.users.map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        phone: u.phone || '',
      })));
    }
  };

  const addNewType = async () => {
    if (newType.trim()) {
      const res = await apiFetch('/contribution-types', {
        method: 'POST', body: JSON.stringify({ name: newType.trim() })
      });
      if (res?.status === 'success') await fetchTypes();
    }
    setNewType('');
    setShowTypeModal(false);
  };

  useEffect(() => {
    fetchContributions();
    fetchTypes();
    fetchAllUsers(); // Fetch user list for phone lookups
  }, []);
  useEffect(() => {
    if (showAddModal && giverType === 'mshirika') fetchWashirika();
  }, [showAddModal, giverType]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtering logic: search both name and phone
  const filtered = reports
    .map((r) => {
      // Try to resolve the phone by user_id if not present
      let phone = r.phone;
      // Check by user_id or giver name (for historical/fallbacks)
      if (!phone && r.user_id && allUsers.length) {
        const user = allUsers.find((u) => u.id === r.user_id);
        if (user) phone = user.phone;
      }
      if (!phone && r.giver && allUsers.length) {
        // fallback by name (case-insensitive, if matching)
        const user = allUsers.find((u) => u.full_name.trim().toLowerCase() === r.giver.trim().toLowerCase());
        if (user) phone = user.phone;
      }
      return { ...r, phone };
    })
    .filter((r) => {
      const matchType = filter === 'Yote' || r.type === filter;
      const phoneStr = r.phone || '';
      const matchSearch =
        (r.giver || '').toLowerCase().includes(search.toLowerCase()) ||
        phoneStr.toLowerCase().includes(search.toLowerCase());
      const reportDate = parseISO(r.date);
      const thresholdDate = subDays(new Date(), duration);
      const withinRange = duration === Infinity || isAfter(reportDate, thresholdDate);
      return matchType && matchSearch && withinRange;
    });
  const total = filtered.reduce((sum, r) => sum + r.amount, 0);

  // Submission logic
  const handleSubmit = async () => {
    if (!form.date || !form.type || !form.amount || !form.method) return;
    const payload: any = { date: form.date, type: form.type, amount: parseFloat(form.amount), method: form.method };
    if (giverType === 'mshirika' && form.user_id) {
      payload.user_id = form.user_id;
      payload.phone_number = form.phone;
    }
    else if (giverType === 'mwingine' && form.giver) {
      payload.giver_name = form.giver;
      payload.phone_number = form.phone;
    }
    else { alert('Tafadhali chagua mshirika au andika jina la mtoaji.'); return; }
    try {
      const res = await apiFetch('/contributions', { method: 'POST', body: JSON.stringify(payload) });
      if (res?.status === 'success') {
        const newReport = { ...res.data, amount: Number(res.data?.amount ?? form.amount), giver: res.data?.giver ?? form.giver, phone: res.data?.phone || form.phone };
        setReports((prev) => [...prev, newReport]);
        setForm({ date: '', type: '', amount: '', method: '', giver: '', phone: '', user_id: null });
        setSearchQuery('');
        setShowAddModal(false);
      } else alert(res?.message || 'Imeshindikana kuhifadhi. Tafadhali angalia taarifa.');
    } catch (err) { alert('Hitilafu ya mtandao au seva. Tafadhali jaribu tena.'); }
  };

  // Excel import logic (add Phone number)
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      let added = 0;
      for (const row of rows) {
        const date = row.Tarehe || row.Date;
        const type = row.Aina || row.Type;
        const method = row.Njia || row.Method;
        const amount = row.Kiasi || row.Amount;
        const giver = row.Mtoaji || row.Giver;
        const phone = row.Simu || row.Phone || '';
        if (!date || !type || !method || !amount || !giver) continue;
        await apiFetch('/contributions', {
          method: 'POST',
          body: JSON.stringify({ date, type, amount: parseFloat(amount), method, giver_name: giver, phone_number: phone })
        });
        added++;
      }
      await fetchContributions();
      alert(`${added} michango imeongezwa kupitia Excel!`);
    } catch (err) {
      alert('Imeshindikana kusoma faili. Hakikisha ni Excel template sahihi.');
    }
    setImporting(false);
  };

  // Excel Template Export: include phone
  const handleExportTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { Tarehe: '2025-01-15', Mtoaji: 'Jane Doe', Simu: '0712000111', Aina: 'Zaka', Njia: 'Mpesa', Kiasi: 10000 }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Mchango_Template.xlsx');
  };

  // Table row selection logic
  const handleBulkDelete = async () => {
    if (!confirm('Una uhakika unataka kufuta michango iliyochaguliwa?')) return;
    try {
      for (const id of selectedIds) {
        await apiFetch(`/contributions/${id}`, { method: 'DELETE' });
      }
      setReports((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (err) { alert('Hitilafu ya mtandao au seva. Tafadhali jaribu tena.'); }
  };

  // Washirika search by name or phone
  const filteredWashirika = washirika.filter((w) =>
    w.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">📊 Michango</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-1">
            <FaPlus /> Ongeza Mchango
          </button>
          <label className="bg-yellow-500 text-white px-4 py-2 rounded shadow flex items-center gap-1 cursor-pointer hover:bg-yellow-600">
            <FaFileImport />
            {importing ? 'Inapakia...' : 'Import Excel'}
            <input type="file" accept=".xls,.xlsx" onChange={handleImportExcel} className="hidden" disabled={importing} />
          </label>
          <button onClick={handleExportTemplate} className="bg-gray-700 text-white px-4 py-2 rounded shadow flex items-center gap-1 hover:bg-gray-800">
            <FaDownload /> Template
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(
              filtered.map((r) => ({
                Tarehe: new Date(r.date).toLocaleDateString('en-CA'),
                Mtoaji: r.giver,
                Simu: r.phone || '',
                Aina: r.type,
                Njia: r.method,
                Kiasi: r.amount,
              }))
            );
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Michango');
            XLSX.writeFile(wb, 'Michango.xlsx');
          }}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 text-sm"
        >
          📥 Export Excel
        </button>
        <button
          onClick={() => {
            const doc = new jsPDF();
            doc.text('Ripoti ya Michango', 14, 15);
            autoTable(doc, {
              startY: 20,
              head: [['Tarehe', 'Mtoaji', 'Simu', 'Aina', 'Njia', 'Kiasi']],
              body: filtered.map((r) => [
                new Date(r.date).toLocaleDateString('en-CA'),
                r.giver,
                r.phone || '',
                r.type,
                r.method,
                `${r.amount.toLocaleString()} Tsh`,
              ]),
            });
            doc.save('Michango.pdf');
          }}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 text-sm"
        >
          📄 Export PDF
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={() => setFilter('Yote')} className={`px-4 py-2 rounded-full text-sm ${filter === 'Yote' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 border'}`}>Yote</button>
        {types.map((cat) => (
          <button key={cat.id} onClick={() => setFilter(cat.name)} className={`px-4 py-2 rounded-full text-sm ${filter === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 border'}`}>{cat.name}</button>
        ))}
        <button onClick={() => setShowTypeModal(true)} className="text-sm text-blue-600 underline ml-2">+ Aina mpya</button>
      </div>

      <div className="mt-2">
        <button onClick={() => setShowTypesList(!showTypesList)} className="text-sm text-blue-600 underline">
          {showTypesList ? 'Funga Aina za Michango' : 'Badilisha Aina za Michango'}
        </button>
      </div>

      {/* Search + Duration Filter Row */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="flex items-center border px-4 py-2 rounded-lg bg-white shadow-sm w-full md:w-2/3">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kwa jina au namba ya simu..."
            className="w-full outline-none text-sm text-gray-800"
          />
        </div>
        {/* Duration Filter */}
        <div className="relative w-full md:w-1/3">
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full appearance-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700">
            {durations.map((d) => <option key={d.label} value={d.days}>{d.label}</option>)}
          </select>
          <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              <th className="text-left px-6 py-3">
                <input type="checkbox" checked={selectAll} onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectAll(checked);
                  setSelectedIds(checked ? filtered.map((r) => r.id) : []);
                }} />
                <span className="ml-2">Tarehe</span>
              </th>
              <th className="text-left px-6 py-3">Mtoaji</th>
              <th className="text-left px-6 py-3">Simu</th>
              <th className="text-left px-6 py-3">Aina</th>
              <th className="text-left px-6 py-3">Njia</th>
              <th className="text-right px-6 py-3">Kiasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => {
                    const updated = e.target.checked
                      ? [...selectedIds, r.id]
                      : selectedIds.filter((id) => id !== r.id);
                    setSelectedIds(updated);
                    if (!e.target.checked) setSelectAll(false);
                  }} />
                  <span className="ml-2">{new Date(r.date).toLocaleDateString('en-CA')}</span>
                </td>
                <td className="px-6 py-4">{r.giver}</td>
                <td className="px-6 py-4">{r.phone || ''}</td>
                <td className="px-6 py-4">{r.type}</td>
                <td className="px-6 py-4">{r.method}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-800">{r.amount.toLocaleString()} Tsh</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold text-gray-800">
              <td colSpan={5} className="px-6 py-3 text-right">Jumla:</td>
              <td className="px-6 py-3 text-right text-blue-700">{total.toLocaleString()} Tsh</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Bulk Delete Button */}
      {selectedIds.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button onClick={handleBulkDelete} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 shadow">Futa Uliyochagua</button>
        </div>
      )}

      {/* Types Table */}
      {showTypesList && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-lg">📂 Aina za Michango</h3>
          <div className="overflow-x-auto rounded border shadow">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-2">Jina</th>
                  <th className="text-left px-4 py-2">Vitendo</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => <EditableTypeRow key={type.id} type={type} refreshTypes={fetchTypes} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg relative">
            <h3 className="text-lg font-semibold mb-4">Ongeza Mchango Mpya</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="">Chagua aina</option>
                {types.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Kiasi (Tsh)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Njia ya malipo"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="border px-3 py-2 rounded"
              />

              <select
                value={giverType}
                onChange={(e) => {
                  setGiverType(e.target.value);
                  setForm({ ...form, giver: '', phone: '', user_id: null });
                  setSearchQuery('');
                }}
                className="border px-3 py-2 rounded"
              >
                <option value="mshirika">Mshirika</option>
                <option value="mwingine">Mwingine</option>
              </select>

              {giverType === 'mshirika' ? (
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tafuta jina au simu ya mshirika..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="border px-3 py-2 rounded w-full"
                  />
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 max-h-64 overflow-auto bg-white border border-gray-300 shadow-md rounded text-sm mt-1 w-full"
                    >
                      {filteredWashirika.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500">Hakuna mshirika</div>
                      ) : (
                        filteredWashirika.map((w) => (
                          <div
                            key={w.id}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex items-center justify-between"
                            onClick={() => {
                              setForm({
                                ...form,
                                giver: w.full_name,
                                user_id: w.id,
                                phone: w.phone || '', // always use w.phone here!
                              });
                              setSearchQuery(
                                `${w.full_name}${w.phone ? ' - ' + w.phone : ''}`
                              );
                              setShowDropdown(false);
                            }}
                          >
                            <span>{w.full_name}</span>
                            {w.phone && (
                              <span className="ml-2 text-xs text-gray-500">
                                {w.phone}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Namba ya simu"
                    value={form.phone}
                    readOnly
                    className="border px-3 py-2 rounded w-full mt-2 bg-gray-50"
                  />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Jina la mtoaji"
                    value={form.giver}
                    onChange={(e) => setForm({ ...form, giver: e.target.value })}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Namba ya simu"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="border px-3 py-2 rounded"
                  />
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                Ghairi
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Hifadhi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Ongeza Aina Mpya ya Mchango</h3>
            <input type="text" placeholder="Mf. Maendeleo ya Ujenzi" value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowTypeModal(false)} className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100">Ghairi</button>
              <button onClick={addNewType} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ongeza Aina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
