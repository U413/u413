const
	fs = require("fs"),
	{Client} = require("pg");

const client = new Client({
	database: process.env.PGDATABASE || process.env.DB || "u413"
});
client.connect();

function query_promise(q, args, ok, no) {
	client.query(q, args, (err, rows) => {
		if(err) no(err)
		else ok(rows);
	});
}

function query(q, ...args) {
	console.log("QUERY", q);
	return new Promise((ok, no) => {
		if(q in query.cache) {
			query_promise(query.cache[q], args, ok, no);
		}
		else {
			fs.readFile(`db/${q}.sql`, (err, data) => {
				if(err) {
					no(err);
				}
				else {
					query_promise(
						query.cache[q] = data.toString(),
						args, ok, no
					);
				}
			});
		}
	});
}
query.cache = {};

module.exports = {
	query,
	getAllBulletin() {
		return query("bulletin");
	}
};
