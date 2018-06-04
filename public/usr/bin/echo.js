'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: echo [...]")
  shell.echo("Append to the console output the given values.");
  return;
}

shell.echo(argv.slice(1).map(v => {
  if(typeof v === 'string') {
    return v;
  }
  else {
    return JSON.stringify(v);
  }
}).join(" "));
