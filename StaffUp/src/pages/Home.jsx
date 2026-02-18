import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = !!localStorage.getItem('token');
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                Modern <span className="text-blue-600">Recruitment</span> Simplified.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-10">
                The all-in-one platform for companies to find elite talent and for candidates to land their dream roles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                    <>
                        <Link to="/login" className="btn-primary py-4 text-lg">
                            Login to Account
                        </Link>
                        <Link to="/register" className="btn-secondary py-4 text-lg bg-white">
                            Register Now
                        </Link>
                    </>
                ) : (
                    <>
                        {user?.role === "candidate" ? (<>
                            <Link to="/jobs" className="btn-primary py-4 text-lg">
                                Browse All Jobs
                            </Link>
                            <Link to="/recruiter/dashboard" className="btn-secondary py-4 text-lg">
                                Go to Dashboard
                            </Link>
                        </>) : (
                            <> 
                                <Link to="/recruiter/dashboard" className="btn-primary py-4 text-lg">
                                    Go to Dashboard
                                </Link></>
                        )}
                    </>
                )}
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">For Candidates</h3>
                    <p className="text-gray-600 text-sm">One-click applications with resume parsing and status tracking.</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">For Recruiters</h3>
                    <p className="text-gray-600 text-sm">Manage the entire funnel from "Applied" to "Hired" in one dashboard.</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">Real-time Stats</h3>
                    <p className="text-gray-600 text-sm">Track openings, shortlisted candidates, and dropped profiles instantly.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;