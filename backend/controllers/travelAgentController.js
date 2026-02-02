// backend/controllers/travelAgentController.js
const mongoose = require("mongoose");
const TravelAgent = require("../models/TravelAgent");

// Get all travel agents
exports.getAgents = async (req, res) => {
  try {
    const agents = await TravelAgent.find({}).sort({ companyName: 1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: "Failed to load travel agents" });
  }
};

// Get active travel agents
exports.getActiveAgents = async (req, res) => {
  try {
    const agents = await TravelAgent.find({ status: "Active" }).sort({ companyName: 1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: "Failed to load active travel agents" });
  }
};

// Get single travel agent
exports.getAgent = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await TravelAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ error: "Travel agent not found" });
    }

    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: "Failed to load travel agent" });
  }
};

// Add new travel agent
exports.addAgent = async (req, res) => {
  const {
    agentName,
    companyName,
    agentCode,
    contactPerson,
    email,
    phone,
    address,
    licenseNumber,
    commissionRate,
    paymentTerms,
    creditLimit,
    contractStartDate,
    contractEndDate,
    notes
  } = req.body;

  if (!agentName || !companyName || !agentCode || !contactPerson || !email || !phone) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    // Check if agent code already exists
    const existingAgent = await TravelAgent.findOne({ 
      agentCode: agentCode.toUpperCase() 
    });

    if (existingAgent) {
      return res.status(400).json({ error: "Agent code already exists" });
    }

    const newAgent = new TravelAgent({
      agentName,
      companyName,
      agentCode: agentCode.toUpperCase(),
      contactPerson,
      email,
      phone,
      address,
      licenseNumber,
      commissionRate: commissionRate || 10,
      paymentTerms: paymentTerms || "Credit",
      creditLimit: creditLimit || 0,
      contractStartDate,
      contractEndDate,
      notes
    });

    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    res.status(500).json({ error: "Failed to add travel agent" });
  }
};

// Update travel agent
exports.updateAgent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.agentCode) {
    updates.agentCode = updates.agentCode.toUpperCase();
  }

  try {
    const agent = await TravelAgent.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!agent) {
      return res.status(404).json({ error: "Travel agent not found" });
    }

    res.json(agent);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update travel agent" });
  }
};

// Delete travel agent
exports.deleteAgent = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await TravelAgent.findByIdAndDelete(id);

    if (!agent) {
      return res.status(404).json({ error: "Travel agent not found" });
    }

    res.json({ message: "Travel agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete travel agent" });
  }
};

// Update agent balance
exports.updateBalance = async (req, res) => {
  const { id } = req.params;
  const { amount, operation } = req.body;

  if (!amount || !operation) {
    return res.status(400).json({ error: "Amount and operation are required" });
  }

  try {
    const agent = await TravelAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ error: "Travel agent not found" });
    }

    if (operation === "add") {
      agent.currentBalance += amount;
    } else if (operation === "subtract") {
      agent.currentBalance -= amount;
    } else {
      return res.status(400).json({ error: "Invalid operation" });
    }

    await agent.save();
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update balance" });
  }
};

// Get agent statistics
exports.getAgentStats = async (req, res) => {
  try {
    const totalAgents = await TravelAgent.countDocuments();
    const activeAgents = await TravelAgent.countDocuments({ status: "Active" });
    const totalRevenue = await TravelAgent.aggregate([
      { $group: { _id: null, total: { $sum: "$totalRevenue" } } }
    ]);

    const topAgents = await TravelAgent.find({})
      .sort({ totalBookings: -1 })
      .limit(10)
      .select('companyName contactPerson totalBookings totalRevenue commissionRate');

    res.json({
      totalAgents,
      activeAgents,
      totalRevenue: totalRevenue[0]?.total || 0,
      topAgents
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load agent statistics" });
  }
};