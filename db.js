const
	fs = require("fs"),
	{Client} = require("pg");

const
	log = require("./log");

let
	user = process.env.PGUSERNAME || process.env.USER,
	database = process.env.PGDATABASE || process.env.DB || "u413";
	
log.info("Starting PostgreSQL client with", {user, database});

const client = new Client({
	user, database,
	password: process.env.PGPASSWORD || process.env.PASS
});
client.connect();

function format(fmt, args) {
	return fmt.replace(/\{([\w\d]+)\}/, m => {
		if(m[1] in args) {
			return args[m[1]];
		}
		else {
			return m[0];
		}
	});
}

function query(q, args) {
	log.silly(q, args);
	args = args || {};
	return new Promise((ok, no) => {
		let k = Object.keys(args), v = Object.values(args);
		log.info(k, v);
		
		var qq = q.replace(/\$\{([\w\d]+)\}/g, ($0, $1) => {
			let x = k.indexOf($1) + 1;
			if(x) {
				return `$${x}`;
			}
			else {
				throw new Error("Undefined key " + $1);
			}
		});
		log.debug("Final query:", qq);
		
		client.query(qq, v, (err, rows) => {
			if(err) no(err)
			else ok(rows);
		});
	});
}

function queryFile(q, args) {
	log.debug("Running query", q);
	return new Promise((ok, no) => {
		if(q in queryFile.cache) {
			query(queryFile.cache[q], args).then(ok, no);
		}
		else {
			fs.readFile(`db/${q}.sql`, (err, data) => {
				if(err) {
					no(err);
				}
				else {
					log.debug("Caching", `db/${q}.sql`);
					query(queryFile.cache[q] = data.toString(), args).then(ok, no);
				}
			});
		}
	});
}
queryFile.cache = {};

module.exports = {
	query,
	queryFile,
	bulletin: {
		getAll() {
			return queryFile("bulletin-get");
		},
		add(user, text) {
			return queryFile("bulletin-new", {
				username: user,
				body: text
			});
		}
	}
};
