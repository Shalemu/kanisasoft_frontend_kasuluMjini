'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';

interface Visitor {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedVisitors: Visitor[];
}

export default function SendMessageModal({
  open,
  onClose,
  selectedVisitors,
}: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!open) return null;

  const previewVisitor =
    selectedVisitors[0] ?? {
      full_name: 'Jina la Mgeni',
    };

  const previewMessage = `Bwana Yesu Asifiwe ${previewVisitor.full_name},
${message.trim()}`;


const handleSend = async () => {
  if (!message.trim()) {
    Swal.fire({
      title: 'Ujumbe Unahitajika',
      text: 'Tafadhali andika ujumbe kwanza.',
      icon: 'warning',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#f59e0b',
    });
    return;
  }

  setSending(true);

  try {
    let success = 0;
    let failed = 0;

    for (const visitor of selectedVisitors) {
      try {
        const personalizedMessage =
          `Bwana Yesu Asifiwe ${visitor.full_name},\n${message.trim()}`;

        const response = await apiFetch('/send-sms', {
          method: 'POST',
          body: {
            phone: visitor.phone,
            email: visitor.email || '',
            name: visitor.full_name,
            message: personalizedMessage,
            send_email: !!visitor.email,
          },
        });

        const smsSent = Number(
          response?.summary?.sms_sent ?? 0
        );

        if (smsSent > 0) {
          success++;
        } else {
          failed++;
        }

      } catch (error) {
        console.error('SMS REQUEST ERROR:', error);
        failed++;
      }
    }

    await Swal.fire({
      title:
        failed > 0
          ? 'Imekamilika Kwa Sehemu'
          : 'Imefanikiwa',

      text: `${success} ujumbe umetumwa.${
        failed > 0 ? ` ${failed} imeshindikana.` : ''
      }`,

      icon:
        failed > 0
          ? 'warning'
          : 'success',

      confirmButtonText: 'Sawa',
      confirmButtonColor: '#2563eb',
    });

    setMessage('');
    onClose();

  } catch (error) {
    console.error('GENERAL SMS ERROR:', error);

    await Swal.fire({
      title: 'Tatizo',
      text:
        error instanceof Error
          ? error.message
          : 'Hitilafu wakati wa kutuma ujumbe.',
      icon: 'error',
      confirmButtonText: 'Sawa',
      confirmButtonColor: '#dc2626',
    });

  } finally {
    setSending(false);
  }
};


  return (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-gray-800 dark:bg-gray-900 dark:text-white/90">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Tuma Ujumbe
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Wageni waliochaguliwa: {selectedVisitors.length}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400"
        >
          ✕
        </button>
      </div>

      <textarea
        rows={6}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setShowPreview(false);
        }}
        placeholder="Andika ujumbe wako hapa..."
        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
      />

      {showPreview && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          {/* <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">
            Preview ya SMS
          </h3> */}

          <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {previewMessage}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (!message.trim()) {
              Swal.fire({
                title: 'Ujumbe Unahitajika',
                text: 'Tafadhali andika ujumbe kwanza.',
                icon: 'warning',
                confirmButtonText: 'Sawa',
                confirmButtonColor: '#f59e0b',
              });
              return;
            }

            setShowPreview(!showPreview);
          }}
          className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          {showPreview ? 'Funga' : 'Hakiki Ujumbe'}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Ghairi
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Inatuma...' : 'Tuma Ujumbe'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}