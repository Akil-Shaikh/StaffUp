import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);

  useEffect(() => {
    API.get(`/recruit/details/${id}`).then(res => setApp(res.data));
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await API.patch(`/recruit/update-status/${id}`, { status: newStatus });
      alert(`Application marked as ${newStatus}`);
      navigate('/recruiter/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  if (!app) return <div className="p-20 text-center font-bold animate-pulse">Loading Candidate Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button onClick={() => navigate(-1)} className="text-slate-400 font-bold mb-6 hover:text-slate-900 transition">
        ← BACK TO PIPELINE
      </button>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Section */}
        <div className="bg-slate-900 p-10 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{app.applicantId?.name || "Unknown Candidate"}</h1>
              <p className="text-blue-400 font-bold mt-1">{app.applicantId?.email}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest
              ${app.status === 'Hired' ? 'bg-green-500/20 text-green-400' :
                app.status === 'Dropped' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              Current Status: {app.status}
            </span>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Info */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Applied For</h3>
              <p className="text-xl font-bold text-slate-800">{app.vacancyId?.title || "Deleted Role"}</p>
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
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {app.details?.notes || "No additional notes provided by the candidate."}
              </p>
            </section>

            {/* FIXED: Document Rendering Section */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Application Resume
                </p>
                {app.resumePath ? (
                  <a
                    href={`http://localhost:5000${app.resumePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    📄 View Specific Resume
                  </a>
                ) : (
                  <p className="text-red-500 font-bold text-sm">No application resume uploaded</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Permanent Profile CV
                </p>
                {app.applicantId?.cvPath ? (
                  <a
                    href={`http://localhost:5000${app.applicantId.cvPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    📂 View Permanent CV
                  </a>
                ) : (
                  <p className="text-slate-400 font-bold text-sm italic">No permanent CV on file</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Actions */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 h-fit">
            <h3 className="text-xl font-black mb-6 italic text-slate-900">DECISION <span className="text-blue-600">CENTRE</span></h3>

            <div className="mb-6 pb-6 border-b border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Capacity</p>
              <p className="text-lg font-bold text-slate-800">
                {app.vacancyId?.slots?.filled} / {app.vacancyId?.slots?.total} Slots Filled
              </p>
            </div>

            {app.jobRemoved ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-xl font-bold text-sm border border-red-200">
                This vacancy has been closed or removed. No further actions can be taken.
              </div>
            ) : (
              <div className="space-y-3">
                {/* 🔥 FIXED HIRE BUTTON */}
                <button
                  onClick={() => updateStatus('Hired')}
                  // Disable if already hired OR if slots are full (and not currently hired)
                  disabled={app.status === 'Hired' || (app.vacancyId?.slots?.filled >= app.vacancyId?.slots?.total && app.status !== 'Hired')}
                  className={`w-full py-4 rounded-xl font-black transition shadow-lg active:scale-95
          ${app.status === 'Hired'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : (app.vacancyId?.slots?.filled >= app.vacancyId?.slots?.total)
                        ? 'bg-red-100 text-red-400 border-2 border-red-200 cursor-not-allowed shadow-none'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}
                >
                  {app.status === 'Hired'
                    ? 'ALREADY HIRED'
                    : (app.vacancyId?.slots?.filled >= app.vacancyId?.slots?.total)
                      ? 'NO SLOTS REMAINING'
                      : 'APPROVE & HIRE'}
                </button>

                <button
                  onClick={() => updateStatus('Shortlisted')}
                  disabled={app.status === 'Shortlisted' || app.status === 'Hired'}
                  className={`w-full py-4 rounded-xl font-black transition active:scale-95 shadow-lg
          ${(app.status === 'Shortlisted' || app.status === 'Hired') ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                >
                  SHORTLIST
                </button>

                <button
                  onClick={() => updateStatus('Dropped')}
                  disabled={app.status === 'Dropped'}
                  className={`w-full border-2 py-4 rounded-xl font-black transition active:scale-95
          ${app.status === 'Dropped' ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-red-600 border-red-50 hover:bg-red-50'}`}
                >
                  {app.status === 'Dropped' ? 'ALREADY DROPPED' : 'REJECT / DROP'}
                </button>
              </div>
            )}

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