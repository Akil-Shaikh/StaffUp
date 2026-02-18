const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../data_models/Account');
const protect = require('../middleWare/token_middleware');
const upload = require("../middleWare/uploadResume");
const path= require('path');
const fs = require("fs");


router.post('/signup', upload.single("resume"), async (req, res) => {
  const { name, email, password, role, company, experience } = req.body;
  try {
    let user = await Account.findOne({ email });
    if (user) return res.status(400).json({ 'msg': 'User Exists' });
    if (role === "candidate" && !req.file) {
      return res.status(400).json({ msg: "Resume is required for candidates" });
    }

    user = new Account({
      name, email, password, role, meta: { company, experience },
      resume: role === "candidate" ? `/uploads/resumes/${req.file.filename}` : undefined
    });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    payload = { user: { id: user.id, role: user.role } }
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Account.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Creds' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Creds' });
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await Account.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.put(
  "/profile",
  protect,
  upload.single("resume"),
  async (req, res) => {
    try {
      const user = await Account.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // ✅ Update common fields
      if (req.body.name) {
        user.name = req.body.name;
      }

      // ✅ Recruiter update
      if (user.role === "recruiter") {
        if (req.body.company) {
          user.meta.company = req.body.company;
        }
      }

      // ✅ Candidate update
      if (user.role === "candidate") {

        if (req.body.experience) {
          user.meta.experience = req.body.experience;
        }

        // ✅ Resume Replacement Logic
        if (req.file) {

          // Delete old resume if exists
          if (user.resume) {
            const oldPath = path.join(__dirname, "..", user.resume);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }

          user.resume = `/uploads/resumes/${req.file.filename}`;
        }
      }

      await user.save();

      res.json({
        msg: "Profile updated successfully",
        user
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);


module.exports = router;