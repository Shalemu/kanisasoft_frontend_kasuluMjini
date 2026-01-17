'use client';

import { useState } from 'react';
import MakundiYanguTab from './components/MakundiYanguTab';
import GroupMembersScreen from './components/GroupMembersScreen';

export default function MakundiPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');

  const handleBack = () => {
    setSelectedGroupId(null);
    setSelectedGroupName('');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-100 text-sm">
      {/* Sidebar or Top Bar */}
      <aside className="w-full md:w-64 bg-[#e6f0fa] text-gray-800 border-b md:border-b-0 md:border-r border-gray-300">
        <div className="p-4 md:p-6 font-semibold">
          <div className="text-blue-800 text-xs uppercase tracking-widest mb-2 md:mb-4">MAKUNDI</div>
          <ul className="flex md:flex-col gap-2">
            <li
              className={`flex-1 md:flex-none px-4 py-2 rounded cursor-pointer flex items-center justify-center md:justify-start gap-2 ${
                !selectedGroupId ? 'bg-white text-blue-700 shadow' : 'hover:bg-white hover:text-blue-600'
              }`}
              onClick={() => {
                setSelectedGroupId(null);
              }}
            >
              <span className="text-base">👥</span>
              <span className="hidden md:inline">Orodha ya Makundi</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white overflow-auto">
        {selectedGroupId ? (
          <GroupMembersScreen
            groupId={selectedGroupId}
            groupName={selectedGroupName}
            onBack={handleBack}
          />
        ) : (
          <MakundiYanguTab
            onGroupSelect={(id: number, name: string) => {
              setSelectedGroupId(id);
              setSelectedGroupName(name);
            }}
          />
        )}
      </main>
    </div>
  );
}
