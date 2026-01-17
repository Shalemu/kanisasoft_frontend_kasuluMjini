'use client';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';

const tabComponents: Record<string, any> = {
  Mwanzo: dynamic(() => import('./Dashboard')),
  Washirika: dynamic(() => import('./washirika/')),
  Wageni: dynamic(() => import('./wageni')),
  Fedha: dynamic(() => import('./fedha')),
  SMS: dynamic(() => import('./SMS')),
  Matukio: dynamic(() => import('./matukio')),
  Makundi: dynamic(() => import('./makundi/')),
  Viongozi: dynamic(() => import('./viongozi')),
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Mwanzo');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const navItems = Object.keys(tabComponents);
  const ActiveComponent = tabComponents[activeTab];

  // Load persisted tab on mount
  useEffect(() => {
    const lastTab = localStorage.getItem('activeTab');
    if (lastTab && tabComponents[lastTab]) {
      setActiveTab(lastTab);
    }

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user?.role?.toLowerCase() !== 'katibu') {
      router.push('/login');
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const handleLogout = async () => {
    if (!confirm('Je, una uhakika unataka kutoka?')) return;
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.clear();
      router.push('/login');
    }
  };

  const handlePasswordChange = async () => {
    setFeedback(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback('Tafadhali jaza sehemu zote.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback('Neno la siri jipya halifanani na uthibitisho.');
      return;
    }

    try {
      const res = await apiFetch('/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      if (res.status === 'success') {
        alert('Neno la siri limebadilishwa kikamilifu.');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback(res.message || 'Tatizo limejitokeza.');
      }
    } catch (err) {
      setFeedback('Hitilafu ya mtandao. Tafadhali jaribu tena.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Head>
        <title>{`${activeTab} | Katibu`}</title>
      </Head>

      <div className="min-h-screen bg-[#f2f4f8] text-gray-800">
        {/* Navbar */}
        <header className="fixed top-0 left-0 w-full bg-[#1e293b] text-white z-50 shadow-md">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3 font-bold text-2xl">
              <Image src="/KANISASOFT1.png" alt="FPCT Logo" width={200} height={200} />
              <span className="tracking-wide text-white">SYSTEM ADMIN</span>
            </div>

            {/* Hamburger - Mobile */}
            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center space-x-3 text-[15px] font-medium">
              {navItems.map((item) => (
                <span
                  key={item}
                  onClick={() => handleTabChange(item)}
                  className={`cursor-pointer px-5 py-2 rounded-md transition ${
                    activeTab === item
                      ? 'bg-white text-[#1e293b] font-semibold shadow'
                      : 'text-white hover:bg-slate-700'
                  }`}
                >
                  {item}
                </span>
              ))}

              {/* Settings */}
              <div className="relative ml-4" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="relative px-5 py-2 rounded-md text-white font-semibold bg-[#0f172a] hover:bg-[#334155] transition duration-300 shadow-md"
                >
                  ⚙️ Settings
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-50 text-gray-800 text-[15px] overflow-hidden border border-gray-200">
                    <div className="flex flex-col py-2">
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setShowPasswordModal(true);
                        }}
                        className="px-4 py-3 hover:bg-gray-100 text-left transition"
                      >
                        🔐 Badilisha Neno la siri
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-red-600 hover:bg-red-100 text-left font-semibold"
                      >
                        🚪 Toka
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#1e293b] text-white px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    handleTabChange(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`cursor-pointer px-4 py-3 rounded-md transition ${
                    activeTab === item
                      ? 'bg-white text-[#1e293b] font-semibold shadow'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  {item}
                </div>
              ))}
              <div className="border-t border-white/20 pt-3 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-600 rounded"
                >
                  🔐 Badilisha Neno la siri
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white rounded"
                >
                  🚪 Toka
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="pt-32 px-6 w-full min-h-screen">
          {ActiveComponent ? <ActiveComponent /> : null}
        </main>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Badilisha Neno la siri</h2>
              {feedback && <div className="text-red-600 text-sm mb-2">{feedback}</div>}
              <input
                type="password"
                placeholder="Neno la siri la sasa"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border px-4 py-2 mb-3 rounded"
              />
              <input
                type="password"
                placeholder="Neno la siri jipya"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-4 py-2 mb-3 rounded"
              />
              <input
                type="password"
                placeholder="Thibitisha Neno la siri jipya"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-4 py-2 mb-4 rounded"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:underline"
                >
                  Funga
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-[#1e40af] text-white rounded hover:bg-[#1e3a8a]"
                >
                  Hifadhi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
