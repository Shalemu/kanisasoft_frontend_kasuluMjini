'use client';

import { useEffect, useState } from 'react';
import {
  FaPen, FaCheck, FaTimes, FaSyncAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp, FaUserFriends, FaUsers, FaChurch, FaCoins, FaUserPlus, FaBullhorn
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { startOfWeek, format, addDays, isSameMonth, isSameDay, isWithinInterval, endOfWeek } from 'date-fns';

interface EventType {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  description?: string;
  
}

interface MemberType {
  id: number;

  // add other member fields if needed
}


interface UserType {
  id: number;
  full_name: string;
  role: string | null;
  member?: MemberType;
  // add other fields if you need them
}

export default function DashboardTab() {
  const [member, setMember] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ name: string; amount: number }[]>([]);
  // const [groupsCount, setGroupsCount] = useState<number>(0);
  
const [groupsCount, setGroupsCount] = useState(0);

async function fetchGroups() {
  setGroupsLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();
    if (data.status === 'success') {
      setGroupsCount(data.groups?.length || 0);
    }
  } catch (err) {
    console.error('Failed to fetch groups', err);
  } finally {
    setGroupsLoading(false);
  }
}

  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [verse, setVerse] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempVerse, setTempVerse] = useState('');
  const [verseLoading, setVerseLoading] = useState(false);
  const [verseError, setVerseError] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const ACTIVE_STATUS = 'active';
  const [groupsLoading, setGroupsLoading] = useState(true);
