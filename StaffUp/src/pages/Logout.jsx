import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Clear Storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Wait 2 seconds, then redirect home
    const timer = setTimeout(() => {
      navigate('/');
      window.location.reload(); // Refresh to update Navbar
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
        Signing you out...
      </h1>
      <p className="text-xl text-slate-500 font-medium">
        Thank you for using <span className="text-blue-600 font-bold tracking-tight">STAFF UP</span>. 
        <br />See you soon!
      </p>
    </div>
  );
};

export default Logout;