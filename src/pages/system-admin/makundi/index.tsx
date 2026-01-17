'use client';

import { useState } from 'react';
import { FaChartBar } from 'react-icons/fa';
import MakundiTab from './components/Makundi';
import RipotiTab from './components/Ripoti';
import GroupMembers from './components/GroupMembers';

export default function MakundiPage() {
  const [activeTab, setActiveTab] = useState<'makundi' | 'ripoti'>('makundi');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleBack = () => setSelectedGroupId(null);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar / Top Tab Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">Sehemu za Makundi</div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'makundi'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('makundi');
                setSelectedGroupId(null);
              }}
            >
              👥 <span className="hidden md:inline">Orodha ya Makundi</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'ripoti'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('ripoti');
                setSelectedGroupId(null);
              }}
            >
              📊 <span className="hidden md:inline">Ripoti</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {activeTab === 'ripoti' ? (
          <RipotiTab />
        ) : selectedGroupId ? (
          <GroupMembers groupId={selectedGroupId} onBack={handleBack} />
        ) : (
          <MakundiTab onGroupSelect={(id) => setSelectedGroupId(id)} />
        )}
      </main>
    </div>
  );
}
