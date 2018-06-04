'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: printenv");
  shell.echo("Print all environment variables.");
  return;
}

function format(x) {
  if(typeof x === 'string') {
    return x;
  }
  else {
    return JSON.stringify(x);
  }
}

let s = subshell;
while(s) {
  for(let v in s.env) {
    shell.echo(v + "=" + format(s.env[v]));
  }
  s = s.parent;
}
