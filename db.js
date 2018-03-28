const
	{Client} = require("pg");

const client = new Client();
client.connect();

function query_promise(q, args, ok, no) {
	client.query(q, args, (err, rows) => {
		if(err) no(err)
		else ok(rows);
	});
}

function query(fn, ...args) {
	return new Promise((ok, no) => {
		if(fn in run_file.cache) {
			query_promise(run_file.cache[fn], args, ok, no);
		}
		else {
			fs.read(fn + ".sql", (err, data) => {
				if(err) {
					no(err);
				}
				else {
					query_promise(
						run_file.cache[fn] = data.toString(),
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
