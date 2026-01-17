'use client';

import { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import GroupMembersScreen from './GroupMembersScreen';

interface Group {
  id: number;
  name: string;
}

interface Props {
  onGroupSelect?: (id: number, name: string) => void;
}

export default function MakundiYanguTab({ onGroupSelect }: Props) {
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingGroupId, setViewingGroupId] = useState<number | null>(null);
  const [viewingGroupName, setViewingGroupName] = useState('');

  const fetchMyGroups = async () => {
    try {
      const user = await apiFetch('/mtumiaji');
      const userId = user?.id;
      if (!userId) return;

      const res = await apiFetch('/users');
      if (res.status === 'success') {
        const me = res.users.find((u: any) => u.id === userId);
        setMyGroups(me?.groups || []);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const handleViewGroup = (group: Group) => {
    setViewingGroupId(group.id);
    setViewingGroupName(group.name);
  };

  if (viewingGroupId) {
    return (
      <GroupMembersScreen
        groupId={viewingGroupId}
        groupName={viewingGroupName}
        onBack={() => {
          setViewingGroupId(null);
          setViewingGroupName('');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <main className="flex-1 p-10 bg-gradient-to-tr from-white to-[#f0f4fc]">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers /> Makundi Yangu
          </h2>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center">⏳ Inapakia makundi yako...</p>
        ) : myGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleViewGroup(group)}
                className="bg-white border border-blue-100 p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center"
              >
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-3">
                  <FaUsers size={24} />
                </div>
                <div className="font-semibold text-gray-800 text-lg mb-1">{group.name}</div>
                <div className="text-xs text-gray-500">Gusa kuona washiriki wa kundi</div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic mt-10">
            Hujajiunga na kundi lolote bado.
          </p>
        )}
      </main>
    </div>
  );
}
