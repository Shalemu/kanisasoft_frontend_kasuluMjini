'use client';

import { useState } from 'react';
import {
  FaListAlt,
  FaCalendarAlt,
  FaChartLine,
  FaBars,
  FaChevronRight,
} from 'react-icons/fa';

import KalendaTab from './components/KalendaTab';
import RipotiTab from './components/RipotiTab';
import OrodhaYaMatukio from './components/OrodhaYaMatukio';
import MatukioYaliyopita from './components/MatukioYaliyopita';

type TabType =
  | 'kalenda'
  | 'orodha'
  | 'matukio_yaliyopita'
  | 'ripoti';

export default function MatukioTab() {
  const [activeTab, setActiveTab] = useState<TabType>('orodha');

  const menuItems = [
    {
      key: 'orodha' as TabType,
      label: 'Orodha ya Matukio',
      icon: <FaListAlt />,
    },
    {
      key: 'matukio_yaliyopita' as TabType,
      label: 'Matukio Yaliyopita',
      icon: <FaListAlt />,
    },
    {
      key: 'kalenda' as TabType,
      label: 'Kalenda',
      icon: <FaCalendarAlt />,
    },
    {
      key: 'ripoti' as TabType,
      label: 'Ripoti',
      icon: <FaChartLine />,
    },
  ];
  

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white shadow-lg hidden md:flex md:flex-col">
        {/* Logo / Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center shadow-md">
              <FaBars className="text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Dashboard</h2>
              <p className="text-xs text-blue-200 uppercase tracking-widest">
                Matukio
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="px-4 py-6 flex-1">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-4 px-2">
            Navigation
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center justify-between rounded-md px-4 py-3 transition-all duration-300
                    ${
                      isActive
                        ? 'bg-blue-800 shadow'
                        : 'hover:bg-white/10 text-blue-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-base ${
                        isActive ? 'text-white' : 'text-blue-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>

                  <FaChevronRight
                    className={`text-xs transition-transform duration-300 ${
                      isActive ? 'rotate-90 text-white' : 'text-blue-300'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="rounded-md bg-white/5 p-4 text-sm text-blue-100">
            <p className="font-semibold">Matukio Dashboard</p>
            <p className="text-xs text-blue-300 mt-1">
              Simamia kalenda, ripoti na matukio yaliyopita.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[calc(100vh-4rem)] p-6 md:p-8">
          {activeTab === 'kalenda' && <KalendaTab />}
          {activeTab === 'orodha' && <OrodhaYaMatukio />}
          {activeTab === 'matukio_yaliyopita' && <MatukioYaliyopita />}
          {activeTab === 'ripoti' && <RipotiTab />}
        </div>
      </main>
    </div>
  );
}