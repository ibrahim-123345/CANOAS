const {Contestant }= require("../models/contestant");
const { connectToDatabase } = require('../config/connectionURI');



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
    const { name, party, bio, nidaNumber, promises } = req.body;
    const profileImage = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;    console.log(req.file);
    if (!name || !party || !bio || !nidaNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (nidaNumber.length < 5) {
      return res.status(400).json({ message: 'NIDA number must be at least 5 characters long' });
    }
    if (bio.length < 10) {
      return res.status(400).json({ message: 'Bio must be at least 10 characters long' });
    }
    if (bio.length > 200) {
      return res.status(400).json({ message: 'Bio must be less than 200 characters long' });
    }
    if (party.length < 3) {
      return res.status(400).json({ message: 'Party name must be at least 3 characters long' });
    }
    if (party.length > 50) {
      return res.status(400).json({ message: 'Party name must be less than 50 characters long' });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
    if (name.length > 50) {
      return res.status(400).json({ message: 'Name must be less than 50 characters long' });
    }
    if (promises.length < 1) {
      return res.status(400).json({ message: 'At least one promise is required' });
    }
    if (promises.length > 5) {
      return res.status(400).json({ message: 'A maximum of 5 promises is allowed' });
    }
    if (profileImage && !/\.(jpg|jpeg|png|gif)$/.test(profileImage)) {
      return res.status(400).json({ message: 'Invalid image format. Only jpg, jpeg, png, and gif are allowed.' });
    }
    if (profileImage && req.file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({ message: 'Image size exceeds 5MB limit.' });
    }
    if (profileImage && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Invalid image type. Only images are allowed.' });
    }
    if (profileImage && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image size exceeds 5MB limit.' });
    }
    if (profileImage && !/\.(jpg|jpeg|png|gif)$/.test(profileImage)) {
      return res.status(400).json({ message: 'Invalid image format. Only jpg, jpeg, png, and gif are allowed.' });
    }
    if (profileImage && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Invalid image type. Only images are allowed.' });
    }
    const promiseArray = Array.isArray(promises)
      ? promises
      : promises.split(',').map(p => p.trim());

      await connectToDatabase();

    const existing = await Contestant.findOne({ nidaNumber });
    if (existing) {
      return res.status(400).json({ message: 'Contestant with this NIDA already exists.' });
    }

    const newContestant = new Contestant({
      name,
      party,
      bio,
      nidaNumber,
      promises: promiseArray,
      profileImage,
    });

    await newContestant.save();
    res.status(201).json({contestant: newContestant });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
  


const updateContestant = async (req, res) => {
  try {
    await connectToDatabase();

    const updated = await Contestant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Contestant not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating contestant", error: err.message });
  }
};


const deleteContestant = async (req, res) => {
  try {
    const deleted = await Contestant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contestant not found" });

    res.status(200).json({ message: "Contestant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting contestant", error: err.message });
  }
};

// Export all handlers
module.exports = {
  getAllContestants,
  getContestantById,
  createContestant,
  updateContestant,
  deleteContestant,
};
