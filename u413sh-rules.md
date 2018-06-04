u413sh is designed to simplify writing interfaces to u413 API endpoints
and interact with the shell. Because those endpoints operate over POST
using JSON, u413sh's syntax is derived from a mix of extended JSON and
bash. One design goal is for all JSON literals to be valid u413sh code.

```
cmd = closed-value;
shell = cmd value {';' cmd value};
raw-ls = '...'? value {','? '...'? value};
key = string | unquoted;
object = '{' (key ':' '...'? value {','? key ':' '...'? value})? '}';

closed-value =
	# JSON values
	'null' | bool | int | real | string | '[' raw-ls ']' | object |
	# Extended values
	'undefined' | unquoted | env | subshell | block | function;
value = closed-value | raw-ls;

env = '$' + /\S+/;
block = '(' shell ')';
subshell '$' + block;
function = '$'? '(' ')' block;
comment = # .+ $;
```

Values in u413sh are a superset of JSON values:
 * null, bool, int, real, string, list, object

...Plus a few for intermediate processing:
 * undefined, block

Blocks are anything of the form (...) and act as a kind of nullary
function. Prepending them with $ makes them a "subshell", which executes
the code immediately. Functions, with the form ()(...), execute the code
within the same environment and with the same stdout, replacing the
argument variables. If they're prepended by a $, they have their own
stdout which is returned.

Stdout acts like a list which concatenates any lists echo'd to it.
Subshells and functions have their own stdout which is returned.

Builtins:
 * if <cond> <then> ["else"] [else]
 * while <cond> <body>
 * for <var> in <iter> <body>
 * break
 * continue
 * cd <path>
 * clear
 * read ...options
   - -s Silent (for entering passwords)
   - -p Prompt
 * cat <path>
 * eval <expression>
   - if expression is an array or object, evaluate their entries

Command resolution:
 * $PATH (in order)
   - /usr/bin
   - /bin
 * Builtins
