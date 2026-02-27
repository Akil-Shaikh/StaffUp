const express = require('express');
const router = express.Router();
const protect = require('../middleWare/token_middleware');

// Note: Ensure these paths point to your updated schema files
const Vacancy = require('../data_models/Vacancy'); 
const Job_applications = require('../data_models/Application');

router.use(protect);

router.post('/create', async (req, res) => {
  try {
    if (req.user.role !== "recruiter") return res.status(403).json({ "msg": "Method Not Allowed" });
    const { title, dept, location, salary, description, requirements, totalSlots } = req.body;

    const newJob = new Vacancy({
      title, dept, location, salary, description, requirements,
      slots: {
        total: totalSlots || 3,
        filled: 0
      },
      owner: req.user.id
    });

    const savedJob = await newJob.save();
    res.json(savedJob);
  } catch (err) {
    console.error("Post Error:", err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/posted', async (req, res) => {
  if (req.user.role !== "recruiter") return res.status(403).json({ "msg": "Method Not Allowed" });
  try {
    const jobs = await Vacancy.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id).populate('owner', 'name meta.company');
    if (!job) return res.status(404).json({ msg: 'Vacancy not found' });
    if (job.owner._id.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
    
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/details/:id', async (req, res) => {
  try {
    const app = await Job_applications.findById(req.params.id)
      .populate('vacancyId')
      // FIXED: 'resume' changed to 'cvPath' to match Account_jwt
      .populate('applicantId', 'name email meta cvPath'); 

    if (!app) return res.status(404).json({ msg: 'Application not found' });
    res.json(app);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/applications', async (req, res) => {
  if (req.user.role !== "recruiter") return res.status(403).json({ msg: "Access denied" });
  try {
    const apps = await Job_applications.find({ jobRemoved: false })
      .populate('vacancyId')
      .populate('applicantId', 'name email');
      
    // FIXED: Added 'a.vacancyId &&' to prevent server crash if a vacancy was hard-deleted
    const filtered = apps.filter(a => a.vacancyId && a.vacancyId.owner.toString() === req.user.id);
    
    const recent = filtered.filter(app => app.status !== "Hired");
    const hired = filtered.filter(app => app.status === "Hired");

    res.json({ recent, hired });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get('/job-applications/:id', async (req, res) => {
  try {
    const apps = await Job_applications.find({ vacancyId: req.params.id })
      .populate('vacancyId', 'owner')
      .populate('applicantId', 'name email')
      .select("status createdAt updatedAt details.exp");
      
    // FIXED: Added vacancyId safety check
    if (apps.length > 0 && apps[0].vacancyId) {
      if (apps[0].vacancyId.owner.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Access denied" });
      }
    } 
    
    const recent = apps.filter(app => app.status !== "Hired");
    const hired = apps.filter(app => app.status === "Hired");

    res.json({ recent, hired });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ msg: "Status is required" });
    
    // We populate vacancyId so we can check the current slots
    const application = await Job_applications.findById(req.params.id).populate("vacancyId");
    if (!application) return res.status(404).json({ msg: "Application not found" });
    
    const previousStatus = application.status;
    const job = application.vacancyId;

    // 🔥 CRITICAL FIX: Capacity Check
    if (status === "Hired" && previousStatus !== "Hired") {
      if (job.slots.filled >= job.slots.total) {
        return res.status(400).json({ 
          msg: `Cannot hire: All ${job.slots.total} slots for this role are already filled.` 
        });
      }
      // If there is space, increment the filled slots
      await Vacancy.findByIdAndUpdate(job._id, { $inc: { "slots.filled": 1 } });
    }
    
    // If they are un-hiring someone, free up a slot
    if (previousStatus === "Hired" && status !== "Hired") {
      await Vacancy.findByIdAndUpdate(job._id, { $inc: { "slots.filled": -1 } });
    }

    // Finally, save the new status
    application.status = status;
    await application.save();
    
    res.json({ msg: "Status updated successfully", application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/update-job/:id", protect, async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    if (job.owner.toString() !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    const updatedJob = await Vacancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.put("/close-job/:id", protect, async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    if (job.owner.toString() !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    job.isClosed = true; // Ensure this field exists in your Vacancy_jwt schema
    
    await Job_applications.updateMany(
      { vacancyId: job._id },
      {
        $set: {
          jobRemoved: true,
          jobRemovedMessage: "This job post was removed by the recruiter.",
          status: "Closed"
        }
      }
    );

    await job.save();
    res.json({ msg: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;