import { useState } from 'react';

export default function StudentDashboard() {
  // State for Complaint Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [image, setImage] = useState(null);

  // Dummy Data for Notices
  const notices = [
    {
      id: 1,
      title: 'Water Maintenance (Block A)',
      date: 'April 30, 2026',
      description: 'Water supply will be interrupted from 10:00 AM to 2:00 PM for routine maintenance.',
      icon: '??',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Special Mess Menu',
      date: 'May 1, 2026',
      description: 'Special dinner feast this Friday featuring Paneer Butter Masala, Naan, and Gulab Jamun!',
      icon: '??',
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

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    // We send the form data as JSON per the requirements
    const payload = {
      title,
      description,
      category,
      student: 1 // Sending dummy student ID 1 to pass DRF validation
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201 || response.ok) {
        alert('Complaint Submitted Successfully!');
        // Clear all form inputs
        setTitle('');
        setDescription('');
        setCategory('');
        setImage(null);
      } else {
        alert('Failed to submit complaint. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('An error occurred attempting to reach the server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, Student! ??</h1>
            <p className="text-gray-500 mt-1 text-lg">Here is what's happening in your hostel today.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Actions & Recommended Rooms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group">
                  <span className="text-4xl mb-3 group-hover:animate-bounce">??</span>
                  <span className="text-white font-bold text-lg">Find a Room</span>
                  <span className="text-indigo-100 text-sm mt-1">Match with roommates</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group">
                  <span className="text-4xl mb-3 group-hover:animate-bounce">??</span>
                  <span className="text-white font-bold text-lg">Lodge a Complaint</span>
                  <span className="text-rose-100 text-sm mt-1">Maintenance & queries</span>
                </button>
              </div>
            </section>

            {/* Recommended Rooms */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                Recommended Rooms <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full font-semibold">AI Matched</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedRooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-gray-800">{room.roomNumber}</h3>
                      <div className="bg-green-100 text-green-700 font-bold text-xs px-2 py-1 rounded-md flex items-center">
                        {room.matchScore}% Match
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {room.tags.map((tag, index) => (
                        <span key={index} className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="w-full mt-5 bg-gray-900 text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                      View Details
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
                  <div key={notice.id} className="group p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl ${notice.color}`}>
                        {notice.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-md group-hover:text-indigo-600 transition-colors">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium mb-1">{notice.date}</p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
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
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>??</span> File a Complaint
          </h2>
          <form onSubmit={handleComplaintSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  placeholder="e.g., AC not working in Room 102"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white" 
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
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                rows="4" 
                placeholder="Provide more details about the issue..."
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer" 
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-300"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
