'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: eval <js> [...args]")
  shell.echo("Evaluate a javascript string with a limited scope");
  shell.echo("The arguments are exposed as $0, $1, $2, etc.");
  return;
}

let [name, expr, ...args] = argv;

let f = (new Function(
  "'use strict';" +
  "return async function $evalJS(subshell," +
  args.map((v, i) => "$" + (i + 1)).join(",") +
  ") { return " + expr + "}"
))();

try {
  return await f.apply(null, [subshell, ...args]);
}
catch(e) {
  throw new ShellError(name + ` (${expr}): \n` + e.stack);
}
