const Company = require("../../models/Company");
const User = require("../../models/User");
const Plan = require ("../../models/Plan.js")

exports.createCompany = async (req, res) => {
  try {
    const { company_name, pricing_plan } = req.body;

    console.log("Received pricing_plan:", pricing_plan);

    const plan = await Plan.findOne({ price: pricing_plan }); 

    console.log("Found plan:", plan);

    if (!plan) {
      return res.status(404).json({ error: "Pricing plan not found" });
    }

    const company = await Company.create({
      company_name,
      pricing_plan: plan._id,
    });

    res.status(201).json({
      success: true,
      data: company,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error while creating company",
    });
  }
};




exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("pricing_plan", "plan_name price billing_cycle")
      .sort({ createdAt: -1 });

      console.log(companies)

    res.status(200).json({
      success: true,
      data: companies,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error while fetching companies",
    });
  }
};




exports.getGlobalSummary = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeLicenses = await User.countDocuments({
      role: "company_admin",
    });

    res.status(200).json({
      success: true,
      data: {
        totalCompanies,
        totalUsers,
        activeLicenses,
        systemAlerts: 0,
      },
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error while fetching global summary",
    });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("company_id", "company_name")
      .sort({ createdAt: -1 });

    const data = users.map((u) => ({
      user_id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      company_id: u.company_id?._id || null,
      company_name: u.company_id?.company_name || null,
      created_at: u.createdAt,
    }));

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error while fetching users",
    });
  }
};




exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const linkedUsers = await User.countDocuments({
      company_id: id,
    });

    if (linkedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: Users are still linked to this company.",
      });
    }

    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error while deleting company",
    });
  }
};