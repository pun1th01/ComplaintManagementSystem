import React, { useState } from 'react';

export default function StudentPortal() {
  // Complaint Form State
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('');
  const [complaintImage, setComplaintImage] = useState(null);

  // Roommate Preferences State
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [sleepSchedule, setSleepSchedule] = useState('');

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    console.log("Complaint Submitted:", { title: complaintTitle, description: complaintDescription, category: complaintCategory, image: complaintImage });
    alert("Complaint sumitted successfully! (Dummy)");
    // Reset form
    setComplaintTitle('');
    setComplaintDescription('');
    setComplaintCategory('');
    setComplaintImage(null);
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    console.log("Preferences Updated:", { course, year, sleepSchedule });
    alert("Preferences updated successfully! (Dummy)");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h1 className="text-3xl font-extrabold text-gray-800">Student Portal</h1>
          <p className="text-gray-500 mt-2">Manage your hostel living experience seamlessly.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* File a Complaint Section */}
          <section className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">File a Complaint</h2>
            <form onSubmit={handleComplaintSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={complaintTitle} 
                  onChange={(e) => setComplaintTitle(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="e.g., Broken fan in Room 204"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={complaintDescription} 
                  onChange={(e) => setComplaintDescription(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  rows="4" 
                  placeholder="Provide more details about the issue..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  value={complaintCategory} 
                  onChange={(e) => setComplaintCategory(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Maintenance">Maintenance / Electrical</option>
                  <option value="Cleanliness">Cleanliness / Housekeeping</option>
                  <option value="Internet">Internet / Wi-Fi</option>
                  <option value="Food">Food / Mess</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Attach Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setComplaintImage(e.target.files[0])} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-300"
              >
                Submit Complaint
              </button>
            </form>
          </section>

          {/* Roommate Preferences Section */}
          <section className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Roommate Preferences</h2>
            <form onSubmit={handlePreferencesSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                <input 
                  type="text" 
                  value={course} 
                  onChange={(e) => setCourse(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                  placeholder="e.g. B.Tech Computer Science" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white" 
                  required
                >
                  <option value="" disabled>Select your current year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                  <option value="Masters/PhD">Masters / PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sleep Schedule</label>
                <select 
                  value={sleepSchedule} 
                  onChange={(e) => setSleepSchedule(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white" 
                  required
                >
                  <option value="" disabled>Select your sleep schedule</option>
                  <option value="Early Bird">Early Bird (Sleep early, wake up early)</option>
                  <option value="Night Owl">Night Owl (Sleep late, wake up late)</option>
                  <option value="Flexible">Flexible / Depends</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-300"
              >
                Save Preferences
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
