const {Contestant }= require("../models/contestant");


const getAllContestants = async (req, res) => {
  try {
    const contestants = await Contestant.find().sort({ createdAt: -1 });
    res.status(200).json(contestants);
  } catch (err) {
    res.status(500).json({ message: "Failed to get contestants", error: err.message });
  }
};


const getContestantById = async (req, res) => {
  try {
    const contestant = await Contestant.findById(req.params.id);
    if (!contestant) return res.status(404).json({ message: "Contestant not found" });

    res.status(200).json(contestant);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contestant", error: err.message });
  }
};


const createContestant = async (req, res) => {
    try {
      const { name, position, manifesto} = req.body;
      const image = req.file ? req.file.path : null;

      await connectToDatabase();
      const existingContestant = await Contestant.findOne({ name});
  
      if (existingContestant) {
        return res.status(400).json({ message: "Contestant with this name already exists, cannot create multiple manifestos." });
      }
  
      await connectToDatabase();
      const newContestant = new Contestant({
        name,
        position,
        manifesto,
        image
      });

  
      await newContestant.save();
      res.status(201).json(newContestant);
    } catch (err) {
      res.status(400).json({ message: "Failed to create contestant", error: err.message });
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
