'use client';

import { useState } from 'react';
import { FaPaperPlane, FaChartBar, FaChartPie } from 'react-icons/fa';
import SendSMSTab from './components/SendSMSTab';
import UjumbeTab from './components/UjumbeTab';
import TakwimuTab from './components/TakwimuTab';

export default function SMS() {
  const [activeTab, setActiveTab] = useState<'sms' | 'ujumbe' | 'takwimu'>('sms');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar or Top Tab Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">SMS</div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'sms'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('sms')}
            >
              <FaPaperPlane className="text-base" />
              <span className="hidden md:inline">Tuma SMS</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'ujumbe'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('ujumbe')}
            >
              <FaChartBar className="text-base" />
              <span className="hidden md:inline">Ujumbe Uliotumwa</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'takwimu'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('takwimu')}
            >
              <FaChartPie className="text-base" />
              <span className="hidden md:inline">Takwimu</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {activeTab === 'sms' ? <SendSMSTab /> : activeTab === 'ujumbe' ? <UjumbeTab /> : <TakwimuTab />}
      </main>
    </div>
  );
}
