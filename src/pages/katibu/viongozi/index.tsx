'use client';

import { useState } from 'react';
import Waliostaafu from './components/Waliostaafu';
import OrodhaYaViongozi from './components/OrodhaYaViongozi';

export default function ViongoziTab() {
  const [activeTab, setActiveTab] = useState<'orodha' | 'waliostaafu'>('orodha');

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar or Top Tab Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">
            Sehemu za Viongozi
          </div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'orodha'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('orodha')}
            >
              📋 <span className="hidden md:inline">Orodha ya Viongozi</span>
            </li>
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                activeTab === 'waliostaafu'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('waliostaafu')}
            >
              🛡 <span className="hidden md:inline">Waliostaafu</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {activeTab === 'orodha' && <OrodhaYaViongozi />}
        {activeTab === 'waliostaafu' && <Waliostaafu />}
      </main>
    </div>
  );
}
