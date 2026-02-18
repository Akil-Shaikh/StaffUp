import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        const res = await API.get('/candidate/my-history');
        setMyApps(res.data);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse">Syncing History...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic">MY <span className="text-blue-600">HISTORY</span></h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">
            Total Submissions: {myApps.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {myApps.map(app => (
          <Link key={app._id}
            to={`/candidate/dashboard/applied/${app._id}`}
            className="block"
          >

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm  hover:shadow-md transition-shadow">
              <div className='flex justify-between items-center'>
                <div >
                  {/* FIXED: Using vacancyId instead of jobId */}
                  <h3 className="text-xl font-bold text-slate-800">{app.vacancyId?.title || 'Unknown Role'}</h3>
                  <p className="text-blue-600 text-sm font-bold uppercase tracking-tight">{app.vacancyId?.dept || 'General'}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">
                    Submitted: {new Date(app.createdAt).toLocaleDateString()}
                  </p>

                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter
                ${app.status === 'Hired' ? 'bg-green-100 text-green-700 border border-green-200' :
                      app.status === 'Dropped' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {app.status}
                  </span>
                  <p className="text-[10px] mt-2 text-slate-300 font-black uppercase tracking-widest">Process Stage</p>
                </div>
              </div>
              {app.jobRemoved && (
                <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-bold mt-2">
                  {app.jobRemovedMessage}
                </div>
              )}
            </div>

          </Link>
        ))}

        {myApps.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-100">
            <div className="text-4xl mb-4">📂</div>
            <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No applications found in your locker.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;