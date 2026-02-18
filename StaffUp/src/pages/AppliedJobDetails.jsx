import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AppliedJob = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);

    useEffect(() => {
        API.get(`candidate/applied/${id}`)
            .then(res => setApplication(res.data))
            .catch(err => console.error("Error fetching application details", err));
    }, [id]);

    if (!application) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            </div>
        );
    }
    const job = application.vacancyId;
    const statusColor =
        application.status === "Accepted"
            ? "bg-green-100 text-green-700"
            : application.status === "Rejected"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700";

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">

            {/* HEADER */}
            <h1 className="text-5xl font-black italic text-slate-900">
                {job.title}
            </h1>

            <div className="flex-row gap-4 mb-8">
                <h5 className=" text-blue-700  mb-5 text-l font-bold uppercase">
                    Posted by: {job.owner.meta.company}
                </h5>
                <h5 className="px-3 py-1  text-slate-700 text-s font-bold uppercase">
                    Department : {job.dept}
                </h5>
                <h5 className="px-3 py-1  text-slate-700 text-s font-bold uppercase">
                    Location : {job.location}
                </h5>
                <h5 className="px-3 py-1  text-slate-700 text-s font-bold uppercase">
                    Salary : ₹{job.salary}
                </h5>
            </div>

            {/* JOB DESCRIPTION */}
            <div className="space-y-6 text-slate-700 leading-relaxed mb-12">
                <section>
                    <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 mb-3 uppercase">
                        Role Description
                    </h3>
                    <p className="bg-white p-4 rounded-xl border shadow-sm">
                        {job.description}
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold border-b-2 border-slate-100 pb-2 mb-3 uppercase">
                        Technical Specifications
                    </h3>
                    <p className="bg-white p-4 rounded-xl border shadow-sm whitespace-pre-line">
                        {job.requirements}
                    </p>
                </section>
            </div>

            {/* APPLICATION DETAILS */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black italic">
                        Your <span className="text-blue-600">Application</span>
                    </h2>
                    <h2 className="text-xl font-black italic"> Status : <span
                        className={`px-4 py-1 rounded-full text-sm font-black uppercase
      ${application.status === 'Hired'
                                ? 'bg-green-100 text-green-700'
                                : application.status === 'Dropped'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                    >
                        {application.status}
                    </span></h2>

                </div>

                <div className="space-y-4 text-slate-700">

                    <div>
                        <p className="text-xs uppercase font-bold text-slate-400">
                            Experience Submitted
                        </p>
                        <p className="text-lg font-bold">
                            {application.details?.exp} year(s)
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase font-bold text-slate-400">
                            Your Notes
                        </p>
                        <p className="bg-slate-50 p-4 rounded-lg border">
                            {application.details?.notes || "No notes provided."}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase font-bold text-slate-400">
                            Applied
                        </p>
                        <p className="italic">
                            {dayjs(application.createdAt).fromNow()}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase font-bold text-slate-400">
                            Slot Status
                        </p>
                        <p>
                            {job.slots.filled} / {job.slots.total} positions filled
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default AppliedJob;
