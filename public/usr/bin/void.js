'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: void")
  shell.echo("Get rid of any input, with no output.");
  return;
}

return Symbol.for("void");
