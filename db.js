const
	fs = require("fs"),
	os = require("os"),
	{Client} = require("pg");

const
	log = require("./log");

let
	user = process.env.PGUSERNAME || process.env.USER ||
		os.userInfo().username,
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
		let f = new Set();
		
		var qq = q.replace(/\$\{([\w\d]+)\}/g, ($0, $1) => {
			let x = k.indexOf($1);
			if(x === -1) {
				log.warn("Unsupplied query key", JSON.stringify($1));
			}
			else {
				f.add(x);
				return `$${x + 1}`;
			}
		});
		
		if(f.size) {
			log.debug("Final query:", qq);
		}
		
		v = v.filter((x, i) => {
			if(f.has(i)) {
				return true;
			}
			else {
				log.warn("Ignoring query key", JSON.stringify(k[i]));
				return false;
			}
		});
		
		client.query(qq, v, (err, res) => {
			if(err) no(err)
			else ok(res.rows);
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
			log.info("User", user);
			return queryFile("bulletin-new", {
				author: user.id,
				body: text
			});
		}
	},
	user: {
		authenticate(name, pass) {
			return queryFile("user-auth", {name, pass}).then(rows => rows[0])
		},
		byId(id) {
			return queryFile("user-byid", {id}).then(rows => rows[0]);
		},
		add(name, pass) {
			return queryFile("useradd", {name, pass}).then(rows => rows[0]);
		}
	}
};
