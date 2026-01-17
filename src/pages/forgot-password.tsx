'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warning('Tafadhali ingiza email yako.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/forgot-password', {
        method: 'POST',
        body: { email }, // ✅ apiFetch handles JSON.stringify
      });

      toast.success(
        data.message || 'Kiungo cha kubadilisha nenosiri kimepeanwa kwenye email yako.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Tatizo la mfumo. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Umesahau Neno la Siri | FPCT Kurasini</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] text-white">
          <h2 className="text-2xl font-bold mb-2 text-center">Umesahau Neno la Siri?</h2>
          <p className="text-gray-300 text-sm mb-6 text-center">
            Ingiza email yako hapa chini. Tutakutumia kiungo cha kubadilisha nenosiri.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Email yako"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d314b] text-white rounded-lg focus:outline-none placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f0ce32] rounded-lg font-semibold text-black shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              {loading ? 'Inapakia...' : 'Tuma Kiungo cha Kubadilisha Neno la Siri'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-300">
            <Link href="/login" className="text-[#f0ce32] underline">
              ← Rudi kwenye kuingia
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
