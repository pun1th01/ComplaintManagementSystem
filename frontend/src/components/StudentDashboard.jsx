import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Image as ImageIcon, CheckCircle, Bell, Search, ShieldAlert, Wrench, Wifi, Coffee, Droplets, X, CreditCard } from 'lucide-react';

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
  const [roomPreferences, setRoomPreferences] = useState({ course: '', year: '', dietary_preference: '', sleep_schedule: '' });
  
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);

  // Grab logged in user
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const studentName = storedUser?.user?.name || "Student";
  const studentId = storedUser?.user?.id || 1;

  const fetchRooms = () => {
    fetch('http://127.0.0.1:8000/api/rooms/')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error(err));
  };

  const fetchMyComplaints = () => {
    fetch('http://127.0.0.1:8000/api/complaints/')
      .then(res => res.json())
      .then(data => {
        // Filter complaints for this student
        const filtered = data.filter(c => c.student === studentId);
        setMyComplaints(filtered);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRooms();
    fetchMyComplaints();
  }, [studentId]);

  const handleFetchRecommendations = () => {
    setIsLoadingRooms(true);
    fetch('http://127.0.0.1:8000/api/get_recommended_rooms/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course: roomPreferences.course,
        year: parseInt(roomPreferences.year),
        dietary_preference: roomPreferences.dietary_preference,
        sleep_schedule: roomPreferences.sleep_schedule,
        balcony_preference: storedUser?.user?.balcony_preference || false
      })
    })
    .then(res => res.json())
    .then(data => {
      setRecommendedRooms(data.map(room => ({
        id: room.id,
        roomNumber: `Room ${room.room_number}`,
        matchScore: Math.round(room.compatibility_score * 5 + 40),
        tags: [room.is_balcony_room ? 'Balcony' : 'No Balcony', `${room.beds.filter(b => !b.student_occupant).length} Beds Left`],
        beds: room.beds
      })));
    })
    .catch(err => console.error(err))
    .finally(() => setIsLoadingRooms(false));
  };

  const handlePaymentSuccess = () => {
    const roomObj = rooms.find(r => r.room_number === selectedRoom);
    if (!roomObj) return;

    const availableBed = roomObj.beds?.find(b => !b.student_occupant);
    if (!availableBed) {
      toast.error("No beds available in this room!");
      setIsPaymentModalOpen(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/api/rooms/${roomObj.id}/book_bed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        bed_id: availableBed.id
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        toast.error(data.error);
        setIsPaymentModalOpen(false);
      } else {
        toast.success(`Successfully booked ${roomObj.room_number}`);
        setIsPaymentModalOpen(false);
        setIsRoomModalOpen(false);
        fetchRooms();
      }
    })
    .catch(err => {
      toast.error("Failed to book bed.");
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
        toast.error(data.error);
      } else {
        toast.success(`Bed booked successfully!`);
        fetchRooms();
        handleFetchRecommendations();
      }
    })
    .catch(err => console.error(err));
  };

  const notices = [
    {
      id: 1,
      title: 'Water Maintenance (Block A)',
      date: 'April 30, 2026',
      description: 'Water supply will be interrupted from 10:00 AM to 2:00 PM for routine maintenance.',
      icon: <Droplets size={20} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Special Mess Menu',
      date: 'May 1, 2026',
      description: 'Special dinner feast this Friday featuring Paneer Butter Masala, Naan, and Gulab Jamun!',
      icon: <Coffee size={20} />,
      color: 'bg-orange-100 text-orange-600',
    },
  ];


  // Handle Image Selection
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
    
    // Form Validation Check
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill out all required fields before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Use FormData to support image uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints/', {
        method: 'POST',
        // Note: Do not set Content-Type header when using FormData, 
        // the browser will automatically set it to multipart/form-data with boundaries.
        body: formData,
      });

      if (response.status === 201 || response.ok) {
        toast.success('Complaint Submitted Successfully!');
        clearForm();
      } else {
        toast.error('Failed to submit complaint. Please check your inputs.');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Server error. Could not connect to API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Welcome back, Student! <span className="text-4xl animate-wave">👋</span>
            </h1>
            <p className="text-gray-500 mt-1 text-lg">Here is what's happening in your hostel today.</p>
          </div>
          <button className="relative p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <Bell className="text-gray-600" size={24} />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
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
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Search size={80} /></div>
                  <Search size={40} className="text-white mb-3 group-hover:animate-bounce z-10" />
                  <span className="text-white font-bold text-lg z-10">Find a Room</span>
                  <span className="text-indigo-100 text-sm mt-1 z-10">Book My Room</span>
                </button>
                
                <button 
                  onClick={() => document.getElementById('complaint-form').scrollIntoView({ behavior: 'smooth' })}
                  className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldAlert size={80} /></div>
                  <ShieldAlert size={40} className="text-white mb-3 group-hover:animate-bounce z-10" />
                  <span className="text-white font-bold text-lg z-10">Lodge a Complaint</span>
                  <span className="text-rose-100 text-sm mt-1 z-10">Maintenance & queries</span>
                </button>
              </div>
            </section>

            {/* Recommended Rooms */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                Recommended Rooms 
                <span className="ml-3 text-sm bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 py-1 px-3 rounded-full font-bold flex items-center gap-1 border border-yellow-200 shadow-sm">
                  <Sparkles size={14} className="text-amber-600" /> AI Matched
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendedRooms.length > 0 ? recommendedRooms.map((room) => (
                  <div key={room.id} className="relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{room.roomNumber}</h3>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                        <CheckCircle size={12} className="mr-1" /> {room.matchScore}%
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
                          <span className="text-[10px] opacity-70">{bed.deck}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 relative z-10">
                      {room.tags.map((tag, index) => (
                        <span key={index} className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
                    <p className="text-gray-500 font-medium">Use the "Find a Room" panel to get AI recommendations based on your preferences!</p>
                  </div>
                )}
              </div>
            </section>

            {/* My Complaints Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-indigo-600" /> My Complaints
              </h2>
              <div className="space-y-4">
                {myComplaints.length > 0 ? myComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{complaint.category}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {complaint.status}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                          <Wrench size={10} /> {complaint.assigned_staff || 'Triage in Progress'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400">{complaint.timestamp ? new Date(complaint.timestamp).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 text-sm">No complaints filed yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Notice Board */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Notice Board</h2>
                <span className="text-gray-400 hover:text-indigo-600 cursor-pointer text-sm font-medium">View All</span>
              </div>
              
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="group p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 cursor-pointer bg-gray-50/50">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notice.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        {notice.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-md group-hover:text-indigo-600 transition-colors">
                          {notice.title}
                        </h4>
                        <p className="text-xs font-semibold text-indigo-500 mb-1 tracking-wide uppercase mt-1">{notice.date}</p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                          {notice.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 text-gray-500 font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                + Subscribe to Alerts
              </button>
            </section>
          </div>
        </div>

        {/* Form Section: File a Complaint */}
        <section id="complaint-form" className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 mt-8 scroll-mt-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Wrench size={140} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Wrench size={24} /></span> 
            File a Complaint
          </h2>
          <form onSubmit={handleComplaintSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-white/50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none" 
                  placeholder="e.g., AC not working in Room 102"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full bg-white/50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none appearance-none" 
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-white/50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none resize-none" 
                rows="4" 
                placeholder="Provide more details about the issue..."
                required
              ></textarea>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-300 relative hover:bg-gray-50/80 transition-colors">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Attach Evidence Image (Optional)</label>
              
              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, or GIF (MAX. 5MB)</p>
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
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all focus:ring-4 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Book Your Perfect Room</h2>
              <p className="text-gray-500 mt-2 mb-8">Enter your preferences and select an available room from the map.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: Preferences Form */}
                <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-700">
                    <Sparkles size={20} /> Match Preferences
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science" 
                      value={roomPreferences.course}
                      onChange={e => setRoomPreferences({...roomPreferences, course: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                      <select 
                        value={roomPreferences.year}
                        onChange={e => setRoomPreferences({...roomPreferences, year: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="">Any</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Diet</label>
                      <select 
                        value={roomPreferences.dietary_preference}
                        onChange={e => setRoomPreferences({...roomPreferences, dietary_preference: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="">Any</option>
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sleep Schedule</label>
                    <select 
                      value={roomPreferences.sleep_schedule}
                      onChange={e => setRoomPreferences({...roomPreferences, sleep_schedule: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Any</option>
                      <option value="early">Early Bird (Sleep early, wake up early)</option>
                      <option value="late">Night Owl (Sleep late, wake up late)</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleFetchRecommendations}
                    disabled={isLoadingRooms}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {isLoadingRooms ? 'Finding Best Matches...' : 'Find Compatible Roommates'}
                    {!isLoadingRooms && <Sparkles size={18} />}
                  </button>
                </div>

                {/* Right: Interactive Room Map */}
                <div className="flex flex-col h-full bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
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

                  {/* Seat Grid */}
                  <div className="grid grid-cols-5 gap-3 flex-grow">
                    {dummyRooms.map(room => {
                      const isOccupied = room.occupancy_status === 'occupied';
                      const isSelected = selectedRoom === room.room_number;
                      
                      let btnClass = "relative flex items-center justify-center h-12 w-full rounded-xl border-2 font-bold text-sm transition-all duration-200 ";
                      if (isOccupied) {
                        btnClass += "bg-red-50 border-red-100 text-red-400 cursor-not-allowed";
                      } else if (isSelected) {
                        btnClass += "bg-indigo-600 border-indigo-700 text-white shadow-md scale-105 ring-2 ring-indigo-200 ring-offset-1";
                      } else {
                        btnClass += "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:scale-105 cursor-pointer";
                      }

                      return (
                        <button
                          key={room.id}
                          disabled={isOccupied}
                          onClick={() => setSelectedRoom(room.room_number)}
                          className={btnClass}
                          title={isOccupied ? "Room is full" : "Click to select"}
                        >
                          {room.room_number}
                        </button>
                      );
                    })}
                  </div>

                                    {/* Submission Button */}
                  <button 
                    disabled={!selectedRoom}
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {selectedRoom ? `Confirm & Book ${selectedRoom}` : 'Select a green room'} 
                    {selectedRoom && <CheckCircle size={18} />}
                  </button>

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
    </div>
  );
}



