import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Get user data and auth status from local storage
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <nav className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-6">
        
        {/* Branding - Staff Up */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter italic">
          STAFF<span className="text-slate-900">UP</span>
        </Link>
        
        <div className="flex items-center space-x-6 text-sm font-semibold">
          {!isAuthenticated ? (
            // Guest Navigation
            <>
              <Link to="/login" className="text-slate-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          ) : (
            // Authenticated Navigation
            <>
            <Link to="/profile" className="text-slate-600 hover:text-blue-600 transition">
                Profile
              </Link>
              {user?.role === 'recruiter' ? (
                <>
                  <Link to="/recruiter/dashboard" className="text-slate-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                  <Link to="/recruiter/post-job" className="hidden md:block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    + Post Job
                  </Link>
                </>
              ) : (
                <>
                <Link to="/jobs" className="text-slate-600 hover:text-blue-600 transition">
                Browse Jobs
              </Link>
                
                <Link to="/candidate/dashboard" className="text-slate-600 hover:text-blue-600 transition">
                  My Applications
                </Link>
                </>
              )}

              {/* User Identity & Logout */}
              <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black leading-none">Logged in as</p>
                  <p className="text-slate-900 text-xs truncate max-w-[100px]">{user?.name}</p>
                </div>
                <Link to="/logout" className="text-red-500 hover:text-red-700 font-bold">Logout</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;