import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import ActivityHistory from '../components/ActivityHistory';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    priority: 'MEDIUM',
    status: 'PENDING'
  });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events', {
        params: {
          type: 'TASK'
        }
      });
      
      const transformedTasks = response.data
        .filter(event => event.type === 'TASK')
        .map(task => ({
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          type: 'TASK',
          start: new Date(task.start),
          end: new Date(task.end),
          dueDate: format(new Date(task.start), "yyyy-MM-dd'T'HH:mm"),
          priority: task.priority || 'MEDIUM',
          status: task.status || 'PENDING'
        }));
      
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to load tasks: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await api.get('/activities');
        console.log('Loaded activities:', response.data);
        setActivities(response.data);
      } catch (error) {
        console.error('Error loading activities:', error);
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(`Failed to load activities: ${errorMessage}`);
      }
    };

    loadActivities();
  }, []);

  const recordActivity = async (type, task) => {
    try {
      console.log('Recording activity for task:', task);
      
      // Create a clean task data object
      const taskData = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        priority: task.priority || 'MEDIUM',
        status: task.status || 'PENDING',
        start: task.start,
        end: task.end
      };
      
      console.log('Prepared taskData:', taskData);
      
      const activity = {
        type,
        taskTitle: task.title,
        taskData
      };
      
      console.log('Sending activity:', activity);
      const response = await api.post('/activities', activity);
      console.log('Activity response:', response.data);
      
      // Update activities state with the taskData directly
      const newActivity = {
        ...response.data,
        taskData: response.data.taskData ? response.data.taskData : null
      };
      
      console.log('New activity with taskData:', newActivity);
      setActivities(current => [newActivity, ...current]);
    } catch (error) {
      console.error('Error recording activity:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to record activity: ${errorMessage}`);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        status: 'COMPLETED'
      };

      await api.put(`/events/${taskId}`, updatedTask);
      
      // Update local state
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        )
      );

      // Record the activity with task data
      await recordActivity('TASK_COMPLETED', { ...task, status: 'COMPLETED' });
    } catch (error) {
      console.error('Error completing task:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to complete task: ${errorMessage}`);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        await api.delete(`/events/${taskId}`);
        await recordActivity('TASK_DELETED', task);
        
        // Update local state
        setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(`Failed to delete task: ${errorMessage}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        type: 'TASK',
        start: new Date(newTask.dueDate).toISOString(),
        end: new Date(newTask.dueDate).toISOString(),
      };

      if (editingTask) {
        // Update existing task
        await api.put(`/events/${editingTask.id}`, taskData);
        
        const updatedTask = {
          ...editingTask,
          ...taskData,
          id: editingTask.id,
          start: new Date(taskData.start),
          end: new Date(taskData.end),
          dueDate: newTask.dueDate,
        };

        setTasks(currentTasks =>
          currentTasks.map(task =>
            task.id === editingTask.id ? updatedTask : task
          )
        );

        // Record edit activity with task data
        await recordActivity('TASK_EDITED', updatedTask);
      } else {
        // Create new task
        const response = await api.post('/events', taskData);
        const createdTask = {
          id: response.data.id,
          ...taskData,
          start: new Date(taskData.start),
          end: new Date(taskData.end),
        };
        
        setTasks(currentTasks => [...currentTasks, createdTask]);
        
        // Record create activity with task data
        await recordActivity('TASK_CREATED', createdTask);
      }

      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        priority: 'MEDIUM',
        status: 'TODO'
      });
      setEditingTask(null);
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to save task: ${errorMessage}`);
    }
  };

  const handleRestoreTask = async (taskData) => {
    try {
      console.log('Tasks.jsx - Restoring task with data:', taskData);
      
      // Create a new task from the stored data
      const newTaskData = {
        title: taskData.title,
        description: taskData.description || '',
        type: 'TASK',
        start: new Date(taskData.dueDate || new Date()).toISOString(),
        end: new Date(taskData.dueDate || new Date()).toISOString(),
        priority: taskData.priority || 'MEDIUM',
        status: 'PENDING' // Always restore as pending
      };

      console.log('Tasks.jsx - Created newTaskData:', newTaskData);

      // Create the task
      const response = await api.post('/events', newTaskData);
      console.log('Tasks.jsx - API response:', response.data);

      const createdTask = {
        id: response.data.id,
        ...newTaskData,
        start: new Date(newTaskData.start),
        end: new Date(newTaskData.end),
        dueDate: taskData.dueDate || format(new Date(), "yyyy-MM-dd'T'HH:mm")
      };
      
      console.log('Tasks.jsx - Final createdTask:', createdTask);
      
      // Update local state
      setTasks(currentTasks => [...currentTasks, createdTask]);
      
      // Record activity
      await recordActivity('TASK_CREATED', createdTask);
      
      toast.success('Task restored successfully!');
    } catch (error) {
      console.error('Error restoring task:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to restore task: ${errorMessage}`);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Please log in to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setNewTask({
              title: '',
              description: '',
              dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              priority: 'MEDIUM',
              status: 'PENDING'
            });
            setShowTaskModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks yet. Click 'Add Task' to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => {
                if (!task.id) {
                  console.warn('Task missing id in render:', task);
                  return null;
                }
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.title || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(task.start, 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(task.status)}`}>
                        {task.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setNewTask({
                            title: task.title || '',
                            description: task.description || '',
                            dueDate: format(task.start, "yyyy-MM-dd'T'HH:mm"),
                            priority: task.priority || 'MEDIUM',
                            status: task.status || 'PENDING'
                          });
                          setShowTaskModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                      priority: 'MEDIUM',
                      status: 'PENDING'
                    });
                  }}
                  className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mt-8">
        <ActivityHistory 
          activities={activities} 
          onRestoreTask={handleRestoreTask}
        />
      </div>
    </div>
  );
};

export default Tasks;
