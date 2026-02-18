import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    experience: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/profile');
        setUser(res.data);

        setFormData({
          name: res.data.name,
          companyName: res.data.meta?.company || '',
          experience: res.data.meta?.experience || ''
        });

      } catch (err) {
        console.error("Error fetching profile");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("name", formData.name);

      if (user.role === "recruiter") {
        payload.append("company", formData.companyName);
      } else {
        payload.append("experience", formData.experience);
        if (resumeFile) {
          payload.append("resume", resumeFile);
        }
      }

      await API.put('/auth/profile', payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Profile updated successfully!");
      window.location.reload();

    } catch (err) {
      alert("Update failed");
    }
  };

  if (!user)
    return <div className="p-20 text-center font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="card shadow-2xl border-t-8 border-blue-600">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-black">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-slate-500 font-medium capitalize">
              {user.role} • {user.email}
            </p>
          </div>
        </div>

        {/* VIEW MODE */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase">Full Name</p>
              <p className="text-lg font-bold text-slate-800">{user.name}</p>
            </div>

            {user.role === 'recruiter' ? (
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase">Company</p>
                <p className="text-lg font-bold text-slate-800">
                  {user.meta?.company || 'Not Set'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase">
                    Years of Experience
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {user.meta?.experience || 'Not Set'}
                  </p>
                </div>

                {/* Resume Display */}
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase">
                    Resume
                  </p>
                  {user.resume ? (
                    <a
                      href={`http://localhost:5000${user.resume}`}
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
              </>
            )}

          </div>
        ) : (

          /* EDIT MODE */
          <form onSubmit={handleUpdate} className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                value={formData.name}
                className="input-field"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {user.role === 'recruiter' ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  className="input-field"
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    className="input-field"
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </div>

                {/* Resume Update */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Update Resume
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="input-field"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </div>
              </>
            )}

            <button className="btn-primary w-full py-4 font-black">
              Save Changes
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
