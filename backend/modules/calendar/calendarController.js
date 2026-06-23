const Event = require("../../models/Event");
const Meeting = require("../../models/Meeting");
const mongoose = require("mongoose");

const toDateOnlyStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const generateRecurringEvents = (eventData) => {
  if (!eventData.recurrence || eventData.recurrence.frequency === "none") {
    return [eventData];
  }

  const events = [];
  const startDate = parseDateOnly(eventData.date);
  const endDate = eventData.recurrence.end_date
    ? parseDateOnly(eventData.recurrence.end_date)
    : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());

  const interval = eventData.recurrence.interval || 1;
  let currentDate = new Date(startDate);
  const maxOccurrences = 730;
  let count = 0;

  while (currentDate <= endDate && count < maxOccurrences) {
    events.push({
      title: eventData.title,
      date: toDateOnlyStr(currentDate),
      time: eventData.time,
      end_time: eventData.end_time,
      event_type: eventData.event_type,
      location: eventData.location,
      description: eventData.description,
      color: eventData.color,
      recurrence: { ...eventData.recurrence, frequency: "none" },
      guests: eventData.guests || [],
      reminders: eventData.reminders || [],
      attachments: eventData.attachments || [],
      visibility: eventData.visibility || "company",
      shared_with: eventData.shared_with || [],
      created_by: eventData.created_by,
      company_id: eventData.company_id,
    });

    count += 1;

    switch (eventData.recurrence.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7 * interval);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
      default:
        currentDate = new Date(endDate.getTime() + 1);
    }
  }

  return events;
};

const rangesOverlap = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

const checkConflict = async (date, time, end_time, user_id, user_email, company_id, exclude_id = null) => {
  const query = {
    company_id,
    is_deleted: false,
    date,
    $or: [{ created_by: user_id }, { "guests.email": user_email }],
  };

  if (exclude_id) {
    query._id = { $ne: exclude_id };
  }

  const [events, meetings] = await Promise.all([
    Event.find(query),
    Meeting.find(query),
  ]);

  const allEvents = [...events, ...meetings];
  const newStart = time;
  const newEnd = end_time || time;

  for (const event of allEvents) {
    const existingStart = event.time;
    const existingEnd = event.end_time || event.time;

    if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
      return true;
    }
  }

  return false;
};

exports.getEvents = async (req, res) => {
  try {
    const { start, end, type } = req.query;
    const company_id = req.user.company_id;

    const query = {
      company_id,
      is_deleted: false,
    };

    if (start && end) {
      query.date = { $gte: start.split("T")[0], $lte: end.split("T")[0] };
    }

    if (type) {
      query.event_type = type;
    }

    let events = await Event.find(query)
      .sort({ date: 1, time: 1 })
      .populate("created_by", "name email avatar")
      .populate("shared_with.user_id", "name email avatar");

    events = events.filter((event) => {
      if (event.visibility === "public") return true;
      if (event.visibility === "company") return true;
      if (event.created_by._id.toString() === req.user.id) return true;
      return event.shared_with.some(
        (share) => share.user_id._id.toString() === req.user.id
      );
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

exports.createEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      date,
      time,
      end_time,
      event_type,
      location,
      description,
      color,
      recurrence,
      guests,
      reminders,
      attachments,
      visibility,
      shared_with,
    } = req.body;

    if (!title || !date || !time) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Title, date and time are required",
      });
    }

    const hasConflict = await checkConflict(
      date,
      time,
      end_time,
      req.user.id,
      req.user.email,
      req.user.company_id
    );

    if (hasConflict) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "You have a conflicting event at this time",
      });
    }

    const eventData = {
      title,
      date,
      time,
      end_time: end_time || time,
      event_type: event_type || "task",
      location: location || "",
      description: description || "",
      color: color || "#4F46E5",
      recurrence: recurrence || { frequency: "none", interval: 1 },
      guests: guests || [],
      reminders: reminders || [{ method: "notification", minutes: 15 }],
      attachments: attachments || [],
      visibility: visibility || "company",
      shared_with: shared_with || [],
      created_by: req.user.id,
      company_id: req.user.company_id,
    };

    let createdEvents = [];

    if (recurrence && recurrence.frequency !== "none") {
      const recurringEvents = generateRecurringEvents(eventData);
      for (const event of recurringEvents) {
        const newEvent = new Event(event);
        await newEvent.save({ session });
        createdEvents.push(newEvent);
      }
    } else {
      const event = new Event(eventData);
      await event.save({ session });
      createdEvents.push(event);
    }

    await session.commitTransaction();

    const populatedEvents = await Event.find({
      _id: { $in: createdEvents.map((e) => e._id) },
    })
      .populate("created_by", "name email avatar")
      .populate("shared_with.user_id", "name email avatar");

    res.status(201).json({
      success: true,
      data: populatedEvents,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  } finally {
    session.endSession();
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isCreator = event.created_by.toString() === req.user.id;
    const hasManagePermission = event.shared_with.some(
      (share) =>
        share.user_id.toString() === req.user.id && share.permission === "manage"
    );

    if (!isCreator && !hasManagePermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    if (updates.date || updates.time || updates.end_time) {
      const hasConflict = await checkConflict(
        updates.date || event.date,
        updates.time || event.time,
        updates.end_time || event.end_time,
        req.user.id,
        req.user.email,
        req.user.company_id,
        id
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message: "You have a conflicting event at this time",
        });
      }
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        event[key] = updates[key];
      }
    });

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("created_by", "name email avatar")
      .populate("shared_with.user_id", "name email avatar");

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isCreator = event.created_by.toString() === req.user.id;
    const hasManagePermission = event.shared_with.some(
      (share) =>
        share.user_id.toString() === req.user.id && share.permission === "manage"
    );

    if (!isCreator && !hasManagePermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    event.is_deleted = true;
    await event.save();

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    })
      .populate("created_by", "name email avatar")
      .populate("shared_with.user_id", "name email avatar");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const hasAccess =
      event.visibility === "public" ||
      event.visibility === "company" ||
      event.created_by._id.toString() === req.user.id ||
      event.shared_with.some(
        (share) => share.user_id._id.toString() === req.user.id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this event",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};

exports.updateGuestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findOne({
      _id: id,
      company_id: req.user.company_id,
      is_deleted: false,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const guest = event.guests.find(
      (g) => g.email === req.user.email
    );

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "You are not invited to this event",
      });
    }

    guest.response_status = status;
    guest.response_time = new Date();

    await event.save();

    res.json({
      success: true,
      message: "Guest status updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update guest status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating guest status",
    });
  }
};