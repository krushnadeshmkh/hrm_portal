const Holiday = require('../../models/Holiday');



exports.getHolidays = async (req, res) => {
  const company_id = req.user.company_id;

  try {
    const holidays = await Holiday.find({ company_id })
      .sort({ holiday_date: 1 });

    res.status(200).json({
      success: true,
      data: holidays,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Error fetching holidays",
    });
  }
};


exports.addHoliday = async (req, res) => {
  const { holiday_date, description } = req.body;
  const company_id = req.user.company_id;

  try {
    const holiday = await Holiday.create({
      holiday_date,
      description,
      company_id,
    });

    res.status(201).json({
      success: true,
      data: holiday,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Error adding holiday",
    });
  }
};