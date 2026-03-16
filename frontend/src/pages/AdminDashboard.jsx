import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ItemCard from '../components/ItemCard';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const AdminDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [logins, setLogins] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState({ studentId: '', department: 'IT' });
  const [itemFilter, setItemFilter] = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studentsRes, loginsRes, itemsRes] = await Promise.all([
        adminApi.getStudents(),
        adminApi.getLoginActivity(80),
        adminApi.getItems('all')
      ]);
      setStudents(studentsRes.data.students || []);
      setLogins(loginsRes.data.logins || []);
      setItems(itemsRes.data.items || []);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.studentId.trim()) {
      toast.error('Student ID is required');
      return;
    }
    try {
      const response = await adminApi.addStudent({
        studentId: studentForm.studentId,
        department: studentForm.department
      });
      if (response.data.success) {
        toast.success('Student added to dataset');
        setStudents(prev => [response.data.student, ...prev]);
        setStudentForm({ studentId: '', department: studentForm.department });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add student');
    }
  };

  const toggleStudent = async (student) => {
    try {
      const response = await adminApi.toggleStudent(student._id, !student.active);
      if (response.data.success) {
        setStudents(prev =>
          prev.map(s => (s._id === student._id ? response.data.student : s))
        );
        toast.success('Student status updated');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update student');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm('Delete this item permanently?')) {
      return;
    }
    try {
      const response = await adminApi.deleteItem(item.itemType, item._id);
      if (response.data.success) {
        setItems(prev => prev.filter(i => i._id !== item._id));
        toast.success('Item deleted');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    if (itemFilter === 'all') return true;
    return item.itemType === itemFilter;
  });

  const statusBadge = (status) => {
    if (status === 'success') return 'badge-success';
    if (status === 'deactivated') return 'badge-warning';
    return 'badge-error';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-600 mt-2">
            Manage student access, monitor logins, and review AI-flagged posts
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['students', 'activity', 'moderation'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab === 'students' && 'Student Dataset'}
              {tab === 'activity' && 'Login Activity'}
              {tab === 'moderation' && 'Moderation'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
            />
          </div>
        ) : (
          <>
            {activeTab === 'students' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Add Student
                  </h2>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={studentForm.studentId}
                        onChange={(e) =>
                          setStudentForm(prev => ({ ...prev, studentId: e.target.value }))
                        }
                        className="input"
                        placeholder="e.g., 23uit003"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={studentForm.department}
                        onChange={(e) =>
                          setStudentForm(prev => ({ ...prev, department: e.target.value }))
                        }
                        className="input"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full btn-primary">
                      Add Student
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Student Dataset
                    </h2>
                    <button onClick={fetchAll} className="btn-ghost text-sm">
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[480px] overflow-auto">
                    {students.map(student => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{student.studentId}</p>
                          <p className="text-sm text-gray-500">{student.department}</p>
                        </div>
                        <button
                          onClick={() => toggleStudent(student)}
                          className={`btn text-sm ${
                            student.active ? 'btn-secondary' : 'btn-primary'
                          }`}
                        >
                          {student.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <p className="text-gray-500 text-sm">No students in dataset yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Login Activity</h2>
                  <button onClick={fetchAll} className="btn-ghost text-sm">
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Student ID</th>
                        <th className="py-2">Department</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logins.map((log) => (
                        <tr key={log._id} className="border-t border-gray-100">
                          <td className="py-2 text-gray-900">{log.studentId}</td>
                          <td className="py-2 text-gray-600">{log.department}</td>
                          <td className="py-2">
                            <span className={`badge ${statusBadge(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {logins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-gray-500">
                            No login activity yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setItemFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      itemFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={() => setItemFilter('lost')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      itemFilter === 'lost'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Lost Items
                  </button>
                  <button
                    onClick={() => setItemFilter('found')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      itemFilter === 'found'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Found Items
                  </button>
                </div>

                {filteredItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item._id} className="relative">
                        <ItemCard
                          item={item}
                          type={item.itemType}
                          showActions
                          canDelete={item.aiLabel === 'suspected'}
                          onDelete={() => handleDeleteItem(item)}
                        />
                        <div className="mt-3 text-sm text-gray-600">
                          <span className={`badge ${item.aiLabel === 'suspected' ? 'badge-warning' : 'badge-success'}`}>
                            {item.aiLabel === 'suspected' ? 'AI Suspected' : 'Likely Real'}
                          </span>
                          <span className="ml-2">
                            Score: {Math.round((item.aiProbability || 0) * 100)}%
                          </span>
                          {item.aiLabel !== 'suspected' && (
                            <span className="ml-2 text-xs text-gray-500">
                              Deletion locked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center text-gray-500">
                    No items found for moderation.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
