'use client';

import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

interface EventType {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  description?: string;
}

interface Group {
  id: number;
  name: string;
}

export default function OrodhaYaMatukio() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.status === 'success') setEvents(data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.status === 'success') setGroups(data.groups);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  // Filter and sort: Upcoming events on top
  const filteredEvents = [...events]
    .filter((event) => {
      const matchSearch = event.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      // Earlier dates (upcoming) first
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

  const openModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  return (
    <div
      className="min-h-screen w-full py-10 px-2 md:px-6"
      style={{
        background:
          'linear-gradient(120deg, #f0f7ff 0%, #e9eafc 60%, #f4f9fa 100%)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-sky-600 to-indigo-900 drop-shadow-xl tracking-tight mb-2">
            📋 Orodha ya Matukio
          </h2>
          <p className="text-base md:text-lg text-slate-500 font-medium">
            Jiunge na matukio yetu ya hivi karibuni. Angalia, tafuta na uchague kwa urahisi.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-3 text-indigo-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tafuta jina la tukio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base border border-slate-200 shadow-lg bg-white/60 backdrop-blur-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-base bg-white/60 backdrop-blur-md text-slate-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          >
            <option value="All">Aina zote</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center text-slate-400 italic py-24 text-lg font-medium">
          Hakuna matukio yaliyopatikana.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group flex flex-col justify-between border border-slate-100 rounded-3xl p-7 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400 transition-all duration-200 cursor-pointer ring-1 ring-slate-200"
              style={{
                background:
                  'linear-gradient(125deg, #fff 60%, #f0f7ff 100%)',
              }}
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-indigo-800 group-hover:text-indigo-900 transition">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-base text-slate-700">
                  <span className="inline-flex items-center px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs mr-2">
                    <FaCalendarAlt className="mr-1 text-indigo-400" />
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {event.time && (
                    <span className="inline-flex items-center px-2 py-1 rounded-xl bg-sky-50 text-sky-700 font-semibold text-xs mr-2">
                      <FaClock className="mr-1 text-sky-400" />
                      {event.time}
                    </span>
                  )}
                  {event.location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs">
                      <FaMapMarkerAlt className="mr-1 text-emerald-400" />
                      {event.location}
                    </span>
                  )}
                </div>
                <div className="inline-block px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-indigo-100 to-sky-100 text-indigo-800 rounded-full mt-2 shadow-inner">
                  {event.category}
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => openModal(event)}
                  className="w-full bg-gradient-to-tr from-indigo-600 to-sky-400 hover:from-indigo-700 hover:to-sky-500 text-white py-2.5 rounded-xl text-base font-semibold shadow-lg transition"
                >
                  Angalia Zaidi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white/80 backdrop-blur-lg max-w-md w-full rounded-3xl shadow-2xl p-8 space-y-6 border-2 border-sky-100 relative">
              <Dialog.Title className="text-2xl font-bold text-indigo-900 mb-2">
                {selectedEvent.title}
              </Dialog.Title>
              <div className="space-y-3 text-base text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs mr-2">
                    <FaCalendarAlt className="mr-1 text-indigo-400" />
                    {new Date(selectedEvent.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {selectedEvent.time && (
                    <span className="inline-flex items-center px-2 py-1 rounded-xl bg-sky-50 text-sky-700 font-semibold text-xs mr-2">
                      <FaClock className="mr-1 text-sky-400" />
                      {selectedEvent.time}
                    </span>
                  )}
                  {selectedEvent.location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs">
                      <FaMapMarkerAlt className="mr-1 text-emerald-400" />
                      {selectedEvent.location}
                    </span>
                  )}
                </div>
                <div className="text-xs inline-block bg-sky-100 text-sky-800 px-4 py-1 rounded-full font-bold">
                  {selectedEvent.category}
                </div>
                {selectedEvent.description && (
                  <div className="pt-4 text-slate-600 border-t border-slate-100">
                    <strong className="block mb-2 text-indigo-700">Maelezo ya Tukio:</strong>
                    <p className="text-base">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              <div className="text-right pt-2">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gradient-to-tr from-slate-200 to-indigo-50 hover:from-slate-300 hover:to-indigo-100 rounded-xl text-base text-slate-700 font-bold border-2 border-slate-200 shadow transition"
                >
                  Funga
                </button>
              </div>
            </Dialog.Panel>
          </div>
        )}
      </Dialog>
    </div>
  );
}
