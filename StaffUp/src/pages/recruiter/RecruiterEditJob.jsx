import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";

const RecruiterEditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    dept: "",
    location: "",
    salary: "",
    description: "",
    requirements: ""
  });

  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await API.get(`/recruit/view/${id}`);
        // Safely map only the fields we want to edit
        setForm({
          title: res.data.title || "",
          dept: res.data.dept || "",
          location: res.data.location || "",
          salary: res.data.salary || "",
          description: res.data.description || "",
          requirements: res.data.requirements || ""
        });
      } catch (err) {
        setError("Failed to load job details. It may have been deleted.");
      } finally {
        setFetching(false);
      }
    };
    loadJob();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    // --- Strict Frontend Validations ---
    const salaryNum = Number(form.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      return setError("Please enter a valid numeric salary greater than 0.");
    }
    if (form.description.trim().length < 20) {
      return setError("Please provide a more detailed Job Description (min 20 characters).");
    }
    if (form.requirements.trim().length < 20) {
      return setError("Please provide more detailed Technical Specifications (min 20 characters).");
    }

    setLoading(true);
    try {
      // Ensure salary is sent as a strict Number
      const payload = { ...form, salary: salaryNum };
      
      await API.put(`/recruit/update-job/${id}`, payload);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black italic">EDIT <span className="text-blue-600">OPENING</span></h1>
        <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-400 hover:text-slate-800 transition">
          CANCEL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 space-y-6">
        
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
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Department</label>
            <input
              type="text"
              name="dept"
              value={form.dept}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              required
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Base Salary (Numeric)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
              <input
                type="number"
                name="salary"
                min="0"
                value={form.salary}
                onChange={handleChange}
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-bold text-green-700 bg-green-50"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Job Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium h-32 resize-y"
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Technical Specifications / Requirements</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium h-32 resize-y"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-xl font-black rounded-xl transition shadow-lg active:scale-95
            ${loading ? 'bg-slate-400 text-white cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
        >
          {loading ? 'UPDATING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </div>
  );
};

export default RecruiterEditJob;