'use client';

import { useState } from 'react';
import Washirika from './components/Washirika';
import Waliopotea from './components/Waliopotea';
import OngezaWashirika from './components/OngezaWashirika';

export default function WashirikaPage() {
  const [activeTab, setActiveTab] = useState<'washirika' | 'waliopotea'>('washirika');
  const [view, setView] = useState<'list' | 'ongeza'>('list');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar / Top Tab Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 text-sm font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">Sehemu za Washirika</div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'washirika'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('washirika');
                setView('list');
              }}
            >
              👥 <span className="hidden md:inline">Washirika</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'waliopotea'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('waliopotea');
                setView('list');
              }}
            >
              🗃 <span className="hidden md:inline">Waliopotea</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {view === 'ongeza' && <OngezaWashirika onBack={() => setView('list')} />}
        {view === 'list' && activeTab === 'washirika' && <Washirika onAddNew={() => setView('ongeza')} />}
        {view === 'list' && activeTab === 'waliopotea' && <Waliopotea />}
      </main>
    </div>
  );
}
