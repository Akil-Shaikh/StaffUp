import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

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

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await API.get(`/recruit/view/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadJob();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.put(`/recruit/update-job/${id}`, form);
      alert("Job updated successfully");
      navigate('/recruiter/dashboard');
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-3xl font-black mb-6">Edit Job</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="dept"
          value={form.dept}
          onChange={handleChange}
          placeholder="Department"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 border rounded"
          rows={4}
        />

        <textarea
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          placeholder="Requirements"
          className="w-full p-3 border rounded"
          rows={4}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Update Job
        </button>
      </form>
    </div>
  );
};

export default RecruiterEditJob;
