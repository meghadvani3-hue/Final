const express = require('express');
const router = express.Router();
const ProviderProfile = require('../models/ProviderProfile');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

// @route   GET /api/providers
// @desc    Get all active provider profiles with search filters and pagination
// @access  Public
router.get('/', async (req, res) => {
  const { minPrice, maxPrice, tags, page, limit } = req.query;

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (req.query.isLive !== undefined) {
    query.isLive = req.query.isLive === 'true';
  }

  // Price range filters (on hourlyRate)
  if (minPrice || maxPrice) {
    query.hourlyRate = {};
    if (minPrice) query.hourlyRate.$gte = Number(minPrice);
    if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
  }

  // Tags filter (comma-separated list)
  if (tags) {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagsArray };
  }

  try {
    const profiles = await ProviderProfile.find(query)
      .populate('userId', 'name email phone role')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await ProviderProfile.countDocuments(query);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: profiles
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/providers/:id
// @desc    Get single provider profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id)
      .populate('userId', 'name email phone role');

    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/providers/profile
// @desc    Create or update own provider profile
// @access  Private
router.post('/profile', [auth, upload.array('photos', 5)], async (req, res) => {
  const { bio, tags, hourlyRate, dailyRate, monthlyRate, existingPhotos } = req.body;

  let tagsArray = [];
  if (tags) {
    tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  }

  try {
    let profile = await ProviderProfile.findOne({ userId: req.user.userId });

    // Stream uploaded files to Cloudinary
    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      newPhotos = await Promise.all(uploadPromises);
    }

    // Determine the remaining existing photos
    let existingPhotosArray = [];
    if (existingPhotos !== undefined) {
      if (Array.isArray(existingPhotos)) {
        existingPhotosArray = existingPhotos;
      } else if (existingPhotos) {
        existingPhotosArray = [existingPhotos];
      }
    } else if (profile) {
      // If req.files is defined, this was a multipart form submission where all photos were deleted.
      // Otherwise (like a partial JSON update), preserve the current photos.
      if (req.files) {
        existingPhotosArray = [];
      } else {
        existingPhotosArray = profile.photos || [];
      }
    }

    const profileFields = {
      userId: req.user.userId,
      bio,
      tags: tagsArray,
      hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
      dailyRate: dailyRate ? Number(dailyRate) : 0,
      monthlyRate: monthlyRate ? Number(monthlyRate) : 0,
      photos: [...existingPhotosArray, ...newPhotos]
    };

    if (profile) {
      // Update
      profile = await ProviderProfile.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: profileFields },
        { new: true }
      );
      return res.json({ message: 'Profile updated successfully', profile });
    } else {
      // Create
      profile = new ProviderProfile(profileFields);
      await profile.save();
      return res.status(201).json({ message: 'Profile created successfully', profile });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/providers/toggle-live
// @desc    Toggle isLive status of own profile
// @access  Private
router.put('/toggle-live', auth, async (req, res) => {
  try {
    let profile = await ProviderProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found. Please create a profile first.' });
    }

    profile.isLive = !profile.isLive;
    await profile.save();

    res.json({
      message: `Provider status set to ${profile.isLive ? 'Live' : 'Offline'}`,
      isLive: profile.isLive,
      profile
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;