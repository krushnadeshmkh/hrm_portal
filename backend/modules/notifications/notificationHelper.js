const Notification = require('../../models/Notification');
const User = require('../../models/User');
const SupportTicket = require('../../models/SupportTicket');


const createNotification = async (user_id, type, message, ticket_id = null) => {
  try {
    await Notification.create({
      user_id,
      ticket_id,
      type,
      message,
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

const getCompanyAdmins = async (company_id) => {
  try {
    const users = await User.find({
      company_id,
      role: "company_admin",
    }).select("_id");

    return users.map(u => u._id);

  } catch (err) {
    console.error("Failed to get company admins:", err.message);
    return [];
  }
};


const getSuperAdmins = async () => {
  try {
    const users = await User.find({
      role: { $in: ["super_admin", "software_owner"] },
    }).select("_id");

    return users.map(u => u._id);

  } catch (err) {
    console.error("Failed to get super admins:", err.message);
    return [];
  }
};


const getTicketOwner = async (ticket_id) => {
  try {
    const ticket = await SupportTicket.findById(ticket_id)
      .select("user_id company_id");

    return ticket || null;

  } catch (err) {
    console.error("Failed to get ticket owner:", err.message);
    return null;
  }
};


module.exports = {
  createNotification,
  getCompanyAdmins,
  getSuperAdmins,
  getTicketOwner,
};