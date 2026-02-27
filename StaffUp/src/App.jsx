import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CandidatePortal from './pages/candidate/CandidatePortal';
import JobDetails from './pages/candidate/JobDetails';
import PostJob from './pages/recruiter/PostJob';
import Register from './pages/Register';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/profile';
import Logout from './pages/Logout';
import ApplicationDetails from './pages/recruiter/ApplicationDetails'
import RecruiterJobDetails from './pages/recruiter/RecruiterJobDetails';
import AppliedJob from './pages/candidate/AppliedJobDetails';
import RecruiterEditJob from './pages/recruiter/RecruiterEditJob';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="candidate/dashboard/applied/:id" element={<AppliedJob/>}/>
          <Route path="/jobs" element={
            <ProtectedRoute roleRequired="candidate">
              <CandidatePortal />
            </ProtectedRoute>} />
          <Route path="/recruiter/application/:id" element={
            <ProtectedRoute roleRequired="recruiter">
              <ApplicationDetails />
            </ProtectedRoute>} />
          <Route path="recruiter/job/:id" element={
            <ProtectedRoute roleRequired="recruiter">
              <RecruiterJobDetails />
            </ProtectedRoute>} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute roleRequired="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/edit-job/:id" element={
            <ProtectedRoute roleRequired="recruiter">
              <RecruiterEditJob />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={<Profile/>}/>
          <Route path="/candidate/dashboard" element={
            <ProtectedRoute roleRequired="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}
export default App;