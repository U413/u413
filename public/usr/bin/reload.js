'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: reload");
  shell.echo("Reload the current page.");
  return;
}

window.location.reload();
await liar();
