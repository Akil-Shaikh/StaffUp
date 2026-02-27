import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cvFile, setcvFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/profile');
        setUser(res.data);

        setFormData({
          name: res.data.name,
          company: res.data.meta?.company || '',
        });

      } catch (err) {
        console.error("Error fetching profile", err);
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
        payload.append("company", formData.company);
      } else {
        if (cvFile) {
          // CRITICAL: Must match uploadCV.single("cv") in backend
          payload.append("cv", cvFile); 
        }
      }

      await API.put('/auth/profile', payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Profile updated successfully!");
      
      // Update local storage so Navbar stays in sync
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.name = formData.name;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      window.location.reload();

    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  if (!user)
    return <div className="p-20 text-center font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="card shadow-2xl border-t-8 border-blue-600 bg-white p-8 rounded-xl">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded hover:bg-slate-200 transition text-sm"
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
                
                {/* Resume Display - Fixed nesting */}
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase">
                    Permanent CV
                  </p>
                  {user.cvPath ? (
                    <a
                      href={`http://localhost:5000${user.cvPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold underline"
                    >
                      View Current Document
                    </a>
                  ) : (
                    <p className="text-red-500 font-bold">No CV Uploaded</p>
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
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {user.role === 'recruiter' ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2 p-4 bg-slate-50 border rounded-lg">
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Update CV
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setcvFile(e.target.files[0])}
                  />
                  <p className="text-xs text-slate-400 mt-2">* Leaves current CV unchanged if left empty.</p>
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition shadow-lg active:scale-95">
              Save Changes
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;