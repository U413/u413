'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: unset x")
  shell.echo("Unset an environment variable.");
  return;
}

delete shell.env[argv[1]];
