'use client';

import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FaSms } from 'react-icons/fa';
import { FiUsers, FiUser, FiSend } from 'react-icons/fi';

import { useSendSms } from '@/hooks/sms/useSendSms';
import { apiFetch } from '@/lib/api';

interface User {
  id: number;
  full_name: string;
}

interface Group {
  id: number;
  name: string;
}

export default function TumaUjumbe() {
  const [receiverType, setReceiverType] = useState('');
  const [receiverValue, setReceiverValue] = useState('');
  const [message, setMessage] = useState('');

  const [washirika, setWashirika] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const { sendSms, loading } = useSendSms();

  useEffect(() => {
    async function loadReceivers() {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          apiFetch('/users'),
          apiFetch('/groups'),
        ]);

        const users =
          usersRes?.users ??
          usersRes?.data?.users ??
          [];

        setWashirika(
          users.filter(
            (user: any) =>
              user.role !== 'mchungaji' &&
              user.membership_status === 'active'
          )
        );

        setGroups(
          groupsRes?.groups ??
            groupsRes?.data?.groups ??
            []
        );
      } catch (error) {
        console.error(error);
      }
    }

    void loadReceivers();
  }, []);

  const smsLength = message.length;

  const smsCount =
    smsLength === 0
      ? 0
      : Math.ceil(smsLength / 160);

  const currentLimit =
    smsCount === 0
      ? 160
      : smsCount * 160;

  const remaining =
    currentLimit - smsLength;

  const progress =
    smsLength === 0
      ? 0
      : (smsLength / currentLimit) * 100;

  const receiverLabel = useMemo(() => {
    switch (receiverType) {
      case 'all':
        return 'Wote';
      case 'group':
        return 'Kundi';
      case 'individual':
        return 'Mtu Mmoja';
      default:
        return 'Hakuna';
    }
  }, [receiverType]);

  const handleSend = async () => {
    if (!receiverType || !message.trim()) {
      Swal.fire(
        'Tahadhari',
        'Chagua mpokeaji na andika ujumbe.',
        'warning'
      );
      return;
    }

    if (
      receiverType !== 'all' &&
      !receiverValue
    ) {
      Swal.fire(
        'Tahadhari',
        'Chagua mpokeaji.',
        'warning'
      );
      return;
    }

    try {
      const res = await sendSms({
        type: receiverType,
        receiver: receiverValue,
        message,
      });

      if (
        res?.status === 'success' ||
        !res?.error
      ) {
        Swal.fire(
          'Imefanikiwa',
          'Ujumbe umetumwa.',
          'success'
        );

        setMessage('');
        setReceiverValue('');
      } else {
        Swal.fire(
          'Hitilafu',
          res?.message ||
            'Imeshindikana kutuma.',
          'error'
        );
      }
    } catch (error) {
      Swal.fire(
        'Hitilafu',
        error instanceof Error
          ? error.message
          : 'Imeshindikana kutuma.',
        'error'
      );
    }
  };

  const groupOptions = groups.map(group => ({
    value: String(group.id),
    label: group.name,
  }));

  const memberOptions = washirika.map(
    member => ({
      value: String(member.id),
      label: member.full_name,
    })
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4">

      {/* HEADER CARD */}
     {/* <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#475569] text-white shadow-2xl">

        <div className="p-6">

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-4">
              <FaSms size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Tuma Ujumbe
              </h1>

              <p className="text-blue-100">
                Tuma ujumbe kwa washirika,
                makundi au wote kwa pamoja.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Herufi
              </p>

              <p className="text-3xl font-bold">
                {smsLength}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                SMS
              </p>

              <p className="text-3xl font-bold">
                {smsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Zimebaki
              </p>

              <p className="text-3xl font-bold">
                {remaining}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">
                Mpokeaji
              </p>

              <p className="text-xl font-bold">
                {receiverLabel}
              </p>
            </div>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-sm">
              <span>Matumizi ya SMS</span>

              <span>
                {smsLength}/{currentLimit}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>
        </div>
      </div> */}

      {/* RECEIVER CARD */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

        <h2 className="mb-5 text-lg font-semibold">
          Chagua Mpokeaji
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <button
            type="button"
            onClick={() => {
              setReceiverType('all');
              setReceiverValue('');
            }}
            className={`rounded-2xl border p-5 transition-all ${
              receiverType === 'all'
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FiUsers className="mx-auto mb-2 text-2xl" />
            <div className="font-semibold">
              Wote
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setReceiverType('group');
              setReceiverValue('');
            }}
            className={`rounded-2xl border p-5 transition-all ${
              receiverType === 'group'
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FiUsers className="mx-auto mb-2 text-2xl" />
            <div className="font-semibold">
              Kundi
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setReceiverType(
                'individual'
              );
              setReceiverValue('');
            }}
            className={`rounded-2xl border p-5 transition-all ${
              receiverType ===
              'individual'
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FiUser className="mx-auto mb-2 text-2xl" />
            <div className="font-semibold">
              Mtu Mmoja
            </div>
          </button>

        </div>

        {receiverType === 'group' && (
          <div className="mt-5">
            <Select
              options={groupOptions}
              placeholder="Tafuta kundi..."
              isSearchable
              value={groupOptions.find(
                item =>
                  item.value ===
                  receiverValue
              )}
              onChange={selected =>
                setReceiverValue(
                  selected?.value || ''
                )
              }
            />
          </div>
        )}

        {receiverType ===
          'individual' && (
          <div className="mt-5">
            <Select
              options={memberOptions}
              placeholder="Tafuta mshirika..."
              isSearchable
              value={memberOptions.find(
                item =>
                  item.value ===
                  receiverValue
              )}
              onChange={selected =>
                setReceiverValue(
                  selected?.value || ''
                )
              }
            />
          </div>
        )}
      </div>

      {/* MESSAGE CARD */}
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

      <h2 className="mb-4 text-lg font-semibold">
        Andika Ujumbe
      </h2>

<textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={8}
  placeholder="Andika ujumbe wako hapa..."
  className="
    block
    w-full
    min-w-0
    max-w-full
    resize-y
    overflow-y-auto
    overflow-x-hidden
    break-words
    whitespace-pre-wrap
    rounded-2xl
    border border-gray-300
    p-4
    box-sizing-border-box
    focus:border-blue-500
    focus:outline-none
    focus:ring-4
    focus:ring-blue-100
  "
/>

        <div className="mt-3 flex justify-between text-sm text-gray-500">
          <span>
            {smsLength} herufi
          </span>

          <span>
            SMS {smsCount}
          </span>
        </div>

      </div>

      {/* PREVIEW */}
      {message && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <h2 className="mb-4 text-lg font-semibold">
            Hakiki ya Ujumbe
          </h2>

          <div className="whitespace-pre-wrap rounded-2xl bg-gray-50 p-4">
            {message}
          </div>

        </div>
      )}

      {/* SEND BUTTON */}
<button
  onClick={handleSend}
  disabled={loading}
  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1e293b] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#334155] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
>
  <FiSend className="text-xl" />

  {loading
    ? 'Inatuma...'
    : `Tuma Ujumbe (${smsCount} SMS)`}
</button>

    </div>
  );
}