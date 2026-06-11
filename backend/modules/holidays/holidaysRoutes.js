const express = require("express");
const router  = express.Router();

const auth      = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const holidayController = require("./holidaysController");


router.get( "/",auth,roleCheck(["manager", "super_admin", "employee"]),
  holidayController.getHolidays
);

router.post("/add", auth, roleCheck(["manager", "super_admin"]),
  holidayController.addHoliday
);

router.put("/:id",auth, roleCheck(["manager", "super_admin"]),
  holidayController.updateHoliday
);

router.delete("/:id",auth,roleCheck(["manager", "super_admin"]),
  holidayController.deleteHoliday
);

module.exports = router;