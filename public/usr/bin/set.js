'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: set name value")
  shell.echo("Set an environment variable.");
  return;
}

subshell.env[argv[1]] = argv[2];
