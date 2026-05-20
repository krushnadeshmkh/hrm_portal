const Plan = require("../../models/Plan");
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createPlan = async (req, res) => {
  try {
    const {
      plan_name,
      price,
      billing_cycle,
      max_employees,
      features,
    } = req.body;

    const plan = await Plan.create({
      plan_name,
      price,
      billing_cycle,
      max_employees,
      features,
    });

    res.status(201).json(plan);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Plan.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};