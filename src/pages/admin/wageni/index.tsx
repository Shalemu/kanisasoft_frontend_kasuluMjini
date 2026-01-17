'use client';

import { useState } from 'react';
import { FaUserPlus, FaChartBar } from 'react-icons/fa';
import Wageni from './components/Wageni';
import Takwimu from './components/Takwimu';

export default function WageniTab() {
  const [activeTab, setActiveTab] = useState<'wageni' | 'takwimu'>('wageni');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100">
      {/* Sidebar (vertical on md+, horizontal on mobile) */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 text-sm font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">WAGENI</div>
          <ul className="flex md:flex-col gap-2 md:gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 text-sm ${
                activeTab === 'wageni'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('wageni')}
            >
              <FaUserPlus className="text-base" />
              <span className="hidden md:inline">Wageni</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 text-sm ${
                activeTab === 'takwimu'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('takwimu')}
            >
              <FaChartBar className="text-base" />
              <span className="hidden md:inline">Takwimu</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10">
        {activeTab === 'wageni' ? <Wageni /> : <Takwimu />}
      </main>
    </div>
  );
}
