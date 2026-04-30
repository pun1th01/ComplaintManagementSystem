import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Read from localStorage on mount (simple persistence)
  const storedUser = JSON.parse(localStorage.getItem('user'));
  
  const handleLogin = async (role) => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (role === 'admin' && !password.trim()) {
      toast.error('Admin password is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Login failed');
      } else {
        toast.success(`Logged in as ${role === 'admin' ? 'Admin Warden' : 'Student: ' + username}`);
        localStorage.setItem('user', JSON.stringify(data));
        navigate(role === 'admin' ? '/admin' : '/student');
      }
    } catch (error) {
      toast.error('Server unavailable. Ensure backend is running.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast('Logged out successfully');
    navigate('/login');
  };

  // Protected Route Wrapper
  const RequireAuth = ({ children, requiredRole }) => {
    const userRole = storedUser?.role;
    if (!storedUser) return <Navigate to="/login" replace />;
    if (requiredRole && userRole !== requiredRole) return <Navigate to={userRole === 'admin' ? '/admin' : '/student'} replace />;
    return children;
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Toaster position="top-right" />
      
      {!isLoginPage && storedUser && (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">S</div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900">SMART PG</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden sm:block text-sm font-semibold text-gray-600 py-1.5 capitalize">
                  Welcome, {storedUser?.name || storedUser?.user?.name || 'User'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full capitalize">
                  {storedUser?.role} Mode
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={`flex-1 ${!isLoginPage ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full' : ''}`}>
        <Routes>
          <Route path="/login" element={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">SMART PG</h1>
                <p className="text-gray-500 mb-8 text-sm">Sign in to your portal</p>
                
                <div className="space-y-4">
                  <div className="text-left space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Username / Name</label>
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. John Doe, Admin"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Password (Wardens Only)</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-3 flex flex-col gap-3">
                    <button 
                      onClick={() => handleLogin('student')}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                    >
                      {isLoading ? 'Wait...' : '👩‍🎓 Login as Student'}
                    </button>
                    <button 
                      onClick={() => handleLogin('admin')}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                    >
                      {isLoading ? 'Wait...' : '🛡️ Warden Login'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/student" element={
            <RequireAuth requiredRole="student">
              <StudentDashboard />
            </RequireAuth>
          } />
          <Route path="/admin" element={
            <RequireAuth requiredRole="admin">
              <AdminDashboard />
            </RequireAuth>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
