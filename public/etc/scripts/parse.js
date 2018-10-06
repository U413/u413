'use strict';

const NEWLINE = /\n/g;

function stringCount(str, needle) {
	let pos = 0, count = 0;

	while((pos = str.indexOf(needle, pos)) !== -1) {
		++count;
		pos += needle.length;
	}

	return count;
}

class ShellParseError extends Error {
	constructor(msg, src, line, col, pos) {
		let last = src.split(NEWLINE)[line - 1];
		col += stringCount(last.slice(0, col), '\t')*4;
		super(
			`${msg} (${line}:${col})+${pos}\n${last}\n` +
			"-".repeat(col) + "^"
		);
		this.src = src;
		this.line = line;
		this.col = col;
		this.pos = pos;
	}
}
ShellParseError.prototype.name = "ShellParseError";

class shNode {
	interpret(shell, args) {
		return this.visit(new InterpreterVisitor(shell, args));
	}

	async visit(v) {
		throw new Error(`Not implemented (${this.constructor.name}.visit)`);
	}
}

class shCommand extends shNode {
	constructor(cmd, args) {
		super();
		this.cmd = cmd;
		this.args = args;
	}

	async visit(v) {
		return await v.visitCmd(this);
	}
}
class shObject extends shNode {
	constructor(keys, vals) {
		super();
		this.keys = keys;
		this.vals = vals;
	}

	async visit(v) {
		return await v.visitObj(this);
	}
}
class shArray extends shNode {
	constructor(vals) {
		super();
		this.vals = vals;
	}

	async visit(v) {
		return await v.visitArr(this);
	}
}
class shEnv extends shNode {
	constructor(name) {
		super();
		this.name = name;
	}

	async visit(v) {
		return await v.visitEnv(this);
	}
}
class shTemplate extends shNode {
	constructor(parts) {
		super();
		this.parts = parts;
	}

	async visit(v) {
		return await v.visitTemplate(this);
	}
}
class shValue extends shNode {
	constructor(value) {
		super();
		this.value = value;
	}

	async visit(v) {
		return await v.visitVal(this);
	}
}
class shIf extends shNode {
	constructor(cond, body, alt) {
		super();
		this.cond = cond;
		this.body = body;
		this.alt = alt;
	}

	async visit(v) {
		return await v.visitIf(this);
	}
}
class shFor extends shNode {
	constructor(iter, able, body) {
		super();
		this.iter = iter;
		this.able = able;
		this.body = body;
	}

	async visit(v) {
		return await v.visitFor(this);
	}
}
class shProgram extends shNode {
	constructor(cmds) {
		super();
		this.cmds = cmds;
	}

	async visit(v) {
		return await v.visitProg(this);
	}
}

