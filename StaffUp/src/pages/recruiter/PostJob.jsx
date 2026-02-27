import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const PostJob = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    title: '', 
    dept: '', 
    location: '', 
    salary: '', // Will be treated as a number
    description: '', 
    requirements: '', 
    totalSlots: 3 
  });
  
  // UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');

    // --- Strict Frontend Validations ---
    if (formData.totalSlots < 1) {
      return setError("Total slots must be at least 1.");
    }
    
    // Validate salary is a valid positive number
    const salaryNum = Number(formData.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      return setError("Please enter a valid numeric salary greater than 0.");
    }

    if (formData.description.trim().length < 20) {
      return setError("Please provide a more detailed Job Description (min 20 characters).");
    }
    if (formData.requirements.trim().length < 20) {
      return setError("Please provide more detailed Technical Specifications (min 20 characters).");
    }

    setLoading(true);

    try {
      // Ensure salary is sent as a number type in the JSON payload
      const payload = {
        ...formData,
        salary: salaryNum,
        totalSlots: Number(formData.totalSlots)
      };

      await API.post('/recruit/create', payload);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to publish the job opening. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8 italic">POST NEW <span className="text-blue-600">OPENING</span></h1>
      
      <form onSubmit={handlePost} className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 space-y-6">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded animate-in fade-in font-bold text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Job Title</label>
            <input 
              type="text" 
              placeholder="e.g. Senior Frontend Engineer" 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold text-slate-700" 
              required 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Department</label>
            <input 
              type="text" 
              placeholder="e.g. Engineering" 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold text-slate-700" 
              required 
              onChange={e => setFormData({...formData, dept: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Location</label>
            <input 
              type="text" 
              placeholder="e.g. Remote/Ahmedabad" 
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold text-slate-700" 
              required
              onChange={e => setFormData({...formData, location: e.target.value})} 
            />
          </div>
          
          {/* FIXED: Salary is now strictly numeric */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Base Salary (Numeric)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
              <input 
                type="number" 
                min="0"
                placeholder="120000" 
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition font-bold text-green-700 bg-green-50" 
                required
                onChange={e => setFormData({...formData, salary: e.target.value})} 
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Total Slots</label>
            <input 
              type="number" 
              min="1"
              value={formData.totalSlots}
              className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-blue-600 bg-blue-50" 
              required
              onChange={e => setFormData({...formData, totalSlots: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Job Description</label>
          <textarea 
            placeholder="Describe the day-to-day responsibilities and impact of this role..." 
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition h-32 resize-y font-medium text-slate-700" 
            required
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Technical Specifications / Requirements</label>
          <textarea 
            placeholder="List the required skills, tools, and past experience necessary..." 
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition h-32 resize-y font-medium text-slate-700" 
            required
            onChange={e => setFormData({...formData, requirements: e.target.value})} 
          />
        </div>

        <button 
          disabled={loading}
          className={`w-full py-4 text-xl font-black rounded-xl transition shadow-lg active:scale-95
            ${loading ? 'bg-slate-400 text-white cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
        >
          {loading ? 'PUBLISHING...' : 'PUBLISH TO FEED'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;