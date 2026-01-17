'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  // Wait for router query to be ready and get email from URL
  useEffect(() => {
    if (router.isReady) {
      const searchParams = new URLSearchParams(window.location.search);
      setEmail(searchParams.get('email') || '');
    }
  }, [router.isReady]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !passwordConfirmation) {
      toast.warning('Jaza neno la siri na uthibitisho.');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Manenosiri hayalingani.');
      return;
    }

    setLoading(true);

    try {
      // Send request to backend
      const data = await apiFetch('/reset-password', {
        method: 'POST',
        body: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      toast.success(data.message || 'Nenosiri limebadilishwa kwa mafanikio.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Tatizo la mfumo. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Badilisha Neno la Siri | FPCT Kurasini</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] text-white">
          <h2 className="text-2xl font-bold mb-2 text-center">Badilisha Neno la Siri</h2>
          <p className="text-gray-300 text-sm mb-6 text-center">
            Ingiza neno jipya la siri kwa akaunti yako.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Neno jipya la siri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d314b] text-white rounded-lg focus:outline-none placeholder-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Thibitisha neno jipya la siri"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d314b] text-white rounded-lg focus:outline-none placeholder-gray-400"
              required
            />

            <button
              type="submit"
              disabled={loading || !email} // only disable if email not available
              className="w-full py-3 bg-[#f0ce32] rounded-lg font-semibold text-black shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              {loading ? 'Inapakia...' : 'Badilisha Neno la Siri'}
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
