const path = require("path");
const fs = require("fs");

const TicketAttachment = require("../../models/TicketAttachment");
const User = require("../../models/User");
const SupportTicket = require("../../models/SupportTicket");

const {
  createNotification,
  getCompanyAdmins,
  getSuperAdmins,
} = require("../notifications/notificationHelper");

exports.uploadAttachment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { id: userId, company_id: companyId, role } = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await TicketAttachment.create({
      ticket_id: ticketId,
      user_id: userId,
      file_name: req.file.originalname,
      file_url: fileUrl,
      file_type: req.file.mimetype,
      file_size: req.file.size,
    });
    const user = await User.findById(userId).select("name");
    const uploaderName = user?.name || "Someone";

    const fileLabel = req.file.mimetype.startsWith("image/")
      ? "image"
      : "file";
    const ticket = await SupportTicket.findById(ticketId).select("user_id");
    const ticketOwnerId = ticket?.user_id;

    const adminRoles = ["company_admin", "super_admin", "software_owner"];

    if (adminRoles.includes(role)) {
      if (ticketOwnerId && ticketOwnerId.toString() !== userId) {
        await createNotification(
          ticketOwnerId,
          "file_uploaded",
          `📎 ${uploaderName} uploaded a ${fileLabel}: "${req.file.originalname}"`,
          ticketId
        );
      }
    } else {
      const companyAdmins = await getCompanyAdmins(companyId);
      const superAdmins = await getSuperAdmins();

      const admins = [...new Set([...companyAdmins, ...superAdmins])];

      for (const adminId of admins) {
        await createNotification(
          adminId,
          "file_uploaded",
          `📎 ${uploaderName} uploaded a ${fileLabel}: "${req.file.originalname}"`,
          ticketId
        );
      }
    }

    return res.status(201).json({ success: true, data: attachment });

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
exports.getAttachments = async (req, res) => {
  try {
    const attachments = await TicketAttachment.find({
      ticket_id: req.params.ticketId,
    })
      .populate("user_id", "name")
      .sort({ uploaded_at: 1 });

    const formatted = attachments.map((a) => ({
      ...a._doc,
      uploader_name: a.user_id?.name || "Unknown",
    }));

    res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const attachment = await TicketAttachment.findById(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({ success: false, message: "Attachment not found" });
    }

    if (attachment.user_id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const filePath = path.join(__dirname, "../..", attachment.file_url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.deleteOne();

    res.json({ success: true, message: "Attachment deleted" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};