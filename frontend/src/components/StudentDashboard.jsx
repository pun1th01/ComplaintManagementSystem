import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Image as ImageIcon, CheckCircle, Bell, Search, ShieldAlert, Wrench, Wifi, Coffee, Droplets } from 'lucide-react';

export default function StudentDashboard() {
  // State for Complaint Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy Data for Notices
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

  // Dummy Data for Recommended Rooms
  const recommendedRooms = [
    {
      id: 101,
      roomNumber: 'A-204',
      matchScore: 95,
      tags: ['Veg', 'Early Bird', 'Quiet'],
    },
    {
      id: 102,
      roomNumber: 'B-301',
      matchScore: 88,
      tags: ['Non-Veg', 'Night Owl', 'Balcony'],
    },
    {
      id: 103,
      roomNumber: 'A-110',
      matchScore: 82,
      tags: ['Veg', 'Flexible', 'Ground Floor'],
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
    formData.append('student', 1); // Mock student ID
    if (image) {
      formData.append('image_url', image);
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
                <button className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Search size={80} /></div>
                  <Search size={40} className="text-white mb-3 group-hover:animate-bounce z-10" />
                  <span className="text-white font-bold text-lg z-10">Find a Room</span>
                  <span className="text-indigo-100 text-sm mt-1 z-10">Match with roommates</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recommendedRooms.map((room) => (
                  <div key={room.id} className="relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{room.roomNumber}</h3>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                        <CheckCircle size={12} className="mr-1" /> {room.matchScore}%
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                      {room.tags.map((tag, index) => (
                        <span key={index} className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full mt-6 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors text-sm shadow-md hover:shadow-lg relative z-10 flex items-center justify-center gap-2 group-hover:gap-3">
                      View Room <span className="transition-all">→</span>
                    </button>
                  </div>
                ))}
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
    </div>
  );
}
