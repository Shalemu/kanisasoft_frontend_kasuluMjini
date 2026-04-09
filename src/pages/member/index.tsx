'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';
import {
  ChevronDown as ChevronDownIcon,
   Lock as LockIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  User as UserIcon,
} from 'lucide-react';

// Dynamically import tab components
const tabComponents: Record<string, any> = {
  Mwanzo: dynamic(() => import('./Dashboard')),
  "Taarifa zangu": dynamic(() => import('./taarifa-zangu')),
  Wageni: dynamic(() => import('./wageni')),
  Fedha: dynamic(() => import('./sadaka')),
  Matukio: dynamic(() => import('./matukio')),
  Makundi: dynamic(() => import('./makundi')),
  Viongozi: dynamic(() => import('./viongozi')),
};

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState<string>('Mwanzo');
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

  // Ensure user is mshirika
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user?.role?.toLowerCase() !== 'mshirika') {
      router.push('/login');
    }
  }, [router]);

  // Restore active tab on page load
  useEffect(() => {
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab && navItems.includes(storedTab)) {
      setActiveTab(storedTab);
    }
  }, []);

  // Save active tab when changed
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Una uhakika?',
    text: 'Unataka kutoka kwenye mfumo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ndiyo, toka',
    cancelButtonText: 'Ghairi',
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await apiFetch('/logout', { method: 'POST' });

    await Swal.fire({
      title: 'Umetoka',
      text: 'Umefanikiwa kutoka kwenye mfumo.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.warn('Logout error:', err);

    await Swal.fire({
      title: 'Tahadhari',
      text: 'Kuna tatizo kidogo, lakini umetolewa kwenye kifaa hiki.',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
    });
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

  // Click outside to close settings
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
        <title>{`${activeTab} | Mshirika`}</title>
      </Head>

      <div className="min-h-screen bg-[#f2f4f8] text-gray-800">
<header className="fixed top-0 left-0 w-full bg-[#1e293b] text-white z-50 shadow-md">
  <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
    
    {/* Logo */}
    <div className="flex items-center gap-3 font-bold text-2xl">
      <Image
        src="/KANISASOFT1.png"
        alt="FPCT Logo"
        width={160}
        height={50}
        className="object-contain"
      />
    </div>

    {/* Mobile Menu Button */}
    <button
      className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      <MenuIcon size={24} className="text-white" />
    </button>

    {/* Desktop Nav */}
    <nav className="hidden md:flex items-center gap-3">
      {navItems.map((item) => (
        <button
          key={item}
          onClick={() => setActiveTab(item)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === item
              ? 'bg-white text-[#1e293b] shadow font-semibold'
              : 'text-white hover:bg-[#334155]'
          }`}
        >
          {item}
        </button>
      ))}

      {/* Role Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0f172a] border border-[#1e293b]">
        <UserIcon size={18} className="text-[#f0ce32]" />
        <span className="text-sm font-semibold text-[#f0ce32]">
          Mshirika
        </span>
      </div>

      {/* Settings Dropdown */}
      <div className="relative ml-2" ref={settingsRef}>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0f172a] hover:bg-[#334155] text-white font-medium transition"
        >
          <SettingsIcon size={18} />
          <span>Mpangilio</span>
          <ChevronDownIcon size={16} />
        </button>

        {settingsOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <button
              onClick={() => {
                setSettingsOpen(false);
                setShowPasswordModal(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition"
            >
              <LockIcon size={18} className="text-gray-600" />
              Badilisha Neno la siri
            </button>

            <div className="border-t border-gray-200" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-100 transition"
            >
              <LogOutIcon size={18} />
              Toka
            </button>
          </div>
        )}
      </div>
    </nav>
  </div>

  {/* Mobile Menu */}
  {mobileMenuOpen && (
    <div className="md:hidden bg-[#1e293b] text-white px-6 py-4 space-y-2 shadow-md">
      {navItems.map((item) => (
        <button
          key={item}
          onClick={() => {
            setActiveTab(item);
            setMobileMenuOpen(false);
          }}
          className={`w-full text-left px-4 py-3 rounded-md transition ${
            activeTab === item
              ? 'bg-white text-[#1e293b] font-semibold shadow'
              : 'hover:bg-[#334155]'
          }`}
        >
          {item}
        </button>
      ))}

      {/* Role Badge in Mobile */}
      <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md bg-[#0f172a] shadow-md">
        <UserIcon size={18} className="text-[#f0ce32]" />
        <span className="text-[#f0ce32]">{'Mshirika'}</span>
      </div>

      <div className="border-t border-white/20 pt-3 space-y-2">
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setShowPasswordModal(true);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#334155]"
        >
          <LockIcon size={18} className="text-white" />
          Badilisha Neno la siri
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-500 hover:bg-red-600"
        >
          <LogOutIcon size={18} className="text-white" />
          Toka
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
