'use client';

import { useState } from 'react';
import { FaUsers, FaBox, FaTimesCircle, FaPlus } from 'react-icons/fa';

import Washirika from './components/Washirika';
import Waliopotea from './components/Waliopotea';
import Waliokataliwa from './components/Waliokataliwa';
import OngezaWashirika from './components/OngezaWashirika';
import OngezaWatoto from './components/OngezaWatoto';

type TabType =
  | 'washirika'
  | 'waliopotea'
  | 'waliokataliwa'
  | 'ongeza_mshirika'
  | 'ongeza_mtoto';

interface MenuItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
}

export default function WashirikaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('washirika');

  const menuItems: MenuItem[] = [
    { key: 'washirika', label: 'Washirika', icon: <FaUsers /> },
    { key: 'waliopotea', label: 'Waliopotea', icon: <FaBox /> },
    { key: 'waliokataliwa', label: 'Waliokataliwa', icon: <FaTimesCircle /> },
    { key: 'ongeza_mshirika', label: 'Ongeza Mshirika', icon: <FaPlus /> },
    { key: 'ongeza_mtoto', label: 'Ongeza Mtoto', icon: <FaPlus /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'washirika':
        return <Washirika onAddNew={() => setActiveTab('ongeza_mshirika')} />;

      case 'waliopotea':
        return <Waliopotea />;

      case 'waliokataliwa':
        return <Waliokataliwa />;

      case 'ongeza_mshirika':
        return <OngezaWashirika onBack={() => setActiveTab('washirika')} />;

      case 'ongeza_mtoto':
        return <OngezaWatoto onBack={() => setActiveTab('washirika')} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-gray-100 rounded-2xl overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white hidden md:flex md:flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          {/* Optional Header */}
        </div>

        <div className="px-4 py-6 flex-1">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition ${
                    isActive
                      ? 'bg-blue-800 shadow'
                      : 'text-blue-100 hover:bg-white/20'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-white overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0b3d2f]">
            Usimamizi wa Washirika
          </h1>
          <p className="text-sm text-gray-500">
            Angalia washirika, waliopotea, waliokataliwa na ongeza taarifa mpya
          </p>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}