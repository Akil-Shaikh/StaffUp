import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import JobDetails from '../candidate/JobDetails';

dayjs.extend(relativeTime);

const RecruiterJobDetails = () => {
    const { id } = useParams();

    const [job, setJob] = useState(null);
    const [activeTab, setActiveTab] = useState("recent");
    const [recentApps, setRecentApps] = useState([]);
    const [hiredApps, setHiredApps] = useState([]);

    // 🔥 Filters
    const [search, setSearch] = useState("");
    const [minExp, setMinExp] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortByDate, setSortByDate] = useState("newest");

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    useEffect(() => {
        const loadData = async () => {
            try {
                const jobRes = await API.get(`/recruit/view/${id}`);
                setJob(jobRes.data);

                const appRes = await API.get(`/recruit/job-applications/${id}`);
                setRecentApps(appRes.data.recent);
                setHiredApps(appRes.data.hired);
            } catch (err) {
                console.error("Error loading recruiter job details", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleclose = async () => {
        const confirmclose = window.confirm("Are you sure you want to close this job?");
        if (!confirmclose) return;

        try {
            await API.put(`/recruit/close-job/${id}`);
            alert("Job closed successfully");
            navigate("/recruiter/dashboard");
        } catch (err) {
            console.error("close failed", err);
            alert("Failed to close job");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            </div>
        );
    }
    const baseApps = activeTab === "recent" ? recentApps : hiredApps;

    const filteredApps = baseApps
        .filter(app => {
            const nameMatch = app.applicantId?.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const expMatch = minExp
                ? Number(app.details?.exp || 0) >= Number(minExp)
                : true;

            const statusMatch =
                statusFilter === "All"
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
        <div className="max-w-6xl mx-auto py-12 px-4">

            {/* JOB DETAILS SECTION */}
            <div>
                <div className='flex justify-between'>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 italic">
                        {job.title}

                    </h1>
                    {
                        !job.isClosed && <div>
                            <Link to={`/recruiter/edit-job/${job._id}`}>
                                <button className='text-2xl  text-white bg-blue-400 rounded-full px-5 py-2'>Edit</button>
                            </Link>
                            <button className='text-2xl text-white bg-orange-800 rounded-full ml-2 px-3 py-2' onClick={handleclose}>Close</button>
                        </div>
                    }

                </div>

                <div className="flex gap-4 mb-8 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                        {job.dept}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase">
                        {job.location}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                        {job.salary}
                    </span>
                    {!job.isClosed ?
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">
                            {job.slots.filled} / {job.slots.total} Filled
                        </span> :
                        <span className="px-3 py-1 bg-purple-200 text-red-700 rounded-full text-xs font-bold uppercase">
                            closed
                        </span>
                    }
                </div>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <section>
                        <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 text-slate-900 mb-3 uppercase tracking-tight">
                            Role Description
                        </h3>
                        <p className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            {job.description || "No description provided."}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 text-slate-900 mb-3 uppercase tracking-tight">
                            Technical Specifications
                        </h3>
                        <p className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm whitespace-pre-line">
                            {job.requirements || "No specific requirements listed."}
                        </p>
                    </section>
                </div>
            </div>

            {/* RECENT APPLICATIONS SECTION */}
            {!job.isClosed &&
                <>
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="input-field"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Min Experience"
                            className="input-field"
                            value={minExp}
                            onChange={(e) => setMinExp(e.target.value)}
                        />

                        <select
                            className="input-field"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Dropped">Dropped</option>
                        </select>

                        <select
                            className="input-field"
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
                </>}
        </div>
    );
};

export default RecruiterJobDetails;
