'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: echo [...]")
  shell.echo("Append to the console output the given values.");
  return;
}

subshell.echo(...argv.slice(1));
