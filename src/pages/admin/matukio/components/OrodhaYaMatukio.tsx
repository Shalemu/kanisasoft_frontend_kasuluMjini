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
  const today = new Date();
  today.setHours(0, 0, 0, 0);


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
    const eventDate = new Date(event.date);
    const matchDate = eventDate >= today;
    const matchSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    return matchDate && matchSearch && matchCategory;
  })
  .sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
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
  <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
    {/* Header */}
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <FaCalendarAlt className="text-3xl text-indigo-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
          Orodha ya Matukio
        </h2>
      </div>
      <p className="text-slate-500 text-base">
        Angalia matukio yajayo, tafuta kwa jina, au chagua aina ya tukio.
      </p>
    </div>

    {/* Search + Filter */}
    <div className="bg-white rounded-2xl shadow-md p-4 mb-8 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tafuta jina la tukio..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none md:w-64"
      >
        <option value="All">Aina zote</option>
        {groups.map((group) => (
          <option key={group.id} value={group.name}>
            {group.name}
          </option>
        ))}
      </select>
    </div>

    {/* Event Cards */}
    {filteredEvents.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-md p-10 text-center text-slate-500">
        Hakuna matukio yaliyopatikana.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800">
                  {event.title}
                </h3>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  {event.category}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-indigo-500" />
                  {new Date(event.date).toLocaleDateString('en-GB')}
                </div>

                {event.time && (
                  <div className="flex items-center gap-2">
                    <FaClock className="text-sky-500" />
                    {event.time}
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {event.location}
                  </div>
                )}
              </div>

              <button
                onClick={() => openModal(event)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
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
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <Dialog.Title className="text-2xl font-bold text-slate-800 mb-4">
              {selectedEvent.title}
            </Dialog.Title>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-500" />
                {new Date(selectedEvent.date).toLocaleDateString('en-GB')}
              </div>

              {selectedEvent.time && (
                <div className="flex items-center gap-2">
                  <FaClock className="text-sky-500" />
                  {selectedEvent.time}
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500" />
                  {selectedEvent.location}
                </div>
              )}

              <div>
                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {selectedEvent.category}
                </span>
              </div>

              {selectedEvent.description && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Maelezo ya Tukio
                  </h4>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
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
