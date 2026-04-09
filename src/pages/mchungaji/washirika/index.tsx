'use client';

import { useState } from 'react';
import { FaUsers, FaBox, FaTimesCircle, FaPlus } from 'react-icons/fa';
import Washirika from './components/Washirika';
import Waliopotea from './components/Waliopotea';
import Waliokataliwa from './components/Waliokataliwa';
import OngezaWashirika from './components/OngezaWashirika';

type TabType = 'washirika' | 'waliopotea' | 'waliokataliwa' | 'ongeza';

export default function WashirikaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('washirika');

  const menuItems = [
    { key: 'washirika' as TabType, label: 'Washirika', icon: <FaUsers /> },
    { key: 'waliopotea' as TabType, label: 'Waliopotea', icon: <FaBox /> },
    { key: 'waliokataliwa' as TabType, label: 'Waliokataliwa', icon: <FaTimesCircle /> },
    { key: 'ongeza' as TabType, label: 'Ongeza Mshirika', icon: <FaPlus /> },
  ];

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-gray-100 rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white hidden md:flex md:flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          {/* <h2 className="font-bold text-lg">Washirika</h2>
          <p className="text-xs text-blue-200 uppercase">Usimamizi wa Washirika</p> */}
        </div>

        <div className="px-4 py-6 flex-1">
          <nav className="space-y-2">
            {menuItems.map((item) => {
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
          <h1 className="text-2xl font-bold text-[#0b3d2f]">Usimamizi wa Washirika</h1>
          <p className="text-sm text-gray-500">
            Angalia washirika, waliopotea, waliokataliwa na ongeza washirika wapya
          </p>
        </div>

        {/* Render the tab content */}
        {activeTab === 'washirika' && <Washirika onAddNew={() => setActiveTab('ongeza')} />}
        {activeTab === 'waliopotea' && <Waliopotea />}
        {activeTab === 'waliokataliwa' && <Waliokataliwa />}
        {activeTab === 'ongeza' && <OngezaWashirika onBack={() => setActiveTab('washirika')} />}
      </main>
    </div>
  );
}