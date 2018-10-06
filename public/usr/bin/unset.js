'use strict';

if(argv[1] === '--help') {
  subshell.echo("Usage: unset x")
  subshell.echo("Unset an environment variable.");
  return;
}

delete subshell.env[argv[1]];
