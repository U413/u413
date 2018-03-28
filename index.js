'use strict';

const
	express = require("express"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	serveIndex = require("serve-index"),
	$path = require("path");

require("./init");

let app = express();

app.set('view engine', 'pug');

app.use(cookieParser());
app.use((req, res, next) => {
	req.user = req.cookies.user || "<<<FAKE>>>";
	next();
});

app.use("/dev", require("./dev/index"));

app.get('/', (req, res) => {
	res.render('index');
});

app.use(serveIndex('public'));
app.use(express.static('public', {
	extensions: ['txt', 'md']
}));

let port = process.env.PORT || 8080;
console.log("Listening on port " + port);
app.listen(port);
