const express = require('express');
const router = express.Router();
const protect = require('../middleWare/token_middleware');
const Job_applications = require('../data_models/Application');
const Vacancy = require('../data_models/Vacancy');

router.use(protect)

// applicant past applications used in candidatedashboard.jsx
router.get('/my-history', async (req, res) => {
  try {
    // applicantId must match the field in your Job_applications model
    const apps = await Job_applications.find({ applicantId: req.user.id })
      .populate('vacancyId')
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// used in applied jobs to get details
router.get('/applied/:id', async (req, res) => {
  const application_id = req.params.id;
  try {
    // applicantId must match the field in your Job_applications model
    const apps = await Job_applications.findOne({ _id: application_id })
      .populate({
        path: 'vacancyId',
        populate: {
          path: 'owner',
          select: 'meta.company',
          model: 'Account'   // must match model name
        }
      });
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});






//  Get all vacancies for candidates used to browse all jobs in candidateprotal.jsx
router.get('/feed', async (req, res) => {
  try {
    const applied = await Job_applications
      .find({ applicantId: req.user.id })
      .select('vacancyId')
      .lean();

    const appliedIds = applied.map(a => a.vacancyId);

    const jobs = await Vacancy
      .find({ _id: { $nin: appliedIds } , isClosed: false })
      .populate('owner', 'meta.company')
      .select('slots title dept location salary createdAt updatedAt')
      .lean();

    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


//  Get a single vacancy detail used in jobdetails.jsx to display job and apply for job using /apply
router.get('/view/:id', async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id).populate('owner', 'name meta.company');
    if (!job) return res.status(404).json({ msg: 'Vacancy not found' });
    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// used to check if job is applied to or not
router.get('/check-applied/:id', async (req, res) => {
  const exists = await Job_applications.findOne({
    vacancyId: req.params.id,
    applicantId: req.user.id
  });

  res.json({ applied: !!exists });
});

// used in jobdetails.jsx for applying the job 
router.post('/apply', async (req, res) => {
  if (req.user.role !== "candidate") return res.status(400).json({ 'msg': 'Not allowed to apply' });
  try {
    const { vacancyId } = req.body;
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({ msg: 'Vacancy not found' });
    }
    const alreadyApplied = await Job_applications.findOne({
      vacancyId: req.body.vacancyId,
      applicantId: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({
        msg: "You have already applied for this job"
      });
    }
    if (vacancy.slots.filled >= vacancy.slots.total) {
      return res.status(400).json({ msg: 'No slots remaining' });
    }
    const entry = new Job_applications({ ...req.body, applicantId: req.user.id });
    await entry.save();

    res.json({ msg: 'Applied successfully', entry });

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;