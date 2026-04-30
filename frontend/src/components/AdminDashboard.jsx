import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Activity, Image as ImageIcon, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'students'
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEscalating, setIsEscalating] = useState(false);

  const fetchData = async () => {
    try {
      const [complaintsRes, studentsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/complaints/'),
        fetch('http://127.0.0.1:8000/api/students/')
      ]);
      
      if (!complaintsRes.ok || !studentsRes.ok) throw new Error('Failed to fetch data');
      
      const complaintsData = await complaintsRes.json();
      const studentsData = await studentsRes.json();
      
      setComplaints(complaintsData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // API Call
  useEffect(() => {
    fetchData();
    
    // Task 3: Polling for live updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    
    // Task 3 Emergency Fix: Admin DB Shortcut (Neon)
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'p' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        window.open('https://console.neon.tech/', '_blank');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/escalate/', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to run escalation');
      toast.success('Escalation algorithm run successfully.');
      await fetchData();
    } catch (err) {
      toast.error("Escalation error: " + err.message);
    } finally {
      setIsEscalating(false);
    }
  };

  // Stats Processing
  const totalActive = complaints.length;
  const criticalIssues = complaints.filter(c => c.priority_score >= 8).length;
  // Based on your scenario, we don't have a distinct "resolved" field, defaulting to 0 for display
  const recentlyResolved = 0; 

  // Donut Chart Processing
  const categoryCounts = complaints.reduce((acc, curr) => {
    const category = curr.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  // Automatically sort Triage Table by priority_score (descending)
  const sortedComplaints = [...complaints].sort((a, b) => b.priority_score - a.priority_score);

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium tracking-wide animate-pulse">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }
  if (error) return <div className="min-h-screen p-8 text-center text-red-600 font-medium">Failed to connect: {error}. Check backend status.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">SMART PG</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Warden Dashboard</h1>
            <p className="text-gray-500 mt-2 text-sm">Real-time facility triage & Student Management.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center">
              <button 
                onClick={() => setActiveTab('complaints')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'complaints' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Activity size={16} /> Complaints
              </button>
              <button 
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={16} /> Students & Payments
              </button>
            </div>

            {activeTab === 'complaints' && (
              <button 
                onClick={handleEscalate}
                disabled={isEscalating}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEscalating ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <AlertCircle size={20} />
                )}
                <span>{isEscalating ? 'Escalating...' : 'Run SLA Escalation'}</span>
              </button>
            )}
          </div>
        </header>

        {activeTab === 'complaints' ? (
          <>
            {/* 1. Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Active Complaints</p>
              <p className="text-3xl font-bold text-gray-800 tracking-tight">{totalActive}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-full">
              <AlertCircle size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Critical Issues (Priority 8+)</p>
              <p className="text-3xl font-bold text-gray-800 tracking-tight">{criticalIssues}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-full">
              <CheckCircle size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recently Resolved</p>
              <p className="text-3xl font-bold text-gray-800 tracking-tight">{recentlyResolved}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. Visual Analytics (Donut Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-50 text-center">Complaints by Category</h2>
            <div className="flex-grow w-full min-h-[300px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm font-medium">No chart data available</p>
              )}
            </div>
          </div>

          {/* 3. The Triage Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Triage Table</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide">AUTOMATICALLY SORTED BY PRIORITY</p>
              </div>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold w-24">Urgency</th>
                    <th className="py-4 px-6 font-semibold">Category</th>
                    <th className="py-4 px-6 font-semibold hidden md:table-cell">Description</th>
                      <th className="py-4 px-6 font-semibold">AI Summary</th>
                      <th className="py-4 px-6 font-semibold w-16 text-center">Image</th>
                      <th className="py-4 px-6 font-semibold">Assign Staff</th>
                    <th className="py-4 px-6 font-semibold w-40">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedComplaints.map((complaint) => {
                    const isCritical = complaint.priority_score >= 8;
                    const cat = complaint.category || 'Unknown';
                    const hasImage = !!complaint.image_url;
                    
                    return (
                      <tr 
                        key={complaint.id} 
                        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition duration-150 ${
                          isCritical ? 'bg-red-50 text-red-900 border-l-4 border-red-500' : 'bg-white border-l-4 border-transparent'
                        }`}
                      >
                        <td className="py-4 px-6">
                            <span className={`inline-flex min-w-[36px] items-center justify-center px-2 py-1 rounded-md text-xs font-bold ${
                              isCritical ? 'bg-red-600 text-white shadow-sm' : 
                              complaint.priority_score >= 5 ? 'bg-orange-500 text-white' : 
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {complaint.priority_score}
                            </span>
                        </td>
                        <td className={`py-4 px-6 font-bold tracking-tight ${isCritical ? 'text-red-900' : 'text-gray-800'}`}>
                          {cat}
                        </td>
                        <td className="py-4 px-6 text-gray-600 font-medium hidden md:table-cell max-w-[200px] truncate" title={complaint.description}>
                          {complaint.description}
                        </td>
                                                  <td className="py-4 px-6">
                            <span className="italic text-slate-500 font-medium text-xs">
                              {complaint.ai_summary || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {hasImage ? (
                              <a href={complaint.image_url} target="_blank" rel="noreferrer" className="inline-block p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                                <ImageIcon size={16} />
                              </a>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <select 
                              value={complaint.assigned_staff || 'Unassigned'}
                              onChange={async (e) => {
                                const staff = e.target.value;
                                try {
                                    const res = await fetch(`http://127.0.0.1:8000/api/complaints/${complaint.id}/assign_staff/`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ staff_name: staff })
                                  });
                                  if (res.ok) {
                                    toast.success(`Assigned to ${staff}`);
                                    fetchData();
                                  }
                                } catch(err) {
                                  toast.error('Assignment failed');
                                }
                              }}
                              className="text-xs font-bold bg-white border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                            >
                              <option value="Unassigned">Unassigned</option>
                              <option value="Electrician">Electrician</option>
                              <option value="Plumber">Plumber</option>
                              <option value="Janitor">Janitor</option>
                              <option value="IT Support">IT Support</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-medium text-xs whitespace-nowrap">
                          {complaint.timestamp ? format(new Date(complaint.timestamp), "MMM d, h:mm a") : 'Unknown Date'}
                        </td>
                      </tr>
                    );
                  })}
                  {sortedComplaints.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle size={32} className="text-green-600" />
                          </div>
                          <p className="text-gray-600 font-medium text-lg">All Clear! No active hostel issues right now.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Student Directory & Payment Status</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide">MANAGE PAYMENTS & HOSTEL ALLOTMENT</p>
              </div>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold">Student Name</th>
                    <th className="py-4 px-6 font-semibold">Course & Year</th>
                    <th className="py-4 px-6 font-semibold">Room & Bed</th>
                    <th className="py-4 px-6 font-semibold">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {students.map((student) => {
                    const statusColor = 
                      student.payment_status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      student.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200';

                    return (
                      <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition duration-150">
                        <td className="py-4 px-6 font-bold text-gray-800">{student.name}</td>
                        <td className="py-4 px-6 text-gray-600">{student.course} • Year {student.year}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {student.room ? `Room ${student.room.room_number}` : 'No Room'} 
                          {student.bed ? ` (Bed ${student.bed.bed_number})` : ''}
                        </td>
                        <td className="py-4 px-6">
                          <select 
                            value={student.payment_status || 'Not Paid'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const res = await fetch(`http://127.0.0.1:8000/api/students/${student.id}/update_payment_status/`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ payment_status: newStatus })
                                });
                                if (res.ok) {
                                  toast.success(`Payment status updated to ${newStatus}`);
                                  fetchData();
                                } else {
                                  toast.error('Failed to update status');
                                }
                              } catch(err) {
                                toast.error('Update error: ' + err.message);
                              }
                            }}
                            className={`text-xs font-bold border rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 shadow-sm ${statusColor}`}
                          >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Not Paid">Not Paid</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <p className="text-gray-600 font-medium text-lg">No students found in the system.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

