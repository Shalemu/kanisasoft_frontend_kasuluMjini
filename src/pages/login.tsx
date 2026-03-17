'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Tafadhali jaza taarifa zote.');
      return;
    }

    setLoading(true);

    try {
      // Send login request
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = data;

      // Pending approval
      if (!user?.role) {
        toast.warning(
          data.message ||
            'Asante kwa kujisajili. Maombi yako yanahitaji kuidhinishwa na uongozi wa kanisa. Tutakujulisha mara tu utakapokubalika.'
        );
        return;
      }

      // Login failure
      if (!token || !user?.id) {
        toast.error('Login haikufanikiwa. Hakikisha taarifa zako.');
        return;
      }

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_id', user.id.toString());

      // Redirect based on role
      const role = user.role?.toLowerCase().trim();
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        katibu: '/katibu',
        'mtunza hazina': '/treasurer',
        mchungaji: '/mchungaji',
        kiongozi: '/group-leader',
        mshirika: '/member',
      };

      const redirect = redirectMap[role || ''];
      if (redirect) {
        router.push(redirect);
      } else {
        toast.warning(`Hujapangiwa jukumu "${user.role}".`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tatizo la mfumo. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ingia | FPCT Mahali Pamoja</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md bg-gradient-to-br from-[#130728] via-[#211a45] to-[#253266] rounded-3xl shadow-2xl border border-white/10 p-8 text-white">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-[#f0ce32] rounded-full p-3">
              <span className="text-black font-bold text-xl">JINA LA KANISA</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-center"> Mfumo wa Usimamizi wa Kanisa</h2>
            <p className="text-sm text-gray-300 text-center mt-2">
              Karibu katika mfumo wa taarifa za washirika, wageni, fedha, matukio na uongozi wa kanisa.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email ya mtumiaji"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d314b] text-white rounded-lg focus:outline-none placeholder-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Neno la siri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d314b] text-white rounded-lg focus:outline-none placeholder-gray-400"
              required
            />

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[#f0ce32] hover:underline">
                Umesahau neno la siri?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f0ce32] rounded-lg font-semibold text-black shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              {loading ? 'Inapakia...' : 'INGIA KWENYE MFUMO'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-300">
              Huna akaunti?{' '}
              <Link href="/register" className="text-[#f0ce32] underline font-medium">
                Jisajili hapa
              </Link>
            </p>
            <Link href="/" className="text-sm font-medium text-[#f0ce32] hover:underline">
              ← Rudi Nyumbani
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
