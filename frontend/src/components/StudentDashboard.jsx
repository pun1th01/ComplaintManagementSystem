import React from 'react';

export default function StudentDashboard() {
  // Dummy Data for Notices
  const notices = [
    {
      id: 1,
      title: 'Water Maintenance (Block A)',
      date: 'April 30, 2026',
      description: 'Water supply will be interrupted from 10:00 AM to 2:00 PM for routine maintenance.',
      icon: '💧',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Special Mess Menu',
      date: 'May 1, 2026',
      description: 'Special dinner feast this Friday featuring Paneer Butter Masala, Naan, and Gulab Jamun!',
      icon: '🍲',
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, Student! 👋</h1>
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
                  <span className="text-4xl mb-3 group-hover:animate-bounce">🔍</span>
                  <span className="text-white font-bold text-lg">Find a Room</span>
                  <span className="text-indigo-100 text-sm mt-1">Match with roommates</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group">
                  <span className="text-4xl mb-3 group-hover:animate-bounce">📝</span>
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
      </div>
    </div>
  );
}
