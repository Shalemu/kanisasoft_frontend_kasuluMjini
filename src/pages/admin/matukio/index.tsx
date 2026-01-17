'use client';

import { useState } from 'react';
import KalendaTab from './components/KalendaTab';
import RipotiTab from './components/RipotiTab';
import OrodhaYaMatukio from './components/OrodhaYaMatukio';

export default function MatukioTab() {
  const [activeTab, setActiveTab] = useState<'kalenda' | 'orodha' | 'ripoti'>('orodha');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar / Top Tab Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">MATUKIO</div>
          <ul className="flex md:flex-col gap-2">
          <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'orodha'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('orodha')}
            >
              📋 <span className="hidden md:inline">Orodha ya Matukio</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'kalenda'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('kalenda')}
            >
              📅 <span className="hidden md:inline">Kalenda</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'ripoti'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('ripoti')}
            >
              📈 <span className="hidden md:inline">Ripoti</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {activeTab === 'kalenda' && <KalendaTab />}
        {activeTab === 'orodha' && <OrodhaYaMatukio />}
        {activeTab === 'ripoti' && <RipotiTab />}
      </main>
    </div>
  );
}
