import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);

  useEffect(() => {
    API.get(`/recruit/details/${id}`).then(res => setApp(res.data));
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      // pending for now have to create new api endpoint
      await API.patch(`/recruit/update-status/${id}`, { status: newStatus });
      alert(`Application marked as ${newStatus}`);
      navigate('/recruiter/dashboard');
    } catch (err) { alert("Update failed"); }
  };

  if (!app) return <div className="p-20 text-center font-bold">Loading Candidate Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button onClick={() => navigate(-1)} className="text-slate-400 font-bold mb-6 hover:text-slate-900">← BACK TO PIPELINE</button>
      
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Section */}
        <div className="bg-slate-900 p-10 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{app.applicantId?.name}</h1>
              <p className="text-blue-400 font-bold mt-1">{app.applicantId?.email}</p>
            </div>
            <span className="px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest">
              Current Status: {app.status}
            </span>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Info */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Applied For</h3>
              <p className="text-xl font-bold text-slate-800">{app.vacancyId?.title}</p>
              <p className="text-sm font-medium text-slate-500">{app.vacancyId?.dept} • {app.vacancyId?.location}</p>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Experience Provided</h3>
              <p className="text-lg font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{app.details?.exp || "Not specified"}"
              </p>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Candidate Notes</h3>
              <p className="text-slate-600 leading-relaxed">{app.details?.notes || "No additional notes provided by the candidate."}</p>
            </section>

            <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase">
                    Resume
                  </p>
                  {app.applicantId?.resume ? (
                    <a
                      href={`http://localhost:5000${app.applicantId.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    <p className="text-red-500 font-bold">No Resume Uploaded</p>
                  )}
                </div>
          </div>

          {/* Right Column: Actions */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 h-fit">
            <h3 className="text-xl font-black mb-6 italic">DECISION <span className="text-blue-600">CENTRE</span></h3>
            <div className="space-y-3">
              <button 
                onClick={() => updateStatus('Hired')}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-black hover:bg-green-700 transition active:scale-95 shadow-lg shadow-green-200"
              >
                APPROVE & HIRE
              </button>
              <button 
                onClick={() => updateStatus('Shortlisted')}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200"
              >
                SHORTLIST
              </button>
              <button 
                onClick={() => updateStatus('Dropped')}
                className="w-full bg-white text-red-600 border-2 border-red-50 py-4 rounded-xl font-black hover:bg-red-50 transition active:scale-95"
              >
                REJECT / DROP
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-6 text-center">
              * Actions will immediately notify the candidate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;