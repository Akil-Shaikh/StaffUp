import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PostJob = () => {
  const [formData, setFormData] = useState({ title: '', dept: '', location: '', salary: '', description: '', requirements: '', totalSlots: 3 });
  const navigate = useNavigate();

  const handlePost = async (e) => {
  e.preventDefault();
  try {
    await API.post('/recruit/create', formData);
    navigate('/recruiter/dashboard');
  } catch (err) {
    alert("Error posting job");
  }
};

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8 italic">Post New <span className="text-blue-600">Opening</span></h1>
      <form onSubmit={handlePost} className="card shadow-xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Job Title" className="input-field" required onChange={e => setFormData({...formData, title: e.target.value})} />
          <input type="text" placeholder="Department" className="input-field" required onChange={e => setFormData({...formData, dept: e.target.value})} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Location" className="input-field" onChange={e => setFormData({...formData, location: e.target.value})} />
          <input type="text" placeholder="Salary" className="input-field" onChange={e => setFormData({...formData, salary: e.target.value})} />
          <input type="number" placeholder="Total Slots (e.g. 3)" className="input-field font-bold text-blue-600" onChange={e => setFormData({...formData, totalSlots: e.target.value})} />
        </div>
        <textarea placeholder="Job Description" className="input-field h-32" onChange={e => setFormData({...formData, description: e.target.value})} />
        <textarea placeholder="Technical Specifications (Requirements)" className="input-field h-32" onChange={e => setFormData({...formData, requirements: e.target.value})} />
        <button className="btn-primary w-full py-4 text-xl">Publish to Staff Up Feed</button>
      </form>
    </div>
  );
};

export default PostJob;