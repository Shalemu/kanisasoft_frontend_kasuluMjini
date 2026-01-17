'use client';

import { useState } from 'react';
import Mchango from './components/OngezaMchango';
import Ripoti from './components/Ripoti';
import AssetsScreen from './components/AssetsScreen';

type Tab = 'form' | 'report' | 'assets';

export default function FedhaTab() {
  const [activeTab, setActiveTab] = useState<Tab>('form');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar / Tab Menu */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">Sehemu za Fedha</div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'form'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('form')}
            >
              ➕ <span className="hidden md:inline">Ongeza Mchango</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'assets'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('assets')}
            >
              📦 <span className="hidden md:inline">Mali</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'report'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('report')}
            >
              📊 <span className="hidden md:inline">Ripoti</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {activeTab === 'form' && <Mchango />}
        {activeTab === 'assets' && <AssetsScreen />}
        {activeTab === 'report' && <Ripoti />}
      </main>
    </div>
  );
}
