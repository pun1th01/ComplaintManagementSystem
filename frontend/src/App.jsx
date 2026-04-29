import { useState } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  // Fake Auth state: 'student', 'admin', or null (logged out)
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Hostel AI</h1>
          <p className="text-gray-500 mb-10 text-sm">Select a portal to continue</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => { setRole('student'); toast.success('Logged in as Student'); }}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              👩‍🎓 Student Portal
            </button>
            <button 
              onClick={() => { setRole('admin'); toast.success('Logged in as Admin Warden'); }}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              🛡️ Warden Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="top-right" />
      
      {/* Persistent Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">H</div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">HostelSystem</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full capitalize">
                {role} Mode
              </span>
              <button 
                onClick={() => { setRole(null); toast('Logged out successful'); }}
                className="text-sm font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conditionally Render the Portals */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {role === 'student' ? <StudentDashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
