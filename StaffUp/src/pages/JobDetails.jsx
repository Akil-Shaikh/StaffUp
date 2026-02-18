import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [exp, setExp] = useState('');
  const [notes, setNotes] = useState('');
  const [hasapplied,setHasApplied]=useState(false);

  useEffect(() => {
    // Updated to the new hiring endpoint
    API.get(`/candidate/view/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error("Error fetching job details", err));
    API.get(`/candidate/check-applied/${id}`)
    .then(res => setHasApplied(res.data.applied));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      // Updated to match 'tracker' endpoint and 'Submission' model
      await API.post('/candidate/apply', { 
        vacancyId: id, 
        details: { 
          exp: exp, 
          notes: notes 
        } 
      });
      alert("Application Submitted successfully!");
      navigate('/candidate/dashboard');
    } catch (err) { 
      alert(err.response?.data?.msg || "Error applying"); 
    }
  };

  if (!job) return (
    <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
    </div>
  );

  const isFull = job.slots.filled >= job.slots.total;

  return (
    <div className="max-w-6xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
      <div className="md:col-span-2">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter italic">
          {job.title}
        </h1>
        <div className="flex gap-4 mb-8">
           <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{job.dept}</span>
           <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase">{job.location}</span>
           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{job.salary}</span>
        </div>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 text-slate-900 mb-3 uppercase tracking-tight">Role Description</h3>
            <p className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">{job.description || "No description provided."}</p>
          </section>
          
          <section>
            <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 text-slate-900 mb-3 uppercase tracking-tight">Technical Specifications</h3>
            <p className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm whitespace-pre-line">{job.requirements || "No specific requirements listed."}</p>
          </section>
        </div>
      </div>

      {/* Application Sidebar */}
      <div className="h-fit sticky top-24">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
          <h3 className="text-2xl font-black mb-6 italic text-slate-900">QUICK <span className="text-blue-600">APPLY</span></h3>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Total Experience</label>
              <input 
              disabled={isFull || hasapplied }
                type="text" 
                placeholder="e.g. 3 years" 
                className={`w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${isFull || hasapplied ? 'bg-slate-300 cursor-not-allowed' : '' }`}
                required 
                onChange={e => setExp(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Additional Notes</label>
              <textarea 
              disabled={isFull || hasapplied }
                placeholder="Why should we hire you?" 
                className={`w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition ${isFull || hasapplied ? 'bg-slate-300 cursor-not-allowed' : '' }`}
                rows="4" 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>
            
            <div className="py-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Availability</p>
               <p className="text-sm font-bold text-slate-700">{job.slots.total - job.slots.filled} out of {job.slots.total} slots remaining</p>
            </div>
            <button 
              disabled={isFull || hasapplied }
              className={`w-full py-4 rounded-xl font-black text-white transition-all transform active:scale-95 shadow-lg
                ${isFull || hasapplied ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isFull ? 'CAPACITY REACHED' : hasapplied ? 'Applied':'SUBMIT APPLICATION'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;