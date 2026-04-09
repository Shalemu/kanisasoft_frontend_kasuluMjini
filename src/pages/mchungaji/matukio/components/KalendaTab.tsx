'use client';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EventType {
  id?: number;
  title: string;
  date: string;
  time?: string;
  description?: string;
  category?: string;
}

interface Group {
  id: number;
  name: string;
}

export default function KalendaTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    category: '',
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        const formattedEvents = data.events.map((e: EventType) => ({
          ...e,
          date: e.date.slice(0, 10),
        }));
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, []);

  const goToPrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEvents = (date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    return events.filter((e) =>
      e.date === dateStr && (selectedCategory === '' || e.category === selectedCategory)
    );
  };

  

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const renderCalendar = () => {
    const rows = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const cols = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > totalDays) {
          cols.push(
            <td key={j} className="border border-gray-300/40 h-28 bg-gray-50 p-1 text-xs"></td>
          );
        } else {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const eventsToday = getEvents(date);

          cols.push(
            <td key={j} className="border border-gray-300/40 h-28 align-top p-1 bg-white text-xs">
              <div className="font-semibold text-gray-800 mb-1">{day}</div>
              <ul className="space-y-1 overflow-y-auto max-h-20 pr-1">
                {eventsToday.map((event, i) => (
                  <li key={i} className="bg-green-100 px-2 py-1 rounded text-green-900 text-xs">
                    {event.time && <span className="font-semibold mr-1">{event.time}</span>}
                    {event.title}
                  </li>
                ))}
              </ul>
            </td>
          );
          day++;
        }
      }
      rows.push(<tr key={i}>{cols}</tr>);
    }

    return rows;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <FaChevronLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h1>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 px-4 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Leo
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm bg-white focus:ring-2 focus:ring-blue-300"
          >
            <option value="">⭯ Filta kwa Kundi</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="table-fixed w-full text-xs min-w-[700px]">
          <thead className="bg-gray-100">
            <tr>
              {days.map((day) => (
                <th key={day} className="border border-gray-300/40 py-2 text-gray-600 font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderCalendar()}</tbody>
        </table>
      </div>


    </div>
  );
}
