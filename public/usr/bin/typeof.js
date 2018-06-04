'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: typeof value")
  shell.echo("Return the JS type of the value.");
  return;
}

return typeof argv[1];
