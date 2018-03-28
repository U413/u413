'use strict';

const
	express = require("express"),
	bodyParser = require("body-parser");

let router = new express.Router();

router.use(bodyParser.json({type: "*/json"}));
router.use("/api", require("./api"));
router.use("/stdout", require("./stdout"));

module.exports = router;
