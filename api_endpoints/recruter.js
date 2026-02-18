const express = require('express');
const router = express.Router();
const protect = require('../middleWare/token_middleware');
const Vacancy = require('../data_models/Vacancy');
const Job_applications = require('../data_models/Application');

// @route   GET api/hiring/mine
// @desc    Get recruiter's specific vacancies
router.use(protect)

// Create a new vacancy used in postjob.jsx
router.post('/create', async (req, res) => {
  try {
    if (req.user.role !== "recruiter") return res.status(400).json({ "msg": "Method Not Allowed" })
    const { title, dept, location, salary, description, requirements, slots } = req.body;
    const newJob = new Vacancy({
      title,
      dept,
      location,
      salary,
      description,
      requirements,
      slots: {
        total: slots?.total || 3,
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



// get all vacancies posted by a particular recruiter used in RecruiterDashboard.jsx
router.get('/posted', async (req, res) => {
  if (req.user.role !== "recruiter") return res.status(400).json({ "msg": "Method Not Allowed" })
  try {
    const jobs = await Vacancy.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// used to get details about a single job used in recruiter job details
router.get('/view/:id', async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id).populate('owner', 'name meta.company');
    if (job.owner._id != req.user.id) return res.status(200).json({ msg: 'not allowed' });
    if (!job) return res.status(404).json({ msg: 'Vacancy not found' });
    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// USed in applicationdetails.jsx for recruiter to view candidates application and weather to hire or not
router.get('/details/:id', async (req, res) => {
  try {
    const app = await Job_applications.findById(req.params.id)
      .populate('vacancyId')
      .populate('applicantId', 'name email meta resume');

    if (!app) return res.status(404).json({ msg: 'Application not found' });
    res.json(app);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// all applications used in RecruiterDashboard.jsx
router.get('/applications', async (req, res) => {
  if (req.user.role !== "recruiter")
    return res.status(403).json({ msg: "Access denied" });
  try {
    const apps = await Job_applications.find({jobRemoved:false}).populate('vacancyId').populate('applicantId', 'name email');
    const filtered = apps.filter(a => a.vacancyId.owner.toString() === req.user.id);
    const recent = filtered.filter(app => app.status !== "Hired");
    const hired = filtered.filter(app => app.status === "Hired");

    res.json({
      recent,
      hired
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get('/job-applications/:id', async (req, res) => {
  const vac_id = req.params.id;
  try {
    const apps = await Job_applications.find({ vacancyId: vac_id }).populate('vacancyId', 'owner').populate('applicantId', 'name email').select("status createdAt updatedAt details.exp");
    if(apps.length > 0){
      if (apps[0]?.vacancyId.owner != req.user.id) return res.status(403).json({ msg: "Access denied" });
      console.log(apps[0].vacancyId.owner)
    } 
    const recent = apps.filter(app => app.status !== "Hired");
    const hired = apps.filter(app => app.status === "Hired");

    res.json({
      recent,
      hired
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// PATCH: Update application status
router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }
    const application = await Job_applications.findById(id).populate("vacancyId");

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    const previousStatus = application.status;
    // Update status
    application.status = status;
    await application.save();
    if (status === "Hired" && previousStatus !== "Hired") {
      await Vacancy.findByIdAndUpdate(application.vacancyId._id, {
        $inc: { "slots.filled": 1 }
      });
    }
    if (previousStatus === "Hired" && status !== "Hired") {
      await Vacancy.findByIdAndUpdate(application.vacancyId._id, {
        $inc: { "slots.filled": -1 }
      });
    }
    res.json({
      msg: "Status updated successfully",
      application
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// edit job details
router.put("/update-job/:id", protect, async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Only creator can edit
    if (job.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updatedJob = await Vacancy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});


router.put("/close-job/:id", protect, async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    job.isClosed = true;
    
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
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;