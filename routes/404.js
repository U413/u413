'use strict';

const
	express = require("express");

const
	log = require.main.require("./log");

const router = new express.Router();

// 404: Not found handling
router.use(function(req, res, next){
	res.status(404);

	// respond with html page
	if(req.accepts('html')) {
		res.render('404', {url: req.url});
	}
	// respond with json
	else if(req.accepts('json')) {
		res.send({error: 'Not found'});
	}
	// default to plain-text. send()
	else {
		res.type('txt').send('Not found');
	}
	
	log.error("Error 404:", req.url);
});

module.exports = router;
