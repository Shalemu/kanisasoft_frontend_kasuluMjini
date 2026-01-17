'use client';

import { useEffect, useRef, useState } from 'react';
import { FaSms, FaSpinner } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface User {
  id: number;
  full_name: string;
}

interface Group {
  id: number;
  name: string;
}

export default function SendSMSTab() {
  const [receiverType, setReceiverType] = useState('');
  const [receiverValue, setReceiverValue] = useState('');
  const [message, setMessage] = useState('');

  const [washirika, setWashirika] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (receiverType === 'individual') fetchWashirika();
    if (receiverType === 'group') fetchGroups();
  }, [receiverType]);

  const fetchWashirika = async () => {
    const res = await apiFetch('/users');
    if (res?.users) {
      setWashirika(res.users.map((u: any) => ({ id: u.id, full_name: u.full_name })));
    }
  };

  const fetchGroups = async () => {
    const res = await apiFetch('/groups');
    if (res?.groups) {
      setGroups(res.groups.map((g: any) => ({ id: g.id, name: g.name })));
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredWashirika = washirika.filter((w) =>
    w.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!receiverType || !message) {
      alert('Tafadhali jaza maelezo yote muhimu.');
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch('/send-sms', {
        method: 'POST',
        body: JSON.stringify({
          type: receiverType,
          message,
          receiver: receiverValue,
        }),
      });

      if (res?.status === 'success') {
        alert(`✅ Ujumbe umetumwa kwa jumla ya washirika: ${res.sent}`);
        setMessage('');
        setReceiverValue('');
        setSearchQuery('');
        setGroupQuery('');
      } else {
        alert('⚠️ Tatizo limetokea wakati wa kutuma ujumbe.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Hitilafu imetokea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-sm">
      <main className="flex-1 p-4 sm:p-10 w-full">
        <div className="max-w-screen-md mx-auto space-y-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaSms className="text-blue-600" /> Tuma Ujumbe kwa Washirika
          </h1>

          <div>
            <label className="block font-medium mb-1">Chagua Mpokeaji</label>
            <select
              value={receiverType}
              onChange={(e) => setReceiverType(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2"
            >
              <option value="">-- Chagua --</option>
              <option value="all">Washirika Wote</option>
              <option value="group">Kundi Maalum</option>
              <option value="M">Wanaume</option>
              <option value="F">Wanawake</option>
              <option value="individual">Mshirika Binafsi</option>
            </select>
          </div>

          {receiverType === 'group' && (
            <div className="relative">
              <label className="block font-medium mb-1">Tafuta Kundi</label>
              <input
                ref={inputRef}
                type="text"
                value={groupQuery}
                onChange={(e) => {
                  setGroupQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Andika jina la kundi..."
              />
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow"
                >
                  {filteredGroups.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">Hakuna kundi</div>
                  ) : (
                    filteredGroups.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setReceiverValue(g.name);
                          setGroupQuery(g.name);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {g.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {receiverType === 'individual' && (
            <div className="relative">
              <label className="block font-medium mb-1">Tafuta Mshirika</label>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Andika jina la mshirika..."
              />
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded shadow"
                >
                  {filteredWashirika.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">Hakuna mshirika</div>
                  ) : (
                    filteredWashirika.map((w) => (
                      <div
                        key={w.id}
                        onClick={() => {
                          setReceiverValue(w.full_name);
                          setSearchQuery(w.full_name);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {w.full_name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Ujumbe</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-4 py-2"
              placeholder="Andika ujumbe wako hapa..."
            ></textarea>
          </div>

          <div>
            <button
              onClick={handleSend}
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded flex items-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Inatuma...
                </>
              ) : (
                <>
                  <FaSms /> Tuma Ujumbe
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
