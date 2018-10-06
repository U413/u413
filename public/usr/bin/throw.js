'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: throw value");
  shell.echo("Exit the shell early with an error message.");
  return;
}

throw new ShellError(argv.slice(1).join(" "));
