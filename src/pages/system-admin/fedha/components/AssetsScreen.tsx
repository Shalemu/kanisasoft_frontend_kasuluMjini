'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaSave, FaFilePdf, FaFileExcel, FaTrash, FaEdit, FaFileImport, FaDownload } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Asset {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location?: string;
  acquired_date?: string;
  value?: number;
  description?: string;
  created_at: string;
}

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: 1,
    location: '',
    acquired_date: '',
    value: '',
    description: '',
  });

  const fetchAssets = async () => {
    try {
      const res = await apiFetch('/assets');
      setAssets(res.assets || []);
    } catch (err) {
      toast.error('Failed to load assets');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity.toString(), 10),
        value: form.value ? parseFloat(form.value) : undefined,
      };

      let res;
      if (editId) {
        res = await apiFetch(`/assets/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('✅ Asset updated!');
      } else {
        res = await apiFetch('/assets', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('✅ Asset added!');
      }

      if (res.status === 'success') {
        fetchAssets();
        setFormOpen(false);
        setForm({ name: '', category: '', quantity: 1, location: '', acquired_date: '', value: '', description: '' });
        setEditId(null);
      }
    } catch (err: any) {
      toast.error('⛔ Error saving asset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only edit on each row
  const startEditRow = (asset: Asset) => {
    setEditId(asset.id);
    setForm({
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      location: asset.location || '',
      acquired_date: asset.acquired_date || '',
      value: asset.value?.toString() || '',
      description: asset.description || '',
    });
    setFormOpen(true);
  };

  // Bulk delete handler (only on top bar)
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Una uhakika unataka kufuta mali ${selected.length > 1 ? 'hizi' : 'hii'}?`)) return;
    setLoading(true);
    try {
      for (const id of selected) {
        await apiFetch(`/assets/${id}`, { method: 'DELETE' });
      }
      toast.success('⛔ Mali imefutwa!');
      setSelected([]);
      fetchAssets();
    } catch (err: any) {
      toast.error('⛔ Error deleting asset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== IMPORT EXCEL =====
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
        const name = row.Jina || row.Name;
        const category = row.Aina || row.Category;
        const quantity = Number(row.Idadi || row.Quantity || 1);
        const location = row.Mahali || row.Location || '';
        const acquired_date = row.Tarehe || row.Date || '';
        const value = row.Thamani || row.Value || '';
        const description = row.Maelezo || row.Description || '';

        if (!name || !category) continue; // skip rows without name or category

        await apiFetch('/assets', {
          method: 'POST',
          body: JSON.stringify({
            name,
            category,
            quantity,
            location,
            acquired_date,
            value: value ? Number(value) : undefined,
            description,
          }),
        });
        added++;
      }
      await fetchAssets();
      toast.success(`${added} assets added from Excel!`);
    } catch (err) {
      toast.error('Failed to import. Please check the template!');
    }
    setImporting(false);
  };

  // ===== EXCEL TEMPLATE DOWNLOAD =====
  const handleExportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Jina: 'Madhabahu',
        Aina: 'Vifaa',
        Idadi: 1,
        Mahali: 'Kanisani',
        Tarehe: '2024-06-21',
        Thamani: 1000000,
        Maelezo: 'Imeletwa na washirika',
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Assets_Template.xlsx');
  };

  // ===== EXPORT PDF/EXCEL =====
  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['#', 'Jina', 'Aina', 'Idadi', 'Mahali', 'Tarehe', 'Thamani', 'Maelezo']],
      body: filteredAssets.map((a, i) => [
        i + 1,
        a.name,
        a.category,
        a.quantity,
        a.location || '-',
        a.acquired_date || '-',
        a.value ? `TZS ${a.value.toLocaleString()}` : '-',
        a.description || '-',
      ]),
    });
    doc.save('assets.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredAssets.map((a, i) => ({
        '#': i + 1,
        Jina: a.name,
        Aina: a.category,
        Idadi: a.quantity,
        Mahali: a.location || '-',
        Tarehe: a.acquired_date || '-',
        Thamani: a.value || '-',
        Maelezo: a.description || '-',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mali');
    XLSX.writeFile(wb, 'assets.xlsx');
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 text-sm bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Mali za Kanisa</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Tafuta jina au aina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded shadow-sm text-sm text-gray-700"
          />
          <label className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-2 cursor-pointer hover:bg-yellow-600">
            <FaFileImport />
            {importing ? 'Inapakia...' : 'Import Excel'}
            <input type="file" accept=".xls,.xlsx" onChange={handleImportExcel} className="hidden" disabled={importing} />
          </label>
          <button
            onClick={handleExportTemplate}
            className="bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-gray-800"
          >
            <FaDownload /> Template
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2">
            <FaFilePdf /> PDF
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2">
            <FaFileExcel /> Excel
          </button>
          {selected.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={loading}
              className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-red-700"
            >
              <FaTrash />
              {loading ? 'Inafuta...' : `Futa ${selected.length} zilizochaguliwa`}
            </button>
          )}
          <button
            onClick={() => {
              setFormOpen(!formOpen);
              setEditId(null);
              setForm({ name: '', category: '', quantity: 1, location: '', acquired_date: '', value: '', description: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Ongeza Mali
          </button>
        </div>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow border border-gray-200 mb-6"
        >
          <Field label="Jina la Mali" name="name" value={form.name} onChange={handleChange} required />
          <Field label="Aina ya Mali" name="category" value={form.category} onChange={handleChange} required />
          <Field label="Idadi" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
          <Field label="Mahali Ilipo" name="location" value={form.location} onChange={handleChange} />
          <Field label="Tarehe Iliyopatikana" name="acquired_date" type="date" value={form.acquired_date} onChange={handleChange} />
          <Field label="Thamani (TZS)" name="value" type="number" value={form.value} onChange={handleChange} />
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Maelezo ya Ziada</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded flex items-center gap-2"
            >
              <FaSave /> {loading ? 'Inahifadhi...' : (editId ? 'Sasisha Mali' : 'Hifadhi Mali')}
            </button>
            <button
              type="button"
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded"
              onClick={() => {
                setFormOpen(false);
                setEditId(null);
              }}
            >
              Funga
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-300 text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.length === filteredAssets.length && filteredAssets.length > 0}
                  onChange={() => {
                    setSelected(
                      selected.length === filteredAssets.length
                        ? []
                        : filteredAssets.map((a) => a.id)
                    );
                  }}
                />
              </th>
              <th className="px-4 py-2">Jina</th>
              <th className="px-4 py-2">Aina</th>
              <th className="px-4 py-2">Idadi</th>
              <th className="px-4 py-2">Mahali</th>
              <th className="px-4 py-2">Tarehe</th>
              <th className="px-4 py-2">Thamani</th>
              <th className="px-4 py-2">Maelezo</th>
              <th className="px-4 py-2">Rekebisha</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((a, i) => (
                <tr key={a.id} className="odd:bg-white even:bg-gray-50 text-gray-800">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                  </td>
                  <td className="px-4 py-2 align-top">{a.name}</td>
                  <td className="px-4 py-2 align-top">{a.category}</td>
                  <td className="px-4 py-2 align-top">{a.quantity}</td>
                  <td className="px-4 py-2 align-top">{a.location || '-'}</td>
                  <td className="px-4 py-2 align-top">{a.acquired_date || '-'}</td>
                  <td className="px-4 py-2 align-top">{a.value ? `TZS ${a.value.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-2 align-top">{a.description || '-'}</td>
                  <td className="px-4 py-2 align-top">
                    <button
                      className="bg-yellow-500 text-white rounded p-1 hover:bg-yellow-600"
                      title="Rekebisha"
                      onClick={() => startEditRow(a)}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  Hakuna mali zilizorekodiwa bado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable field component
function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      />
    </div>
  );
}
