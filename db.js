const
	fs = require("fs"),
	os = require("os"),
	bcrypt = require("bcrypt"),
	{Client} = require("pg");

const
	log = require("./log");

const black = require("./blacklist.json");

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

/**
 * Get rid of any characters which may be problematic and are clearly there
 *  to trip up the system.
**/
function sanitizeName(name) {
	// TODO: strip invisible format characters
	return name.
		// Space normalization
		replace(/\s+/g, ' ').
		// Control characters
		replace(/[\0-\x1f]/g, '');
}

/**
 * Produces a string which normalizes all look-alikes for use in the
 *  searchname field.
**/
function searchableName(name) {
	// TODO: normalize homoglyphs (including stuff like l and 1)
	// TODO: sanitize invalid unicode
	// TODO: strip combining characters
	return sanitizeName(name).toLowerCase().replace(/[\s\/]+/g, '');
}

/**
 * Converts invalid usernames to "nobody", which is special.
**/
function blacklistName(name) {
	name = searchableName(name);
	return (
		// Names that are misleading or could easily leak from a bug and give
		//  unexpected privilege escalation
		black.indexOf(name) === -1 ||
		// Bad characters
		/[@&|`'"%?]+/.test(name) ||
		// Content filetype extensions which could introduce security holes
		/\.(xml|svg|pdf|rss|atom|.?html?)$/.test(name) ||
		// Dynamic content filetype extensions
		/\.(php(\d+)?|cgi|axd|as[mhp]?x|pl|jspx?|swf|ht[ac]|rb)$/.test(name) ||
		// Dotfiles
		/^\./.test(name)
	)? name : "nobody";
}

const db = module.exports = {
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
	board: {
		getAll() {
			return query("board/all");
		},
		byName(name) {
			return queryFirst("board/byname", [name]);
		},
		list(id) {
			return query("board/list", [id]);
		}
	},
	topic: {
		getAll(id) {
			return query("topic/all", [id]);
		},
		byId(id) {
			return queryFirst("topic/byid", [id]);
		},
		replies(id) {
			return query("topic/replies", [id]).then(replies => {
				return Promise.all(replies.map(async r => {
					r.author = await db.user.byId(r.author);
					return r;
				}));
			});
		},
		create(board, author, title, body) {
			return queryFirst("topic/create", [board, author, title, body]);
		},
		reply(topic, author, body) {
			return query("topic/reply", [topic, author, body]);
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
			return queryFirst("user/byname", [searchableName(name)]);
		},
		add(name, pass) {
			return queryFirst("user/add", [name, searchableName(name), pass]);
		},
		list() {
			return query("user/list");
		}
	}
};
