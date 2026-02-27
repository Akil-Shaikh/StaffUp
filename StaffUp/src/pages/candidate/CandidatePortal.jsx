import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CandidatePortal = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const loadFeed = async () => {
            const res = await API.get('/candidate/feed');
            setJobs(res.data);
        };

        const interval = setInterval(() => {
            loadFeed();
        }, 5000);
        loadFeed();
    }, []);

    const getTimeLabel = (createdAt, updatedAt) => {
        const isUpdated = createdAt !== updatedAt;
        const time = isUpdated ? updatedAt : createdAt;

        return isUpdated
            ? `Updated ${dayjs(time).fromNow()}`
            : `Created ${dayjs(time).fromNow()}`;
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-black mb-8 italic">
                Available <span className="text-blue-600">Openings</span>
            </h1>

            <div className="grid gap-6">
                {jobs.map(job => (
                    <div
                        key={job._id}
                        className="card hover:border-blue-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center"
                    >
                        <div>
                            <h2 className="text-2xl font-bold">{job.title}</h2>

                            <p className="text-slate-500 font-medium">
                                {job.owner.meta.company} • {job.dept} • {job.location}
                            </p>

                            <div className="mt-2 flex gap-4 items-center flex-wrap">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded italic">
                                    ₹{job.salary}
                                </span>

                                <span className="text-xs font-bold text-slate-400 italic">
                                    {job.slots.total - job.slots.filled} slots remaining
                                </span>

                                <span className="text-xs text-slate-400 italic">
                                    {getTimeLabel(job.createdAt, job.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <Link
                            to={`/jobs/${job._id}`}
                            className="btn-primary mt-4 md:mt-0"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidatePortal;
