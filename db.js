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

function rawQuery(q, args) {
	return client.query(q, args).then(res => res.rows);
}

function query(q, args) {
	log.debug("Running query", q);
	return new Promise((ok, no) => {
		if(q in query.cache) {
			rawQuery(query.cache[q], args).then(ok, no);
		}
		else {
			fs.readFile(`db/${q}.sql`, (err, data) => {
				if(err) {
					no(err);
				}
				else {
					log.debug("Caching", `db/${q}.sql`);
					rawQuery(query.cache[q] = data.toString(), args).
						then(ok, no);
				}
			});
		}
	});
}
query.cache = {};

function queryFirst(name, args) {
	return query(name, args).then(rows => rows[0]);
}

function normalizeName(name) {
	// TODO: normalize homoglyphs
	// TODO: sanitize invalid unicode
	// TODO: sanitize unpaired control characters
	return name.toLowerCase().replace(/[\0-\x1f]+/g, '');
}

module.exports = {
	rawQuery,
	query,
	bulletin: {
		getAll() {
			return query("bulletin/all");
		},
		add(user, text) {
			return query("bulletin/new", [user.id, text]);
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
			return queryFirst("user/byid", [id]);
		},
		byName(name) {
			return queryFirst("user/byname", [normalizeName(name)]);
		},
		add(name, pass) {
			return queryFirst("user/add", [name, normalizeName(name), pass]);
		}
	}
};
