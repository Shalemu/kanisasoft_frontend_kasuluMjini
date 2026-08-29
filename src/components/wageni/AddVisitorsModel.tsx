'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Swal from 'sweetalert2';
import type { Visitor } from '@/hooks/useVisitors';

export interface VisitorFormData {
  full_name: string;
  phone: string;
  church_origin: string;
  visit_date: string;
  other: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VisitorFormData) => Promise<void> | void;
  visitor?: Visitor | null;
}

const makeForm = (visitor?: Visitor | null): VisitorFormData => visitor ? {
  full_name: visitor.full_name || '',
  phone: visitor.phone || '',
  church_origin: visitor.church_origin || '',
  visit_date: visitor.visit_date?.slice(0, 10) || '',
  other: visitor.other || '',
} : {
  full_name: '', phone: '', church_origin: '',
  visit_date: new Date().toISOString().slice(0, 10), other: '',
};

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, className = '', children }: FieldWrapperProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AddVisitorModal({ open, onClose, onSubmit, visitor }: Props) {
  const [form, setForm] = useState<VisitorFormData>(() => makeForm(visitor));
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const handleSave = async () => {
  if (
    !form.full_name ||
    !form.phone ||
    !form.church_origin ||
    !form.visit_date
  ) {
    await Swal.fire(
      'Taarifa Hazijakamilika',
      'Jaza jina, simu, kanisa na tarehe.',
      'warning'
    );
    return;
  }

  try {
    setSaving(true);

    await onSubmit(form);

    await Swal.fire(
      'Imefanikiwa',
      visitor
        ? 'Taarifa za mgeni zimehaririwa.'
        : 'Mgeni ameongezwa kikamilifu.',
      'success'
    );

    // Don't call onClose here if parent already closes it
  } catch (error) {
    await Swal.fire(
      'Hitilafu',
      error instanceof Error
        ? error.message
        : 'Imeshindikana kuhifadhi taarifa.',
      'error'
    );
  } finally {
    setSaving(false);
  }
};

  const inputClass = 'w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500';
  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white/90">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{visitor ? 'Hariri Taarifa za Mgeni' : 'Ongeza Taarifa za Mgeni'}</h3>
          {visitor && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {visitor.full_name || 'Mgeni'} · {visitor.church_origin || 'Kanisa halipo'} · {visitor.visit_date ? new Date(visitor.visit_date).toLocaleDateString() : 'Tarehe haipo'}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldWrapper label="Jina Kamili" htmlFor="visitor-full-name">
            <input id="visitor-full-name" className={inputClass} placeholder="Jina Kamili" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </FieldWrapper>
          <FieldWrapper label="Namba ya Simu" htmlFor="visitor-phone">
            <input id="visitor-phone" className={inputClass} placeholder="Namba ya Simu" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FieldWrapper>
          <FieldWrapper label="Kanisa Alikotoka" htmlFor="visitor-church-origin">
            <input id="visitor-church-origin" className={inputClass} placeholder="Kanisa Alikotoka" value={form.church_origin} onChange={(e) => setForm({ ...form, church_origin: e.target.value })} />
          </FieldWrapper>
          <FieldWrapper label="Tarehe ya Kutembelea" htmlFor="visitor-visit-date">
            <input id="visitor-visit-date" className={inputClass} type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
          </FieldWrapper>
          <FieldWrapper label="Maelezo Mengine" htmlFor="visitor-other" className="md:col-span-2">
            <textarea id="visitor-other" className={inputClass} placeholder="Maelezo mengine kama yapo" value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} />
          </FieldWrapper>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">Ghairi</button>
          <button disabled={saving} onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Inahifadhi...' : 'Hifadhi'}</button>
        </div>
      </div>
    </div>
  );
}
