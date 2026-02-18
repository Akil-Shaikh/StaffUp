import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const [role, setRole] = useState('candidate');
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    experience: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Password validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // ✅ Resume required for candidate
    if (role === 'candidate' && !resumeFile) {
      alert("Resume is required");
      return;
    }

    try {
      const formPayload = new FormData();

      formPayload.append("name", formData.name);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      formPayload.append("role", role);

      if (role === 'recruiter') {
        formPayload.append("company", formData.companyName);
      } else {
        formPayload.append("experience", formData.experience);
        formPayload.append("resume", resumeFile);
      }

      const res = await API.post('/auth/signup', formPayload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate(role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/candidate/dashboard'
      );

    } catch (err) {
      alert(err.response?.data?.msg || "Registration Failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 card shadow-2xl border-t-8 border-blue-600 p-8 rounded-xl">
      <h2 className="text-3xl font-black mb-6">Create Account</h2>

      {/* Role Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
        {['candidate', 'recruiter'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 rounded-md font-bold capitalize transition ${
              role === r
                ? 'bg-white shadow text-blue-600'
                : 'text-slate-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="input-field"
          required
          onChange={e => setFormData({...formData, name: e.target.value})}
        />

        <input
          type="email"
          placeholder="Email Address"
          className="input-field"
          required
          onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
          required
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="input-field"
          required
          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
        />

        {role === 'recruiter' ? (
          <input
            type="text"
            placeholder="Company Name"
            className="input-field font-bold border-blue-100"
            required
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
        ) : (
          <>
            <input
              type="number"
              placeholder="Years of Experience"
              className="input-field font-bold border-green-100"
              required
              onChange={e => setFormData({...formData, experience: e.target.value})}
            />

            {/* ✅ Resume Upload */}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="input-field border-green-200"
              onChange={e => setResumeFile(e.target.files[0])}
            />
          </>
        )}

        <button className="btn-primary w-full py-4 text-lg">
          Join Staff Up
        </button>

      </form>
    </div>
  );
};

export default Register;
