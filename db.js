const
	{Client} = require("pg");

const client = new Client();
client.connect();

function run_sql(q, ok, no) {
	client.query(run_file.cache[fn], (err, rows) => {
		if(err) no(err)
		else ok(rows);
	});
}

function run_file(fn) {
	return new Promise((ok, no) => {
		if(fn in run_file.cache) {
			run_sql(run_file.cache[fn])
			client.query(run_file.cache[fn], (err, rows) => {
				if(err) no(err)
				else ok(rows);
			});
		}
		else {
			fs.read(fn, (err, data) => {
				if(err) {
					no(err);
				}
				else {
					
					client.query(data.toString(), (err, rows) => {
						if(err) no(err)
						else ok(data);
					});
				}
			});
		}
	});
}
run_file.cache = {};

function init() {
	return run_file("init.sql");
}

module.exports = {
	init
};
