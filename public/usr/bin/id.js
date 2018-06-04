'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: id value")
  shell.echo("Return value.");
  return;
}

return argv[1];