const [membersLoading, setMembersLoading] = useState(true);

  // For weekly filtering
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Announcement strings for the current month
  const announcements = upcomingEvents
    .filter(e => isSameMonth(new Date(e.date), today))
    .slice(0, 10)
    .map(e => `📢 ${e.title} - ${format(new Date(e.date), 'dd MMM yyyy')} ${e.time || ''}`);

  // Weekly contributions chart
  const processChartData = (contributions: any[]) => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(start, i);
      const dayLabel = format(day, 'EEE');
      const total = contributions
        .filter(c => format(new Date(c.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
      return { name: dayLabel, amount: total };
    });
    setChartData(weeklyData);
  };

  // Fetch verse from backend
  const fetchVerse = async () => {
    setVerseLoading(true);
    setVerseError('');
    try {
      const res = await apiFetch('/dashboard-verse');
      if (res.status === 'success') {
        setVerse(res.verse || '');
        setTempVerse(res.verse || '');
      } else {
        setVerse('');
        setTempVerse('');
        setVerseError('Imeshindikana kupakia mstari wa biblia.');
      }
    } catch {
      setVerseError('Tatizo la mtandao. Tafadhali jaribu tena.');
    }
    setVerseLoading(false);
  };

  // Save verse to backend
  const handleSave = async () => {
    if (!tempVerse.trim()) {
      setVerseError('Mstari wa biblia hauwezi kuwa tupu.');
      return;
    }
    setVerseLoading(true);
    setVerseError('');
    try {
      const res = await apiFetch('/dashboard-verse', {
        method: 'POST',
        body: JSON.stringify({ verse: tempVerse.trim() }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 'success') {
        setVerse(res.verse);
        setIsEditing(false);
        setVerseError('');
      } else {
        setVerseError(res.message || 'Imeshindikana kuhifadhi.');
      }
    } catch {
      setVerseError('Tatizo la mtandao. Jaribu tena.');
    }
    setVerseLoading(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchMemberInfo(),
        fetchVisitors(),
        fetchMembers(),
        fetchUpcomingEvents(),
        fetchVerse(),
        fetchGroups(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (member) fetchContributions();
    // eslint-disable-next-line
  }, [member]);

  useEffect(() => {
    if (!showAnnouncements || announcements.length < 2) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [announcements, showAnnouncements]);

  async function fetchMemberInfo() {
    const res = await apiFetch('/mtumiaji/profile');
    if (res.status === 'success' && res.member) {
      setMember(res.member);
      setGroupsCount(res.member.groups?.length || 0);
    }
  }
  async function fetchContributions() {
    const res = await apiFetch('/contributions');
    if (res.status === 'success') {
      const userContributions = res.reports.filter((r: any) => r.user_id === member?.user_id);
      setContributions(userContributions);
      processChartData(userContributions);
    }
  }
  async function fetchVisitors() {
    const res = await apiFetch('/guests');
    if (res.status === 'success') setVisitorCount(res.guests?.length || 0);
  }


async function fetchMembers() {
  setMembersLoading(true);
  try {
    const data = await apiFetch('/users');
    if (data?.users) {
      const users = data.users as any[];
      const activeMembersCount = users.filter(
        (m) =>
          m.role !== 'mchungaji' &&
          (m.membership_status === ACTIVE_STATUS || m.membership_status === null)
      ).length;
      setTotalMembers(activeMembersCount);
    }
  } catch (err) {
    console.error('Failed to fetch members count:', err);
    setTotalMembers(0);
  } finally {
    setMembersLoading(false);
  }
}



  async function fetchUpcomingEvents() {
    const res = await apiFetch('/events');
    if (res.status === 'success') setUpcomingEvents(res.events);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse w-full max-w-2xl">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/2 mx-auto"></div>
          <div className="h-14 bg-gray-200 rounded mb-10"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-28 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const eventsThisMonth = upcomingEvents.filter(e =>
    isSameMonth(new Date(e.date), today)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventsToday = eventsThisMonth.filter(e => isSameDay(new Date(e.date), today));
  const eventsThisWeek = eventsThisMonth.filter(e =>
    !isSameDay(new Date(e.date), today) &&
    isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })
  );
  const eventsRest = eventsThisMonth.filter(e =>
    !isSameDay(new Date(e.date), today) &&
    !isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f5f7fa] to-[#e6ecfa] px-2 md:px-8 py-10 text-gray-900 font-inter">

      {/* ANNOUNCEMENTS */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="relative bg-gradient-to-r from-blue-200/80 to-blue-50/90 border border-blue-200 rounded-2xl p-5 shadow-lg flex flex-col gap-2">
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full shadow-lg"><FaBullhorn /></div>
          <button
            className="text-blue-700 font-extrabold flex items-center justify-center gap-2 mb-1"
            onClick={() => setShowAnnouncements(p => !p)}
          >
            {showAnnouncements ? <FaChevronUp /> : <FaChevronDown />}
            <span className="text-base tracking-wide uppercase">Matangazo & Matukio</span>
          </button>
          {showAnnouncements && (
            <div className="transition-all duration-300 min-h-[28px] flex items-center justify-center">
              <span
                key={announcementIndex}
                className="inline-block w-full text-center text-blue-700 font-medium text-base animate-fadeIn"
                style={{ animation: 'fadeIn 0.6s' }}
              >
                {announcements.length ? announcements[announcementIndex] : '📢 Hakuna matangazo mwezi huu.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: 'Michango Yako',
            icon: <FaCoins className="text-3xl" />,
            value: `TZS ${contributions.reduce((s, r) => s + parseFloat(r.amount || 0), 0).toLocaleString()}`,
            color: 'text-emerald-800'
          },
{
  label: 'Makundi',
  icon: <FaUserFriends className="text-3xl" />,
  value: groupsLoading ? <span className="animate-pulse">...</span> : groupsCount,
  color: 'text-indigo-800'
},



          {
            label: 'Wageni',
            icon: <FaUserPlus className="text-3xl" />,
            value: visitorCount,
            color: 'text-yellow-600'
          },
       {
        label: 'Washirika',
        icon: <FaUsers className="text-3xl" />,
        value: membersLoading ? <span className="animate-pulse">...</span> : totalMembers,
        color: 'text-purple-800'
      }
        ].map((item, i) => (
          <div key={i} className="glass-card relative p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-2xl transition-shadow duration-300 border border-blue-100">
            <div className={`mb-1 ${item.color}`}>{item.icon}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-xs text-gray-500 tracking-wider uppercase">{item.label}</div>
            <div className="absolute right-3 top-3 bg-white/50 rounded-full w-3 h-3 shadow"></div>
          </div>
        ))}
      </div>

      {/* EVENTS + CHART */}
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div className="glass-card bg-white/80 p-8 rounded-3xl shadow-xl border border-blue-100">
          <h2 className="text-lg md:text-xl font-bold mb-5 text-blue-900 flex items-center gap-2">
            <FaCoins className="text-emerald-500" /> Michango Wiki Hii
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={14} />
              <YAxis fontSize={13} />
              <Tooltip />
              <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card bg-white/90 p-8 rounded-3xl shadow-xl border border-blue-100">
          <h2 className="text-lg md:text-xl font-bold mb-5 text-blue-900 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-400" /> Matukio ya Mwezi Huu
          </h2>
          <ul className="space-y-4">
            {eventsToday.length > 0 && (
              <>
                <li className="font-black text-green-600 flex items-center gap-2 text-base"><span className="badge-today">Leo</span></li>
                {eventsToday.map((event) => (
                  <EventCard event={event} key={event.id} today />
                ))}
              </>
            )}
            {eventsThisWeek.length > 0 && (
              <>
                <li className="font-black text-yellow-600 flex items-center gap-2 text-base"><span className="badge-week">Wiki Hii</span></li>
                {eventsThisWeek.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </>
            )}
            {eventsRest.length > 0 && (
              <>
                <li className="font-black text-blue-600 flex items-center gap-2 text-base"><span className="badge-month">Mwezi Huu</span></li>
                {eventsRest.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </>
            )}
            {!eventsThisMonth.length && (
              <li className="text-center text-gray-400 py-3 text-sm">Hakuna matukio mwezi huu.</li>
            )}
          </ul>
        </div>
      </div>

      {/* VERSE */}
      <div className="glass-card bg-gradient-to-br from-blue-50/70 to-emerald-50/60 p-10 rounded-3xl shadow-2xl text-center border border-blue-100 max-w-2xl mx-auto">
        {isEditing ? (
          <div className="flex flex-col items-center gap-4">
            <textarea
              value={tempVerse}
              onChange={(e) => setTempVerse(e.target.value)}
              className="w-full max-w-xl p-3 border border-gray-300 rounded-lg text-center text-lg"
              disabled={verseLoading}
            />
            {verseError && (
              <div className="text-red-500 font-medium text-sm mb-2">{verseError}</div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow"
                disabled={verseLoading}
              >
                <FaCheck /> {verseLoading ? "Inaokoa..." : "Hifadhi"}
              </button>
              <button
                onClick={() => { setIsEditing(false); setTempVerse(verse); setVerseError(''); }}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg font-semibold flex items-center gap-2 border shadow"
                disabled={verseLoading}
              >
                <FaTimes /> Ghairi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <blockquote className="italic text-blue-800 text-lg md:text-xl font-medium border-l-4 border-blue-400 pl-5">
              “{verseLoading ? "Inapakia..." : verse || "—"}”
            </blockquote>
            <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xl ml-2">
              <FaPen />
            </button>
          </div>
        )}
      </div>

      {/* CSS for glass, badges, fadeIn */}
      <style jsx>{`
        .glass-card {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.11);
          backdrop-filter: blur(6px);
          border-radius: 2rem;
          border: 1.5px solid rgba(30,144,255,0.07);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fadeIn { animation: fadeIn 0.5s;}
        .badge-today {
          display: inline-block;
          background: linear-gradient(90deg, #4ade80 20%, #bbf7d0 100%);
          color: #065f46;
          padding: 2px 14px;
          border-radius: 999px;
          font-size: 0.9em;
          font-weight: bold;
          box-shadow: 0 1px 8px #bbf7d044;
        }
        .badge-week {
          display: inline-block;
          background: linear-gradient(90deg, #fde68a 30%, #fef9c3 100%);
          color: #b45309;
          padding: 2px 14px;
          border-radius: 999px;
          font-size: 0.9em;
          font-weight: bold;
          box-shadow: 0 1px 8px #fde68a44;
        }
        .badge-month {
          display: inline-block;
          background: linear-gradient(90deg, #93c5fd 20%, #dbeafe 100%);
          color: #1d4ed8;
          padding: 2px 14px;
          border-radius: 999px;
          font-size: 0.9em;
          font-weight: bold;
          box-shadow: 0 1px 8px #93c5fd44;
        }
      `}</style>
    </div>
  );
}

// EVENT CARD COMPONENT
function EventCard({ event, today = false }: { event: EventType, today?: boolean }) {
  return (
    <li className={`border-l-4 ${today ? 'border-green-500 bg-green-50/60' : 'border-blue-400 bg-blue-50/50'} rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}>
      <h3 className="text-base font-bold flex items-center gap-2 text-gray-900 mb-1">
        <FaCalendarAlt className={today ? "text-green-500" : "text-blue-500"} /> {event.title}
      </h3>
      <div className="text-xs text-gray-700 ml-6 space-y-1">
        <div className="flex items-center gap-2">
          <FaClock /> {format(new Date(event.date), 'EEE, dd MMM yyyy')}{event.time && ` ${event.time}`}
        </div>
        {event.location && <div className="flex items-center gap-2"><FaMapMarkerAlt /> {event.location}</div>}
        {event.description && <div>{event.description}</div>}
      </div>
    </li>
  );
}
