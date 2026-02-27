import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const [role, setRole] = useState('candidate');
  const [cvFile, setCvFile] = useState(null); // State for the file
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We use FormData for file uploads
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', role);

    if (role === 'recruiter') {
      data.append('company', formData.company);
    } else if (cvFile) {
      data.append('cv', cvFile); // Appending the CV file
    }

    try {
      // Ensure your backend endpoint handles 'multipart/form-data'
      const res = await API.post('/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      window.location.reload();
    } catch (err) { 
      alert(err.response?.data?.msg || "Registration Failed"); 
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-blue-600">
      <h2 className="text-3xl font-black mb-6 italic tracking-tight uppercase text-slate-900">
        STAFF <span className="text-blue-600">UP</span>
      </h2>
      
      <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
        {['candidate', 'recruiter'].map((r) => (
          <button 
            key={r} 
            type="button"
            onClick={() => setRole(r)} 
            className={`flex-1 py-2 rounded-md font-bold capitalize transition ${role === r ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required 
          onChange={e => setFormData({...formData, name: e.target.value})} />
        
        <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required 
          onChange={e => setFormData({...formData, email: e.target.value})} />
        
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        
        {role === 'recruiter' ? (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Company Details</label>
            <input 
              type="text" 
              placeholder="Company Name" 
              className="w-full p-3 border-2 border-blue-50 rounded-lg outline-none focus:border-blue-500 font-bold" 
              onChange={e => setFormData({...formData, company: e.target.value})} 
              required
            />
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Curriculum Vitae (CV)</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              className="w-full p-2 border-2 border-dashed border-green-200 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
              onChange={e => setCvFile(e.target.files[0])} 
              required
            />
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">* PDF, DOC, or DOCX accepted</p>
          </div>
        )}
        
        <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          REGISTER ACCOUNT
        </button>
      </form>
    </div>
  );
};

export default Register;