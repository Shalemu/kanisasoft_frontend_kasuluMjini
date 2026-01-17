'use client';
import { useState } from 'react';
import TaarifaZaMsingiTab from './components/TaarifaZanguTab';

export default function TaarifaZanguTab() {
  const [activeTab, setActiveTab] = useState<'msingi'>('msingi');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-6 space-y-4 text-sm font-semibold h-full md:h-screen overflow-y-auto">
          <div className="text-blue-800 text-xs uppercase tracking-widest">Taarifa Zangu</div>
          <ul className="space-y-2">
            <li
              className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
                activeTab === 'msingi'
                  ? 'bg-white text-blue-700 shadow'
                  : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('msingi')}
            >
              <span className="text-lg">📝</span>
              <span>Taarifa zangu</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-white shadow-inner rounded-none md:rounded-xl">
        {activeTab === 'msingi' && <TaarifaZaMsingiTab />}
      </main>
    </div>
  );
}
