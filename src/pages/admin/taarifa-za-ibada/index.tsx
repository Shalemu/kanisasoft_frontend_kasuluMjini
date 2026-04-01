'use client';

import { useState } from 'react';
import { FaPlus, FaListAlt, FaChartLine, FaChurch } from 'react-icons/fa';

import Mahudhurio from './components/mahudhurio';
import RipotiYaIbada from './components/RipotiYaIbada';
import OngezaTaarifaZaIbada from './components/OngezaTaarifaZaIbada';

type TabType = 'taarifa' | 'ripoti' | 'ongeza';

export default function TaarifaZaIbadaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('taarifa');

  const menuItems = [
    { key: 'taarifa' as TabType, label: 'Taarifa za Ibada', icon: <FaListAlt /> },
    { key: 'ongeza' as TabType, label: 'Ongeza Taarifa', icon: <FaPlus /> },
    { key: 'ripoti' as TabType, label: 'Ripoti', icon: <FaChartLine /> },

  ];

  return (
    <div className="flex w-full min-h-[calc(100vh-8rem)] bg-slate-100 rounded-2xl overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white hidden md:flex md:flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
              <FaChurch className="text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Ibada</h2>
              <p className="text-xs text-blue-200 uppercase">Taarifa za Ibada</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 flex-1">
          <nav className="space-y-2">
            {menuItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center justify-between rounded-md px-4 py-3 transition ${
                    isActive ? 'bg-blue-800 shadow' : 'text-blue-100 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-white overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0b3d2f]">Taarifa za Ibada</h1>
          <p className="text-sm text-gray-500">Rekodi huduma, mahudhurio na sadaka</p>
        </div>

        {/* Tab Buttons for Add Form (inside OngezaTaarifaZaIbada) */}
        {activeTab === 'ongeza' ? (
          <OngezaTaarifaZaIbada />
        ) : activeTab === 'taarifa' ? (
          <Mahudhurio />
        ) : (
          <RipotiYaIbada />
        )}
      </main>
    </div>
  );
}