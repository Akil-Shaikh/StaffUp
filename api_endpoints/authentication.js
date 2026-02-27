const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../data_models/Account');
const protect = require('../middleWare/token_middleware');
const { uploadCV } = require('../middleWare/upload');
const path = require('path');
const fs = require("fs");

// @route   POST /signup
router.post('/signup', uploadCV.single('cv'), async (req, res) => {
  const { name, email, password, role, company, experience } = req.body;
  
  try {
    let user = await Account.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User Exists' });
    
    if (role === "candidate" && !req.file) {
      return res.status(400).json({ msg: "CV is required for candidates" });
    }

    user = new Account({
      name, 
      email, 
      role, 
      meta: { company, experience },
      // Aligned the path with the 'cvs' folder logic
      cvPath: role === "candidate" ? `/uploads/cvs/${req.file.filename}` : undefined
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    
    // Added 'const' to prevent implicit global variable crashes
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST /signin
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
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET /profile
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

// @route   PUT /profile
router.put(
  "/profile",
  protect,
  uploadCV.single("cv"), // Fixed: Changed from upload.single("resume")
  async (req, res) => {
    try {
      const user = await Account.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      if (!user.meta) user.meta = {};
      if (req.body.name) {
        user.name = req.body.name;
      }

      if (user.role === "recruiter" && req.body.company) {
        user.meta.company = req.body.company;
      }
      if (user.role === "candidate") {

        if (req.file) {
          // Delete old resume if it exists
          if (user.cvPath) {
            const oldPath = path.join(__dirname, "..", user.cvPath);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          user.cvPath = `/uploads/cvs/${req.file.filename}`;
        }
      }
      await user.save();
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        msg: "Profile updated successfully",
        user: userResponse
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

module.exports = router;