const ShellParser = (function() {
	const
		SQ = "'((?:\\\\\d{1,3}|\\\\x..|\\\\u....|\\\\.|[^'])*)'",
		DQ = '"((?:\\\\\d{1,3}|\\\\x..|\\\\u....|\\\\.|[^"])*)"',
		UNQ = "([^\\s()\\[\\]{}<>'\"`,;:$&|#%^~]+)";

	const
		KEY = new RegExp([
			SQ, DQ, UNQ
		].join("|"), 'gm'),
		UNQRE = new RegExp(UNQ, 'gm'),
		STRING = new RegExp(SQ + "|" + DQ, 'g'),
		PRIMITIVE = new RegExp([
			SQ, DQ, "(null)", "(true)", "(false)",
			"(undefined)", "(Infinity)", "(NaN)",
			"(\\d+)", "([-+]?(?:\\d*\\.\\d+|\\d+\\.\\d*)(?:e[-+]?\\d+)?)"
		].join("|"), 'g'),
		ENV = new RegExp(
			`\\$${UNQ}|\\$\\{(?:#${UNQ}|${UNQ})\\}` +
			"\\$" + UNQ + "|\\$\\{" + UNQ + "\\}",
			'mg'
		),
		WORD = new RegExp(UNQ, 'g'),
		VAR = /([^\s()\[\]{}<>'"`,;:$&|#%^~@/]+)/g,
		SPACE = /\s+/gm,
		SEPARATOR = /\s*,\s*|\s*;\s*|\s+/gm,
		COMMENT = /(#)(\{)?/g,
		COMLINE = /.*?\n/gm,
		MULTI= /(#\{)|(\}#)/g;

	function escapeString(value) {
		return value.
			replace(/\\(\d{1,3})|\\x(..)|\\u(....)/g, (m, $1, $2, $3) => {
				return String.fromCharCode(($1 || $2 || $3).parseInt($1? 8 : 16));
			}).
			replace(/\\(.)/g, (m, $1) => {
				switch($1) {
					case 'a': return '\a';
					case 'b': return '\b';
					case 't': return '\t';
					case 'n': return '\n';
					case 'v': return '\v';
					case 'f': return '\f';
					case 'r': return '\r';

					default: return $1;
				}
			});
	}

	return class ShellParser {
		constructor(src) {
			this.src = src;
			this.line = 1;
			this.col = 0;
			this.pos = 0;
		}

		error(msg) {
			return new ShellParseError(
				msg, this.src, this.line, this.col, this.pos
			);
		}

		advance(m) {
			let lines = m[0].split(NEWLINE);
			if(lines.length == 1) {
				this.col += m[0].length;
			}
			else {
				this.line += lines.length - 1;
				this.col = lines[lines.length - 1].length;
			}
			this.pos += m[0].length;
		}

		consumeChar() {
			++this.pos;
			++this.col;
		}

		match(pat) {
			//* DEBUG
			if(typeof pat !== 'string' && !pat.global)
				throw new Error(pat + " is not global!!");
			//*/

			if(typeof pat === 'string') {
				if(this.src.indexOf(pat, this.pos) === this.pos) {
					return [pat];
				}
			}
			else {
				pat.lastIndex = this.pos;
				let m = pat.exec(this.src);
				if(m && m.index === this.pos) {
					return m;
				}
			}
			return null;
		}

		maybe(pat) {
			let m = this.match(pat);
			if(m) {
				this.advance(m);
			}
			return m;
		}

		expect(pat, what) {
			let m = this.maybe(pat);
			if(m) return m;
			else throw this.error("Expected " + (what || pat));
		}

		skipComment() {
			let
				l = this.line,
				c = this.col,
				p = this.pos,
				com = this.maybe(COMMENT);

			if(com) {
				// Single line
				if(com[1]) {
					this.maybe(COMLINE);
				}
				// Multiline comments
				else if(com[2]) {
					let level = 1, m;
					MULTI.lastIndex = this.pos;
					while(level && (m = MULTI.exec(this.src))) {
						if(m[1]) {
							++level;
						}
						else {
							--level;
						}
					}

					if(level) {
						throw new ParseError("Unclosed multiline comment", l, c, p);
					}
				}

				return true;
			}

			return false;
		}

		skipSpace() {
			SPACE.lastIndex = this.pos;
			let m = SPACE.exec(this.src);
			if(m && m.index === this.pos) {
				this.advance(m);
				return true;
			}
			else {
				return false;
			}
		}

		space() {
			while(this.skipSpace() || this.skipComment()) {}
		}

		expectSpaced(pat, msg) {
			this.space();
			this.expect(pat, msg);
			this.space();
		}

		parseObject() {
			if(!this.maybe("{")) {
				return null;
			}
			this.space();
			let keys = [], vals = [], m;
			while(m = this.maybe(KEY)) {
				keys.push(new shValue(m[1] || m[2] || m[3]));
				this.expectSpaced(":");
				vals.push(this.parseValue());

				this.maybe(SEPARATOR);
			}
			this.expectSpaced("}");
			return new shObject(keys, vals);
		}

		parseArray() {
			if(!this.maybe('[')) {
				return null;
			}
			this.space();

			let vals = [], v;
			while(v = this.parseValue()) {
				vals.push(v);
				this.maybe(SEPARATOR);
			}
			this.expectSpaced(']');
			return new shArray(vals);
		}

		parseCode() {
			if(!this.maybe("(")) {
				return null;
			}

			//this.space()
			let code = this.parseProgram();
			this.expectSpaced(")");
			return code;
		}

		parseDollar() {
			if(!this.maybe("$")) {
				return null;
			}

			let m;

			if(this.maybe("{")) {
				/*
				if(this.maybe("#")) {
					let v = new shLength(this.parseWord());
					this.expect("}");
					return v;
				}
				*/

				let v = this.parseWord();
				switch(this.src[this.pos]) {
					case "}":
						this.consumeChar();
						return new shEnv(v);

					default:
						throw this.error("Unknown operator " + this.src[this.pos]);
				}
			}
			else if(this.maybe("(")) {
				let cmd = this.parseProgram();
				this.expect(")", 'close paren');
				return cmd;
			}
			else if(m = this.maybe(STRING)) {
				return new shValue(m[1] || m[2]);
			}
			else {
				let w = this.expect(VAR);
				return new shEnv(new shValue(w[1]));
			}
		}

		parseJSONPrimitive() {
			function getValue(m) {
				// Single/double quote
				if(m[1] || m[2]) {
					return escapeString(m[1] || m[2]);
				}
				// Integer
				else if(m[9]) {
					return parseInt(m[9]);
				}
				// Float
				else if(m[10]) {
					return parseFloat(m[10]);
				}
				else {
          return {
            null: null,
            true: true,
            false: false,
            Infinity, NaN
            // undefined
          }[m[0]];
        }
			}

			let m = this.maybe(PRIMITIVE);
			return m? new shValue(getValue(m)) : null;
		}

		parseUnquoted() {
			let m = this.maybe(UNQRE);
			if(m) {
				return new shValue(escapeString(m[1]));
			}
			else {
				return null;
			}
		}

		parsePrimitive() {
			return this.parseJSONPrimitive() || this.parseUnquoted();
		}

		parseValue() {
			return (
				this.parseObject() ||
				this.parseArray() ||
				this.parseCode() ||
				this.parseWord() ||
				null
			);
		}

		/**
		 * Parse a part of a template.
		**/
		parsePart() {
			return this.parseDollar() || this.parseCode() || this.parsePrimitive();
		}

		parseWord() {
			let w = [], v;
			while(v = this.parsePart()) {
				w.push(v);
			}

			if(w.length === 0) {
				return null;
			}
			else if(w.length === 1) {
				return w[0];
			}
			else {
				return new shTemplate(w);
			}
		}

		parseIf() {
			if(!this.maybe("if")) {
				return null;
			}

			this.expectSpaced("(");
			let cond = this.parseProgram();
			this.expectSpaced(")");

			this.expectSpaced("{");
			let body = this.parseProgram();
			this.expectSpaced("}");

			if(this.maybe("else")) {
				this.expectSpaced("{");
				var alt = this.parseProgram();
				this.expectSpaced("}");
			}
			else {
				var alt = null;
			}

			return new shIf(cond, body, alt);
		}

		parseFor() {
			if(!this.maybe("for")) {
				return null;
			}

			this.space();
			let iter = this.parseWord();
			this.expectSpaced('in');
			let able = this.parseValue();
			this.space();
			this.expectSpaced("{");
			let body = this.parseProgram();
			this.expectSpaced("}");

			return new shFor(iter, able, body);
		}

		parseWhile() {
			if(!this.maybe("while")) {
				return null;
			}

			this.expectSpaced("(");
			let cond = this.parseProgram();
			this.expectSpaced(")");

			this.expectSpaced("{");
			let body = this.parseProgram();
			this.expectSpaced("}");

			return new shWhile(cond, body);
		}

		parseCommand() {
			let cmd = this.parseWord(), args = [], v;

			if(cmd) {
				this.space();

				while(v = this.parseValue()) {
					args.push(v);

					this.space();
					if(this.maybe(';')) {
						this.space();
						break;
					}
				}

				return new shCommand(cmd, args);
			}
			else {
				return null;
			}
		}

		parseSub() {
			if(!this.maybe("(")) {
				return null;
			}

			//this.space();
			let sub = this.parseProgram();
			this.expectSpaced(")");
			return sub;
		}

		parseOperation() {
			return (
				this.parseIf() ||
				this.parseFor() ||
				this.parseWhile() ||
				this.parseSub() ||
				this.parseJSONPrimitive() ||
				this.parseCommand()
			);
		}

		parseProgram() {
			this.space();

			let cmds = [], cmd;
			while(cmd = this.parseOperation()) {
				cmds.push(cmd);
				this.space();
				this.maybe(';');
				this.space();
			}

			if(cmds.length === 1) {
				return cmds[0];
			}
			else {
				return new shProgram(cmds);
			}
		}

		parse() {
			return this.parseProgram();
		}
	}
})();

document.head.appendChild(tag("script", {src: "/etc/scripts/interpret.js"}));
