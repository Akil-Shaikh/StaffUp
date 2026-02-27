const express = require('express');
const router = express.Router();
const protect = require('../middleWare/token_middleware');
const Job_applications = require('../data_models/Application');
const Vacancy = require('../data_models/Vacancy');
const { uploadResume } = require('../middleWare/upload'); 

router.use(protect);

router.get('/my-history', async (req, res) => {
  try {
    const apps = await Job_applications.find({ applicantId: req.user.id })
      .populate('vacancyId')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/applied/:id', async (req, res) => {
  try {
    const apps = await Job_applications.findOne({ _id: req.params.id })
      .populate({
        path: 'vacancyId',
        populate: {
          path: 'owner',
          select: 'meta.company',
          // FIXED: This MUST perfectly match your mongoose.model('Account_jwt', ...) definition
          model: 'Account_jwt' 
        }
      });
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/feed', async (req, res) => {
  try {
    const applied = await Job_applications.find({ applicantId: req.user.id }).select('vacancyId').lean();
    const appliedIds = applied.map(a => a.vacancyId);

    const jobs = await Vacancy.find({ _id: { $nin: appliedIds }, isClosed: { $ne: true } }) // Safer check for isClosed
      .populate('owner', 'meta.company')
      .select('slots title dept location salary createdAt updatedAt')
      .lean();

    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    const job = await Vacancy.findById(req.params.id).populate('owner', 'name meta.company');
    if (!job) return res.status(404).json({ msg: 'Vacancy not found' });
    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/check-applied/:id', async (req, res) => {
  const exists = await Job_applications.findOne({
    vacancyId: req.params.id,
    applicantId: req.user.id
  });
  res.json({ applied: !!exists });
});

router.post('/apply', uploadResume.single('resume'), async (req, res) => {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ msg: 'Recruiters are not allowed to apply for jobs.' });
    }

    try {
      const { vacancyId, experience, expectations } = req.body; 

      const vacancy = await Vacancy.findById(vacancyId);
      if (!vacancy) return res.status(404).json({ msg: 'Vacancy not found' });
      if (vacancy.slots.filled >= vacancy.slots.total) return res.status(400).json({ msg: 'Application closed: No slots remaining.' });

      const alreadyApplied = await Job_applications.findOne({ vacancyId: vacancyId, applicantId: req.user.id });
      if (alreadyApplied) return res.status(400).json({ msg: "You have already applied for this job." });

      if (!req.file) return res.status(400).json({ msg: "A specific resume file is required for this application." });

      // Correctly formats details and resumePath for Application_jwt
      const entry = new Job_applications({ 
        vacancyId,
        applicantId: req.user.id,
        details: {
            exp: experience,
            notes: expectations
        },
        resumePath: `/uploads/resumes/${req.file.filename}` 
      });

      await entry.save();
      res.json({ msg: 'Applied successfully', entry });
    } catch (err) {
      console.error("Apply Route Error:", err);
      res.status(500).send('Server Error');
    }
});

module.exports = router;