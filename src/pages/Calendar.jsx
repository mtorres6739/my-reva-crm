import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    contactId: null,
    description: '',
    type: 'MEETING', // or 'TASK', 'REMINDER'
    priority: 'MEDIUM' // or 'HIGH', 'LOW'
  });
  const { user, token } = useAuth();

  useEffect(() => {
    const loadEvents = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/events');
        const transformedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [token]);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent(prev => ({
      ...prev,
      start,
      end
    }));
    setShowEventModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      start: new Date(event.start),
      end: new Date(event.end),
      type: event.type,
      contactId: event.contactId,
      priority: event.priority || 'MEDIUM'
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = selectedEvent ? {
        ...selectedEvent,
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString()
      } : {
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString()
      };

      if (selectedEvent) {
        await api.put(`/api/events/${selectedEvent.id}`, eventData);
      } else {
        await api.post('/api/events', eventData);
      }

      const savedEvent = await api.get('/api/events');
      if (selectedEvent) {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? { ...savedEvent.data.find(event => event.id === selectedEvent.id), start: new Date(savedEvent.data.find(event => event.id === selectedEvent.id).start), end: new Date(savedEvent.data.find(event => event.id === selectedEvent.id).end) } : event
        ));
      } else {
        setEvents([...events, { ...savedEvent.data[savedEvent.data.length - 1], start: new Date(savedEvent.data[savedEvent.data.length - 1].start), end: new Date(savedEvent.data[savedEvent.data.length - 1].end) }]);
      }

      setShowEventModal(false);
      setSelectedEvent(null);
      setNewEvent({
        title: '',
        start: new Date(),
        end: new Date(),
        contactId: null,
        description: '',
        type: 'MEETING',
        priority: 'MEDIUM'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents(events.filter(event => event.id !== eventId));
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const getEventStyle = (event) => {
    let style = 'p-2 rounded-lg text-sm';
    
    switch (event.type) {
      case 'MEETING':
        return `${style} bg-blue-100 text-blue-800 border border-blue-300`;
      case 'TASK':
        const priorityColors = {
          HIGH: 'bg-red-100 text-red-800 border border-red-300',
          MEDIUM: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
          LOW: 'bg-green-100 text-green-800 border border-green-300'
        };
        return `${style} ${priorityColors[event.priority] || priorityColors.MEDIUM}`;
      case 'REMINDER':
        return `${style} bg-purple-100 text-purple-800 border border-purple-300`;
      default:
        return `${style} bg-gray-100 text-gray-800 border border-gray-300`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Please log in to view the calendar.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading calendar: {error}
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setNewEvent({
              title: '',
              start: new Date(),
              end: new Date(),
              contactId: null,
              description: '',
              type: 'MEETING',
              priority: 'MEDIUM'
            });
            setShowEventModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Event
        </button>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        eventPropGetter={(event) => ({
          className: getEventStyle(event)
        })}
        style={{ height: 'calc(100vh - 250px)' }}
      />

      {/* Modal Backdrop */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          {/* Modal Content */}
          <div className="bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {selectedEvent ? 'Edit Event' : 'New Event'}
            </h2>
            <form className="space-y-4" onSubmit={handleEventSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start</label>
                  <input
                    type="datetime-local"
                    value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End</label>
                  <input
                    type="datetime-local"
                    value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="MEETING">Meeting</option>
                  <option value="TASK">Task</option>
                  <option value="REMINDER">Reminder</option>
                </select>
              </div>

              {newEvent.type === 'TASK' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {selectedEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
