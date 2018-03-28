const
	fs = require("fs"),
	{Client} = require("pg");

const client = new Client();
client.connect();

function query_promise(q, args, ok, no) {
	client.query(q, args, (err, rows) => {
		if(err) no(err)
		else ok(rows);
	});
}

function query(q, ...args) {
	return new Promise((ok, no) => {
		if(q in run_file.cache) {
			query_promise(run_file.cache[q], args, ok, no);
		}
		else {
			fs.read(`db/${q}.sql`, (err, data) => {
				if(err) {
					no(err);
				}
				else {
					query_promise(
						run_file.cache[q] = data.toString(),
						args, ok, no
					);
				}
			});
		}
	});
}
query.cache = {};

module.exports = {
	query
};
