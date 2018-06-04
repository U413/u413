'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: clear");
  shell.echo("Clear the output.");
  return;
}

shell.clear();
