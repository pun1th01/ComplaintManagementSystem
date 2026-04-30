import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Image as ImageIcon, CheckCircle, Bell, Search, ShieldAlert, Wrench, Wifi, Coffee, Droplets, X, Cpu, Zap, Activity, Clock } from 'lucide-react';

import PaymentModal from './PaymentModal';

export default function StudentDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null); // Track specific bed ID
  const [roomPreferences, setRoomPreferences] = useState({ course: '', year: '', dietary_preference: '', sleep_schedule: '' });
  
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  // Grab logged in user
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const studentName = storedUser?.user?.name || "Student";
  const studentId = storedUser?.user?.id || 1;

  const fetchRooms = () => {
    fetch('http://127.0.0.1:8000/api/rooms/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          setRooms([]);
        }
      })
      .catch(err => {
        console.error(err);
        setRooms([]);
      });
  };

  const fetchMyComplaints = () => {
    fetch('http://127.0.0.1:8000/api/complaints/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter complaints for this student
          const filtered = data.filter(c => c.student === studentId);
          setMyComplaints(filtered);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRooms();
    fetchMyComplaints();
    
    // Poll for updates on complaints every 10 seconds
    const interval = setInterval(() => {
      fetchMyComplaints();
    }, 10000);
    return () => clearInterval(interval);
  }, [studentId]);

  const dummyRooms = useMemo(() => Array.isArray(rooms) ? rooms : [], [rooms]);

  // Derived Notifications from Complaints
  const notifications = useMemo(() => {
    return myComplaints
      .filter(c => c.assigned_staff && c.assigned_staff !== 'Unassigned' && c.status !== 'Resolved')
      .map(c => ({
        id: c.id,
        title: `Technician Dispatched: ${c.category}`,
        message: `Your issue has been assigned to ${c.assigned_staff} and will be solved within 48 HRS. If not, it will be automatically ESCALATED.`,
        time: new Date(c.updated_at || c.timestamp).toLocaleTimeString()
      }));
  }, [myComplaints]);

  const handleFetchRecommendations = () => {
    setIsLoadingRooms(true);
    fetch('http://127.0.0.1:8000/api/get_recommended_rooms/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course: roomPreferences.course,
        year: parseInt(roomPreferences.year) || 1,
        dietary_preference: roomPreferences.dietary_preference,
        sleep_schedule: roomPreferences.sleep_schedule,
        balcony_preference: storedUser?.user?.balcony_preference || false
      })
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setRecommendedRooms(data.map(room => ({
          id: room.id,
          room_number: room.room_number,
          roomNumber: `Room ${room.room_number}`,
          matchScore: Math.round(room.compatibility_score * 5 + 40),
          tags: [room.is_balcony_room ? 'Balcony' : 'No Balcony', `${room.beds.filter(b => !b.student_occupant).length} Beds Left`],
          beds: room.beds,
          occupants: room.current_occupants || []
        })));
        // DO NOT close the modal. Let the right panel update.
        toast.success("AI Matching Complete! See your Recommended Rooms on the right.", { icon: '🤖' });
      } else {
        setRecommendedRooms([]);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setIsLoadingRooms(false));
  };

  const handlePaymentSuccess = () => {
    if (!selectedRoom || !selectedBed) return;

    fetch(`http://127.0.0.1:8000/api/rooms/${selectedRoom}/book_bed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        bed_id: selectedBed
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        toast.error(data.error, { icon: '🛑' });
        setIsPaymentModalOpen(false);
      } else {
        toast.success(`SUCCESS: Bed secured.`, { icon: '✅' });
        setIsPaymentModalOpen(false);
        setIsRoomModalOpen(false);
        fetchRooms();
      }
    })
    .catch(err => {
      toast.error("NETWORK FAILURE: Unable to secure room.", { icon: '🛑' });
      console.error(err);
      setIsPaymentModalOpen(false);
    });
  };

  const handleBookSpecificBed = (room_id, bed_id) => {
    fetch(`http://127.0.0.1:8000/api/rooms/${room_id}/book_bed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        bed_id: bed_id
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        toast.error(data.error, { icon: '🛑' });
      } else {
        toast.success(`SUCCESS: Bed secured.`, { icon: '✅' });
        fetchRooms();
        handleFetchRecommendations();
      }
    })
    .catch(err => console.error(err));
  };

  const notices = [
    {
      id: 1,
      title: 'Water Supply Maintenance',
      date: 'April 30, 2026',
      description: 'Water supply lines offline 10:00 AM to 2:00 PM for maintenance.',
      icon: <Droplets size={20} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Special Dinner Menu',
      date: 'May 1, 2026',
      description: 'Special dinner feast on occasion of foundation day!',
      icon: <Coffee size={20} />,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImage(null);
    setImagePreview(null);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!title.trim() || !description.trim() || !category) {
      toast.error("INPUT REQUIRED: Missing parameters.", { icon: '🛑' });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('student', studentId); // Important for tying complaint to student
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints/', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 201 || response.ok) {
        toast.success('SUCCESS: Complaint registered successfully.', { icon: '✅' });
        clearForm();
        fetchMyComplaints();
      } else {
        toast.error('FAILED: Server rejected data.', { icon: '🛑' });
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('NETWORK ERROR: Server unreachable.', { icon: '🛑' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = (complaintId) => {
    fetch(`http://127.0.0.1:8000/api/complaints/${complaintId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    })
    .then(res => {
      if (res.ok) {
        toast.success("SUCCESS: Ticket closed successfully.", { icon: '✅' });
        fetchMyComplaints();
      } else {
        toast.error("FAILED: Could not close ticket.", { icon: '🛑' });
      }
    })
    .catch(err => {
      console.error(err);
      toast.error("NETWORK ERROR: Server unreachable.", { icon: '🛑' });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome Header */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">SMART PG</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Welcome back, {studentName}!
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium flex items-center gap-2">
              <Activity size={14} className="text-indigo-500 animate-pulse" /> Student Portal Active
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-3 bg-white rounded-full border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <Bell className="text-gray-600 group-hover:text-indigo-600 group-hover:animate-wiggle" size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-gray-50 p-4 border-b border-gray-100 text-sm font-bold text-gray-800 flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="bg-indigo-100 px-2 py-0.5 rounded-full text-indigo-700 text-xs">{notifications.length} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <h4 className="text-sm font-bold text-indigo-700 mb-1 flex items-center gap-2">
                        <Zap size={14} /> {notif.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      No new notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Actions & Recommended Rooms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsRoomModalOpen(true)}
                  className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Search size={80} className="text-white" /></div>
                  <Search size={40} className="text-white mb-3 group-hover:scale-110 transition-transform z-10" />
                  <span className="text-white font-bold text-lg z-10">Find a Room</span>
                  <span className="text-indigo-100 text-sm mt-1 z-10">AI Matching Engine</span>
                </button>
                
                <button 
                  onClick={() => document.getElementById('complaint-form').scrollIntoView({ behavior: 'smooth' })}
                  className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldAlert size={80} className="text-white" /></div>
                  <ShieldAlert size={40} className="text-white mb-3 group-hover:scale-110 transition-transform z-10" />
                  <span className="text-white font-bold text-lg z-10">Lodge a Complaint</span>
                  <span className="text-rose-100 text-sm mt-1 z-10">Maintenance & Queries</span>
                </button>
              </div>
            </section>

            {/* Recommended Rooms */}
            <section id="recommended-rooms-section" className="scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                Recommended Rooms
                <span className="ml-3 text-sm bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full font-bold flex items-center gap-1">
                  <Sparkles size={14} /> AI Matched
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendedRooms.length > 0 ? recommendedRooms.map((room) => (
                  <div key={room.id} className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{room.roomNumber}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                          <Activity size={12} className="mr-1" /> {room.matchScore}% Match
                        </div>
                        <button 
                          onClick={() => setSelectedRoomDetails(room)}
                          className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {room.beds.map((bed) => (
                        <button
                          key={bed.id}
                          disabled={!!bed.student_occupant}
                          onClick={() => handleBookSpecificBed(room.id, bed.id)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            bed.student_occupant 
                              ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:scale-105'
                          }`}
                        >
                          <span className="text-xs font-bold">Bed {bed.bed_number}</span>
                          <span className="text-[10px] opacity-70 mt-0.5">{bed.deck}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 relative z-10">
                      {room.tags.map((tag, index) => (
                        <span key={index} className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
                    <Sparkles className="text-gray-400 mb-3" size={32} />
                    <p className="text-gray-500 font-medium">Use the "Find a Room" panel to get AI recommendations based on your preferences!</p>
                  </div>
                )}
              </div>
            </section>

            {/* My Complaints Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-amber-500" /> My Complaints
              </h2>
              <div className="space-y-4">
                {myComplaints.length > 0 ? myComplaints.map((complaint) => {
                  const isAssigned = complaint.assigned_staff && complaint.assigned_staff !== 'Unassigned';
                  return (
                  <div key={complaint.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-gray-900">{complaint.category}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-1">{complaint.description}</p>
                      {complaint.ai_summary && (
                        <p className="text-xs text-indigo-600 mb-2 font-medium bg-indigo-50 px-2 py-1 rounded inline-block">
                          <Sparkles size={12} className="inline mr-1" />
                          AI Summary: {complaint.ai_summary}
                        </p>
                      )}
                      
                      <div className="mt-1">
                        {isAssigned ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            <Wrench size={12} /> Assigned to: {complaint.assigned_staff}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            <Clock size={12} /> Awaiting Assignment
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col justify-between items-end">
                      <p className="text-xs text-gray-400 font-medium mb-3">
                        {complaint.timestamp ? new Date(complaint.timestamp).toLocaleDateString() : ''}
                      </p>
                      {complaint.status !== 'Resolved' && (
                        <button
                          onClick={() => handleCloseTicket(complaint.id)}
                          className="text-[10px] font-bold px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Close Ticket
                        </button>
                      )}
                    </div>
                  </div>
                )}) : (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                    <p className="text-gray-500 text-sm">No complaints filed yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Notice Board */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-bold text-gray-800">Notice Board</h2>
                <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer text-sm font-bold transition-colors">View All</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                {notices.map((notice) => (
                  <div key={notice.id} className="group p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 ${notice.color}`}>
                        {notice.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {notice.title}
                        </h4>
                        <p className="text-xs font-semibold text-indigo-500 mt-1 uppercase tracking-wide">{notice.date}</p>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                          {notice.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Form Section: File a Complaint */}
        <section id="complaint-form" className="bg-white p-8 rounded-3xl border border-gray-100 mt-8 scroll-mt-24 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-indigo-600">
            <Wrench size={140} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 relative z-10">
            <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><ShieldAlert size={24} /></span> 
            File a Complaint
          </h2>
          
          <form onSubmit={handleComplaintSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  placeholder="e.g., AC not working in Room 102"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none" 
                  required
                >
                  <option value="" disabled>Select category</option>
                  <option value="Maintenance">Maintenance / Electrical</option>
                  <option value="Cleanliness">Cleanliness / Housekeeping</option>
                  <option value="Internet">Internet / Wi-Fi</option>
                  <option value="Food">Food / Mess</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none" 
                rows="4" 
                placeholder="Provide more details about the issue..."
                required
              ></textarea>
            </div>

            <div className="bg-gray-50/80 p-6 rounded-2xl border border-dashed border-gray-300 relative hover:border-indigo-400 hover:bg-gray-50 transition-colors group">
              <label className="block text-sm font-bold text-gray-700 mb-3">Attach Evidence Image (Optional)</label>
              
              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" size={32} />
                          <p className="mb-1 text-sm text-gray-600"><span className="text-indigo-600 font-bold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="relative inline-block mt-2">
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-md border border-gray-200" />
                  <button 
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-bold"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all focus:ring-4 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </section>

      </div>

      {/* Room Booking Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Search className="text-indigo-600" /> Find Your Room
              </h2>
              <p className="text-gray-500 mt-2 mb-8 font-medium">Enter your preferences and select an available room.</p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Left: Preferences Form */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700">
                    <Sparkles size={20} /> Match Preferences
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science" 
                      value={roomPreferences.course}
                      onChange={e => setRoomPreferences({...roomPreferences, course: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
                      <select 
                        value={roomPreferences.year}
                        onChange={e => setRoomPreferences({...roomPreferences, year: e.target.value})}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Any</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Preference</label>
                      <select 
                        value={roomPreferences.dietary_preference}
                        onChange={e => setRoomPreferences({...roomPreferences, dietary_preference: e.target.value})}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Any</option>
                        <option value="veg">Veg</option>
                        <option value="non-veg">Non-Veg</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sleep Schedule</label>
                    <select 
                      value={roomPreferences.sleep_schedule}
                      onChange={e => setRoomPreferences({...roomPreferences, sleep_schedule: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="">Any</option>
                      <option value="early">Early Bird</option>
                      <option value="late">Night Owl</option>
                    </select>
                  </div>

                  <button 
                    type="button"
                    onClick={handleFetchRecommendations}
                    disabled={isLoadingRooms}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoadingRooms ? (
                      <><Activity className="animate-spin" size={18} /> Finding Best Matches...</>
                    ) : (
                      <><Sparkles size={18} /> Find Compatible Roommates</>
                    )}
                  </button>
                </div>

                {/* Right: Interactive Room Map */}
                <div className="flex flex-col h-full bg-white border border-gray-100 p-6 rounded-2xl shadow-sm overflow-y-auto max-h-[600px]">
                  
                  {recommendedRooms.length > 0 ? (
                    <>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-indigo-700">
                        <Sparkles size={20} className="text-indigo-500" /> Top {recommendedRooms.length} Recommended Rooms
                      </h3>
                      <div className="space-y-4">
                        {recommendedRooms.map((room) => (
                          <div key={room.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-extrabold text-gray-900 text-lg">{room.roomNumber}</h4>
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Activity size={12} /> {room.matchScore}% Match
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {room.beds.map((bed) => (
                                <button
                                  key={bed.id}
                                  disabled={!!bed.student_occupant}
                                  onClick={() => {
                                    setSelectedRoom(room.id);
                                    setSelectedBed(bed.id);
                                  }}
                                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                                    bed.student_occupant 
                                      ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed' 
                                      : selectedBed === bed.id 
                                        ? 'bg-indigo-600 border-indigo-700 text-white ring-2 ring-indigo-200' 
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  Bed {bed.bed_number} ({bed.deck})
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              {room.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Submission Button */}
                      <button 
                        disabled={!selectedBed}
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {selectedBed ? `Confirm & Book Selected Bed` : 'Select an available bed'} 
                        {selectedBed && <CheckCircle size={18} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-800">
                        <Search size={20} className="text-emerald-500" /> Room Availability Map
                      </h3>
                      
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 mb-6 text-xs font-bold text-gray-600">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50">
                          <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span> Available
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50">
                          <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span> Occupied
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50">
                          <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm border border-indigo-600"></span> Selected
                        </div>
                      </div>

                      {/* Room & Bed Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow content-start">
                        {dummyRooms.map(room => {
                          const isOccupied = room.occupancy_status === 'occupied';
                          const isRoomSelected = selectedRoom === room.id;
                          
                          return (
                            <div 
                              key={room.id}
                              className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                                isRoomSelected 
                                  ? 'border-indigo-500 bg-indigo-50/50 shadow-md' 
                                  : isOccupied 
                                    ? 'border-red-100 bg-red-50/30' 
                                    : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-extrabold text-gray-800 text-sm">Room {room.room_number}</h4>
                                {isOccupied && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">FULL</span>}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {room.beds && room.beds.map((bed) => {
                                  const bedOccupied = !!bed.student_occupant;
                                  const isBedSelected = selectedBed === bed.id;
                                  return (
                                    <button
                                      key={bed.id}
                                      disabled={bedOccupied}
                                      onClick={() => {
                                        setSelectedRoom(room.id);
                                        setSelectedBed(bed.id);
                                      }}
                                      className={`p-2 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center ${
                                        bedOccupied 
                                          ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed' 
                                          : isBedSelected 
                                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-inner scale-105' 
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                      }`}
                                      title={bedOccupied ? "Bed occupied" : "Click to select this bed"}
                                    >
                                      <span>Bed {bed.bed_number}</span>
                                      <span className="opacity-80 mt-0.5 font-semibold text-[8px] uppercase">{bed.deck}</span>
                                    </button>
                                  );
                                })}
                                {/* Fallback if no beds array exists for old rooms */}
                                {(!room.beds || room.beds.length === 0) && (
                                  <div className="col-span-2 text-center py-2 text-xs text-gray-400 font-medium">
                                    Room schema pending update
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Submission Button */}
                      <button 
                        disabled={!selectedBed}
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {selectedBed ? `Confirm & Book Selected Bed` : 'Select a green bed'} 
                        {selectedBed && <CheckCircle size={18} />}
                      </button>
                    </>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={5000} 
        />
      )}

      {/* Compatibility Details Modal */}
      {selectedRoomDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <Sparkles size={24} className="text-indigo-200" /> {selectedRoomDetails.roomNumber} Analysis
                </h2>
                <p className="text-indigo-100 text-sm mt-1 font-medium">AI Match Breakdown</p>
              </div>
              <button 
                onClick={() => setSelectedRoomDetails(null)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-md shrink-0">
                  <span className="text-3xl font-black text-emerald-600">{selectedRoomDetails.matchScore}%</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Overall Compatibility Score</h3>
                  <p className="text-sm text-gray-500 mt-1">Based on Course, Year, Diet, and Sleep Schedule mapping with current occupants.</p>
                </div>
              </div>
              
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-100 pb-2">Current Occupants ({selectedRoomDetails.occupants.length}/4)</h3>
              
              {selectedRoomDetails.occupants.length > 0 ? (
                <div className="space-y-3">
                  {selectedRoomDetails.occupants.map((occ, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm hover:border-indigo-200 transition-colors">
                      <div>
                        <p className="font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">{idx + 1}</span>
                          {occ.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 ml-8">{occ.course} • Year {occ.year}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:ml-0 ml-8">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${occ.sleep_schedule === roomPreferences.sleep_schedule && roomPreferences.sleep_schedule !== '' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {occ.sleep_schedule === 'early' ? 'Early Bird' : occ.sleep_schedule === 'late' ? 'Night Owl' : 'Flexible Sleep'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${occ.dietary_preference === roomPreferences.dietary_preference && roomPreferences.dietary_preference !== '' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {occ.dietary_preference === 'veg' ? 'Vegetarian' : 'Non-Veg'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-2xl text-center">
                  <Sparkles className="mx-auto text-indigo-300 mb-2" size={32} />
                  <p className="text-gray-800 font-bold">This room is completely empty!</p>
                  <p className="text-sm text-gray-500 mt-1">You will be the first occupant and set the vibe for future matches.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRoomDetails(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}