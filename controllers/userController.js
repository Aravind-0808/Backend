const express = require('express');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');

const router = express.Router();

// QR code file upload setup using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "qrcode/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR-EMAIL',
    pass: 'YOUR-APP-PASSWORD',
  },
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register user with QR code
router.post('/', upload.single('qrcodeImage'), async (req, res) => {
  const { name, email, phone, address, password, type } = req.body;
  const qrcodeImage = req.file ? req.file.filename : null;

  if (!name || !email || !phone || !address || !password || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = new User({ name, email, phone, address, password, type, qrcodeImage });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get user QR code image by email
router.get('/qrcode/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ qrcodeImage: user.qrcodeImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update QR code only
router.put('/update-qrcode/:id', upload.single('qrcodeImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'QR code image is required' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { qrcodeImage: req.file.filename },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'QR code updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user details
router.put('/:id', async (req, res) => {
  const { name, email, password, type } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.type = type || user.type;
    if (password) user.password = password;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    await user.save();

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ error: 'Failed to send OTP' });
      res.json({ message: 'OTP sent successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password using OTP
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
