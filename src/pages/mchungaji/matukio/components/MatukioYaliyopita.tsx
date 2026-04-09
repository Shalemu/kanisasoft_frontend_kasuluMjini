'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';

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

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function MatukioYaliyopita() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
    fetchGroups();
  }, []);

  const fetchPastEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/past`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.status === 'success') setEvents(data.events);
    } catch (err) {
      console.error('Failed to fetch past events:', err);
    } finally {
      setIsLoading(false);
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

  const filteredEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const matchSearch = event.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
          selectedCategory === 'All' || event.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, search, selectedCategory]);

  // Open modal
  const openModal = (event: EventType, edit = false) => {
    setSelectedEvent({ ...event });
    setIsEditing(edit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  // Delete handler
  const handleDelete = (event: EventType) => {
    Swal.fire({
      title: 'Una uhakika?',
      text: `Tukio "${event.title}" litaondolewa kabisa!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ndiyo, futa!',
      cancelButtonText: 'Hapana',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${event.id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          );
          const data = await res.json();
          if (data.status === 'success') {
            setEvents(events.filter((e) => e.id !== event.id));
            Swal.fire('Imefutwa!', 'Tukio limefutwa kwa mafanikio.', 'success');
          } else {
            Swal.fire('Hitilafu', 'Haikuwezekana kufuta tukio.', 'error');
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Hitilafu', 'Haikuwezekana kufuta tukio.', 'error');
        }
      }
    });
  };

  // Save edited event
  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${selectedEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(selectedEvent),
        }
      );
      const data = await res.json();
      if (data.status === 'success') {
        setEvents(events.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)));
        Swal.fire('Imefanikiwa!', 'Tukio limehifadhiwa.', 'success');
        closeModal();
      } else {
        Swal.fire('Hitilafu', 'Haikuwezekana kuhifadhi tukio.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Hitilafu', 'Haikuwezekana kuhifadhi tukio.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <FaCalendarAlt className="text-3xl text-indigo-600" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Matukio Yaliyopita
          </h2>
        </div>
        <p className="text-slate-500 text-base">
          Angalia matukio yaliyopita, tafuta kwa jina, au chagua aina ya tukio.
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
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-2xl text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Hakuna matukio yaliyopita
          </h3>
          <p className="text-slate-500">
            Hakuna matukio yanayolingana na utafutaji wako.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Tukio lililopita</p>
                  </div>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 whitespace-nowrap">
                    {event.category}
                  </span>
                </div>

                <div className="space-y-3 text-sm flex-1">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                    <FaCalendarAlt className="text-indigo-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-GB')}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                      <FaClock className="text-sky-500" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => openModal(event)}
                    className="flex-1 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition"
                  >
                    Angalia
                  </button>
                  <button
                    onClick={() => openModal(event, true)}
                    className="flex-1 py-2 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-50 text-sm font-medium transition"
                  >
                    Hariri
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="flex-1 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium transition"
                  >
                    Futa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
              <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-slate-800">
                      {isEditing ? 'Hariri Tukio' : selectedEvent.title}
                    </Dialog.Title>
                    {!isEditing && <p className="text-sm text-slate-400 mt-1">Tukio lililopita</p>}
                  </div>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 whitespace-nowrap">
                    {selectedEvent.category}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={selectedEvent.title}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, title: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Jina la Tukio"
                    />
                    <input
                      type="date"
                      value={selectedEvent.date}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, date: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      type="time"
                      value={selectedEvent.time || ''}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, time: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      type="text"
                      value={selectedEvent.location || ''}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, location: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Mahali"
                    />
                    <select
                      value={selectedEvent.category}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, category: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={selectedEvent.description || ''}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, description: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                      rows={4}
                      placeholder="Maelezo ya Tukio"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-slate-700">
                      <FaCalendarAlt className="text-indigo-500" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    {selectedEvent.time && (
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-slate-700">
                        <FaClock className="text-sky-500" />
                        <span>{selectedEvent.time}</span>
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-slate-700">
                        <FaMapMarkerAlt className="text-emerald-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    {selectedEvent.description && (
                      <div className="border-t pt-5">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Maelezo ya Tukio
                        </h4>
                        <p className="text-slate-600 leading-relaxed">{selectedEvent.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                  >
                    Funga
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2 rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium transition"
                    >
                      Hifadhi
                    </button>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        )}
      </Dialog>
    </div>
  );
}