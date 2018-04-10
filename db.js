const
	fs = require("fs"),
	os = require("os"),
	bcrypt = require("bcrypt"),
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

function queryFileFirst(name, args) {
	return queryFile(name, args).then(rows => rows[0]);
}

function normalizeName(name) {
	// TODO: normalize homoglyphs
	// TODO: sanitize invalid unicode
	// TODO: sanitize unpaired control characters
	return name.toLowerCase().replace(/[\0-\x1f]+/g, '');
}

module.exports = {
	query,
	queryFile,
	bulletin: {
		getAll() {
			return queryFile("bulletin/all");
		},
		add(user, text) {
			return queryFile("bulletin/new", {
				author: user.id,
				body: text
			});
		}
	},
	user: {
		authenticate(name, pass) {
			return this.byName(name).then(user => {
				if(user) {
					// Don't chain the promise because we need user
					return bcrypt.compare(pass, user.pass).then(eq => {
						return eq? user : null;
					});
				}
				else {
					return null;
				}
			})
		},
		byId(id) {
			return queryFileFirst("user/byid", {id});
		},
		byName(name) {
			return queryFileFirst("user/byname", {name: normalizeName(name)});
		},
		add(name, pass) {
			return queryFileFirst("user/add", {
				name, pass,
				searchname: normalizeName(name)
			});
		}
	}
};
