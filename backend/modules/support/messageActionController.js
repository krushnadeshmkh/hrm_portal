const MessageAction = require("../../models/MessageAction");
const User = require("../../models/User");
const SupportTicket = require("../../models/SupportTicket");

const {
  createNotification,
  getCompanyAdmins,
  getSuperAdmins,
} = require("../notifications/notificationHelper");

exports.getActions = async (req, res) => {
  try {
    const actions = await MessageAction.find({
      ticket_id: req.params.ticket_id,
    });

    res.json({ success: true, data: actions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.reactMessage = async (req, res) => {
  try {
    const { id: user_id, company_id, role } = req.user;
    const { ticket_id, message_key, emoji } = req.body;
    const existing = await MessageAction.findOne({
      ticket_id,
      message_key,
      user_id,
      action_type: "reaction",
      value: emoji,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, toggled: "off" });
    }
    await MessageAction.findOneAndUpdate(
      {
        ticket_id,
        message_key,
        user_id,
        action_type: "reaction",
      },
      { value: emoji },
      { upsert: true, new: true }
    );
    const user = await User.findById(user_id).select("name");
    const reactorName = user?.name || "Someone";

    const ticket = await SupportTicket.findById(ticket_id).select("user_id");
    const ticketOwnerId = ticket?.user_id;

    const message = `${emoji} ${reactorName} reacted to a message`;

    const adminRoles = ["company_admin", "super_admin", "software_owner"];

    if (adminRoles.includes(role)) {
      if (ticketOwnerId && ticketOwnerId.toString() !== user_id) {
        await createNotification(ticketOwnerId, "reaction_added", message, ticket_id);
      }
    } else {
      const admins = await getCompanyAdmins(company_id);
      const superAdmins = await getSuperAdmins();

      const allAdmins = [...new Set([...admins, ...superAdmins])];

      for (const adminId of allAdmins) {
        if (adminId.toString() !== user_id) {
          await createNotification(adminId, "reaction_added", message, ticket_id);
        }
      }
    }

    res.json({ success: true, toggled: "on" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteForMe = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { ticket_id, message_key } = req.body;

    await MessageAction.updateOne(
      {
        ticket_id,
        message_key,
        user_id,
        action_type: "delete_for_me",
      },
      { value: "true" },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.deleteForEveryone = async (req, res) => {
  try {
    const { id: user_id, company_id, role } = req.user;
    const { ticket_id, message_key } = req.body;

    await MessageAction.updateOne(
      {
        ticket_id,
        message_key,
        user_id,
        action_type: "delete_for_everyone",
      },
      { value: "true" },
      { upsert: true }
    );

    const user = await User.findById(user_id).select("name");
    const deleterName = user?.name || "Someone";

    const ticket = await SupportTicket.findById(ticket_id).select("user_id");
    const ticketOwnerId = ticket?.user_id;

    const message = `🗑️ ${deleterName} deleted a message for everyone`;

    const adminRoles = ["company_admin", "super_admin", "software_owner"];

    if (adminRoles.includes(role)) {
      if (ticketOwnerId && ticketOwnerId.toString() !== user_id) {
        await createNotification(ticketOwnerId, "message_deleted", message, ticket_id);
      }
    } else {
      const admins = await getCompanyAdmins(company_id);
      const superAdmins = await getSuperAdmins();

      const allAdmins = [...new Set([...admins, ...superAdmins])];

      for (const adminId of allAdmins) {
        if (adminId.toString() !== user_id) {
          await createNotification(adminId, "message_deleted", message, ticket_id);
        }
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};