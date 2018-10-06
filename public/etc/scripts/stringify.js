function smartStringify(root, config={}) {
	const
		FUNCPAT = /^function\s*([$_\w\d.]*)\s*\(([^()]*)\)\s*\{\s*((?:[\r\n]|.)*?)\s*\}$/,
		NEWLINE = /\r\n?|[\f\v\u2028\u2029]/g,
		cache = new Map();

	for(let k in config.named || {}) {
		cache.set(config.named[k], [k]);
	}

	const
		rootname = config.root || "@",
		limit = config.limit || 8,
		incproto = !!config.prototypes,
		indentChars = config.indent || "\t",
		colon = config.colon || ": ",
		newline = config.newline || "\n";

	const
		singleline_join = ", ",
		multiline_join = ',' + newline;

	cache.set(root, [rootname]);
	cache.set(document, ["document"]);
	cache.set(window, ["window"]);
	cache.set(console, ['console']);

	function normalPath(p) {
		let v = [p[0]];
		for(let i = 1; i < p.length; ++i) {
			if(typeof p[i] === "string") {
				v.push("." + p[i]);
			}
			else {
				v.push(`[${p[i]}]`);
			}
		}

		return v.join("");
	}

	function indent(text) {
		return text.replace(/^/gm, indentChars);
	}

	function combine(parts, tlen) {
		if(newline && tlen >= 60) {
			return newline + indent(parts.join(multiline_join)) + newline;
		}
		else {
			return parts.join(singleline_join);
		}
	}

	function count(str, sub) {
		let count = 0, i = 0;
		while(i = str.indexOf(sub, i) + 1) {
			++count;
		}
		return count;
	}

	function str(o, path) {
		if(o === null || o === undefined || typeof o === "number") return o + "";

		if(o === root) {
			if(path.length > 1) {
				return rootname;
			}
		}
		else if(cache.has(o)) {
			return normalPath(cache.get(o));
		}

		if(path.length > limit) {
			return "...";
		}

		if(Array.isArray(o)) {
			cache.set(o, path);

			if(path.length + 1 > limit) {
				return `[ ... ${o.length} ]`;
			}

			let sv = [], tlen = 0;
			for(let i = 0; i < o.length; ++i) {
				let topush = str(o[i], path.concat([i]));
				sv.push(topush);

				if(topush.indexOf(NEWLINE) === -1) {
					tlen = Infinity;
				}
				else {
					tlen += topush.length;
				}
			}

			return `[${combine(sv, tlen)}]`;
		}
		else if(o instanceof Set) {
			let sv = [], tlen = 0;;

			for(let v of o) {
				let topush = str(v, path.concat([v]));
				sv.push(topush);
				tlen += topush.length;

				if(topush.indexOf(NEWLINE) === -1) {
					tlen = Infinity;
				}
				else {
					tlen += topush.length;
				}
			}

			return `Set {${combine(sv, tlen)}}`;
		}
		else if(o instanceof Map) {
			let sv = [], tlen = 0;

			for(let [k, v] of o) {
				let topush = k + colon + str(v, path.concat([k]));
				sv.push(topush);
				tlen += topush.length;

				if(topush.indexOf(NEWLINE) === -1) {
					tlen = Infinity;
				}
				else {
					tlen += topush.length;
				}
			}

			return `Map {${combine(sv, tlen)}}`;
		}
		else if(typeof o === "object") {
			cache.set(o, path);

			if(path.length + 1 > limit) {
				let keys = Object.keys(o), tlen = keys.reduce((n, o) => n + o.length);
				return `{${combine(Object.keys(o), tlen)}}`;
			}

			let sv = [], tlen = 0;
			for(let k of Object.keys(o)) {
				let v = o[k];

				if(typeof v === "function") {
					let m = FUNCPAT.exec(v + "");
					if(!m[1] || m[1] === k) {
						sv.push(`${k}(${m[2]}) {}`);
						continue;
					}
				}

				let topush = k + colon + str(v, path.concat([k]));
				sv.push(topush);
				tlen += topush.length;

				if(topush.indexOf(NEWLINE) === -1) {
					tlen = Infinity;
				}
				else {
					tlen += topush.length;
				}
			}

			if(incproto) {
				sv.push("prototype" + colon + str(Object.getPrototypeOf(o)), path.concat("prototype"));
				tlen = Infinity;
			}

			return (o.constructor? o.constructor.name + " ": "") + `{${combine(sv, tlen)}}`;
		}
		else if(typeof o === "function") {
			let
				m = FUNCPAT.exec(o + ""),
				[, name, args, body] = m;

			if(name) {
				name = " " + name;
			}
			if(body === "[native code]") {
				body = ` ${body} `;
			}
			else {
				body = "";
			}

			return `function${name}(${m[2]}) {${body}}`;
		}
		else if(typeof o === "symbol") {
			return o.toString();
		}
		else if(typeof o === "string") {
			let
				dq = count(o, '"'), sq = count(o, "'"), bq = count(o, '`'),
				mq = Math.min(dq, sq, bq);

			if(mq === dq) {
				return `"${o.replace(/"/g, '\\"')}"`
			}
			else if(mq === sq) {
				return `'${o.replace(/'/g, "\\'")}'`
			}
			else {
				return `\`${o.replace(/`/g, '\\`')}\``;
			}
		}
		else {
			return JSON.stringify(o);
		}
	}

	return str(root, [rootname]);
}
