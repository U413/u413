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

let shells = [], s = shell;
while(s) {
	shells.push(s);
	s = s.parent;
}

let env = {};
while(shells.length) {
	let s = shells.pop();
	Object.assign(env, s.env);
  s = s.parent;
}

subshell.echo(env);
