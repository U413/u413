'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: return value");
  shell.echo("Exit the current script with the given value.");
  return;
}

throw new shReturn(argv[1]);
