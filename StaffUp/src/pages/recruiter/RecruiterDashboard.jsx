import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RecruiterDashboard = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("recent");
    const [active2Tab, setActive2Tab] = useState("live");
    const [recentApps, setRecentApps] = useState([]);
    const [hiredApps, setHiredApps] = useState([]);

    // 🔥 Filters
    const [search, setSearch] = useState("");
    const [minExp, setMinExp] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortByDate, setSortByDate] = useState("newest");

    const [loading, setLoading] = useState(true);
    const liveJobs = jobs.filter(job => !job.isClosed);
    const closedJobs = jobs.filter(job => job.isClosed);

    useEffect(() => {
        const fetchRecruiterData = async () => {
            try {
                const jobRes = await API.get('/recruit/posted');
                const res = await API.get("/recruit/applications");

                setJobs(jobRes.data);
                setRecentApps(res.data.recent);
                setHiredApps(res.data.hired);
            } catch (err) {
                console.error("Dashboard Sync Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiterData();
        const interval = setInterval(fetchRecruiterData, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 🔥 Apply Filters Based on Active Tab
    const baseApps = activeTab === "recent" ? recentApps : hiredApps;

    const filteredApps = baseApps
        .filter(app => {
            const nameMatch = app.applicantId?.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const expMatch = minExp
                ? Number(app.details?.exp || 0) >= Number(minExp)
                : true;

            // FIXED: Automatically ignore status filter if we are on the 'hired' tab
            const statusMatch = activeTab === "hired" || statusFilter === "All"
                    ? true
                    : app.status === statusFilter;

            return nameMatch && expMatch && statusMatch;
        })
        .sort((a, b) => {
            if (sortByDate === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 italic">
                        RECRUITER <span className="text-blue-600">CONSOLE</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Manage your hiring pipeline.
                    </p>
                </div>

                <Link
                    to="/recruiter/post-job"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition"
                >
                    + Post New Job
                </Link>
            </div>

            {/* Job Overview Cards */}

            {/* 🔹 LIVE JOBS */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActive2Tab("live")}
                    className={`px-6 py-3 font-bold transition ${active2Tab === "live"
                        ? "border-b-4 border-blue-600 text-blue-600"
                        : "text-slate-400"
                        }`}
                >
                    Live Jobs ({liveJobs.length})
                </button>

                <button
                    onClick={() => setActive2Tab("closed")}
                    className={`px-6 py-3 font-bold transition ${active2Tab === "closed"
                        ? "border-b-4 border-red-600 text-red-600"
                        : "text-slate-400"
                        }`}
                >
                    Closed Jobs ({closedJobs.length})
                </button>
            </div>

            {active2Tab === "live" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                    {liveJobs.length === 0 ? (
                        <p className="text-gray-500">No live jobs available.</p>
                    ) : (
                        liveJobs.map(job => (
                            <Link key={job._id} to={`/recruiter/job/${job._id}`} className='block' >
                                <div className={`p-6 bg-white rounded-xl shadow-md border-t-4 hover:shadow-lg transition-all cursor-pointer ${job.slots.filled >= job.slots.total ? 'border-red-500' : 'border-blue-500'}`} >
                                    <h3 className="font-bold text-sm truncate text-slate-700">
                                        {job.title}
                                    </h3>
                                    <p className="text-2xl font-black mt-1">
                                        {job.slots.filled} / {job.slots.total}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Slots Occupied
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* 🔹 CLOSED JOBS */}
            {active2Tab === "closed" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {closedJobs.length === 0 ? (
                        <p className="text-gray-500">No closed jobs.</p>
                    ) : (
                        closedJobs.map(job => (
                            <Link key={job._id} to={`/recruiter/job/${job._id}`} className='block' >
                                <div className='p-6 bg-white rounded-xl shadow-md border-t-4 hover:shadow-lg transition-all cursor-pointer border-red-500' >
                                    <h3 className="font-bold text-sm truncate text-slate-700">
                                        {job.title}
                                    </h3>
                                    <p className="text-2xl font-black text-red-600 mt-1">
                                        Closed
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab("recent")}
                    className={`px-6 py-3 font-bold transition ${activeTab === "recent"
                        ? "border-b-4 border-blue-600 text-blue-600"
                        : "text-slate-400"
                        }`}
                >
                    Recent Applications ({recentApps.length})
                </button>

                <button
                    onClick={() => setActiveTab("hired")}
                    className={`px-6 py-3 font-bold transition ${activeTab === "hired"
                        ? "border-b-4 border-green-600 text-green-600"
                        : "text-slate-400"
                        }`}
                >
                    Hired Applicants ({hiredApps.length})
                </button>
            </div>

            {/* Filters */}
            {/* FIXED: Dynamic grid columns so it scales beautifully when the dropdown is hidden */}
            <div className={`grid grid-cols-1 ${activeTab === "recent" ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-6`}>

                <input
                    type="text"
                    placeholder="Search by name..."
                    className="input-field p-3 border rounded-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Min Experience"
                    className="input-field p-3 border rounded-lg"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                />

                {/* FIXED: Conditionally render Status Filter ONLY on Recent tab */}
                {activeTab === "recent" && (
                    <select
                        className="input-field p-3 border rounded-lg"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Dropped">Dropped</option>
                    </select>
                )}

                <select
                    className="input-field p-3 border rounded-lg"
                    value={sortByDate}
                    onChange={(e) => setSortByDate(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow border border-slate-100">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4 text-left">Candidate</th>
                            <th className="px-6 py-4 text-left">Role</th>
                            <th className="px-6 py-4 text-left">Experience</th>
                            <th className="px-6 py-4 text-left ">
                                {activeTab === "recent" ? "Applied" : "Hired"}
                            </th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">View</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredApps.map(app => (
                            <tr key={app._id} className="border-t hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    <p className="font-bold">{app.applicantId?.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {app.applicantId?.email}
                                    </p>
                                </td>

                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-700">
                                        {app.vacancyId?.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                                        {app.vacancyId?.dept}
                                    </p>
                                </td>

                                <td className="px-6 py-4">
                                    {app.details?.exp || "-"}
                                </td>

                                <td className="px-6 py-4">
                                    {activeTab === "recent"
                                        ? dayjs(app.createdAt).fromNow()
                                        : new Date(app.updatedAt).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase
                                            ${app.status === 'Hired'
                                                ? 'bg-green-100 text-green-700'
                                                : app.status === 'Dropped'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {app.status}
                                    </span>
                                </td>

                                <td
                                    className="px-6 py-4 hover:bg-blue-50/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/recruiter/application/${app._id}`)}
                                >
                                    <span className="text-blue-600 font-bold text-xs">
                                        Review Details →
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {filteredApps.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">
                                    No applications found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default RecruiterDashboard;