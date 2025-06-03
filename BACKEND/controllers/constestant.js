const { Contestant } = require("../models/contestant");
const { connectToDatabase } = require('../config/connectionURI');

const validateImage = (file) => {
  if (!file) return { valid: true };
  const validFormats = /\.(jpg|jpeg|png|gif)$/i;
  if (!validFormats.test(file.originalname)) {
    return { valid: false, message: 'Invalid image format. Only jpg, jpeg, png, and gif are allowed.' };
  }
  if (!file.mimetype.startsWith('image/')) {
    return { valid: false, message: 'Invalid image type. Only images are allowed.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, message: 'Image size exceeds 5MB limit.' };
  }
  return { valid: true };
};

const parseLastPromiseString = (str) => {
  const positionMatch = str.match(/^(.+?) at /);
  const organizationMatch = str.match(/ at (.+?) for /);
  const durationMatch = str.match(/ for (.+)$/);

  return {
    position: positionMatch ? positionMatch[1].trim() : "",
    organization: organizationMatch ? organizationMatch[1].trim() : "",
    duration: durationMatch ? durationMatch[1].trim() : "",
  };
};

const getAllContestants = async (req, res) => {
  try {
    await connectToDatabase();
    const contestants = await Contestant.find().sort({ createdAt: -1 });
    res.status(200).json(contestants);
  } catch (err) {
    res.status(500).json({ message: "Failed to get contestants", error: err.message });
  }
};

const getContestantById = async (req, res) => {
  try {
    await connectToDatabase();
    const contestant = await Contestant.findById(req.params.id);
    if (!contestant) return res.status(404).json({ message: "Contestant not found" });
    res.status(200).json(contestant);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contestant", error: err.message });
  }
};

const createContestant = async (req, res) => {
  try {
    const { name, party, bio, nidaNumber, position, promises, lastPromises } = req.body;
    const file = req.file;

    if (!name || !party || !bio || !nidaNumber || !position) {
      return res.status(400).json({ message: 'All fields are required except profileImage and lastPromises' });
    }
    if (nidaNumber.length < 5) {
      return res.status(400).json({ message: 'NIDA number must be at least 5 characters long' });
    }
    if (bio.length < 10 || bio.length > 200) {
      return res.status(400).json({ message: 'Bio must be between 10 and 200 characters long' });
    }
    if (party.length < 3 || party.length > 50) {
      return res.status(400).json({ message: 'Party name must be between 3 and 50 characters long' });
    }
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 3 and 50 characters long' });
    }

    let promiseArray = [];
    if (!promises) {
      return res.status(400).json({ message: 'At least one promise is required' });
    }
    if (Array.isArray(promises)) {
      promiseArray = promises;
    } else if (typeof promises === 'string') {
      promiseArray = promises.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }
    if (promiseArray.length < 1) {
      return res.status(400).json({ message: 'At least one promise is required' });
    }
    if (promiseArray.length > 5) {
      return res.status(400).json({ message: 'A maximum of 5 promises is allowed' });
    }

    let previousPosition = null;
    let organization = null;
    let timeServed = null;

    if (lastPromises) {
      const parsedArray = typeof lastPromises === 'string'
        ? lastPromises.split(',').map(p => p.trim()).filter(p => p.length > 0).map(parseLastPromiseString)
        : [];

      if (parsedArray.length > 0) {
        const first = parsedArray[0]; // use only the first one
        previousPosition = first.position;
        organization = first.organization;
        timeServed = first.duration;
      }
    }

    if (file) {
      const imageValidation = validateImage(file);
      if (!imageValidation.valid) {
        return res.status(400).json({ message: imageValidation.message });
      }
    }

    await connectToDatabase();

    const existing = await Contestant.findOne({ nidaNumber });
    if (existing) {
      return res.status(400).json({ message: 'Contestant with this NIDA already exists.' });
    }

    const profileImage = file
      ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      : null;

    const newContestant = new Contestant({
      name,
      party,
      bio,
      nidaNumber,
      promises: promiseArray,
      profileImage,
      position,
      previousPosition,
      organization,
      timeServed
    });

    await newContestant.save();

    res.status(201).json({ contestant: newContestant });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const updateContestant = async (req, res) => {
  try {
    await connectToDatabase();
    console.log(req.body);

    const contestant = await Contestant.findById(req.params.id);
    if (!contestant) return res.status(404).json({ message: "Contestant not found" });

    // Update regular fields except structured ones
    Object.entries(req.body).forEach(([key, value]) => {
      if (!['accomplishments', 'promises', 'previousPromises', 'lastPromises'].includes(key)) {
        contestant[key] = value;
      }
    });

    // Handle promises string
    if (typeof req.body.promises === 'string') {
      contestant.promises = req.body.promises
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    // ✅ Transform accomplishments → previousPromises + top-level fields
    if (Array.isArray(req.body.accomplishments)) {
      const previousPromises = req.body.accomplishments.map(a => ({
        promise: a.promise?.trim() || '',
        fulfilled: Boolean(a.accomplished),
      })).filter(p => p.promise !== '');

      contestant.previousPromises = previousPromises;

      // Use first item for historical top-level info
      const first = req.body.accomplishments[0];
      if (first.previousPosition) contestant.previousPosition = first.previousPosition;
      if (first.timeServed) contestant.timeServed = first.timeServed;
      if (first.organization) contestant.organization = first.organization;
    }

    const updated = await contestant.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating contestant", error: err.message });
  }
};




const deleteContestant = async (req, res) => {
  try {
    await connectToDatabase();

    const deleted = await Contestant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contestant not found" });

    res.status(200).json({ message: "Contestant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting contestant", error: err.message });
  }
};

module.exports = {
  getAllContestants,
  getContestantById,
  createContestant,
  updateContestant,
  deleteContestant,
};
