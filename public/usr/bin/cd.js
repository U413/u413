'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: cd [dir]")
  shell.echo("Without dir, this is equivalent to reload.");
  return;
}

let p = argv[1] + "";
if(p.startsWith('/')) {
  window.location.replace(p);
}
else {
  p = (cwd + p).split('/');

  let v = [];
  // Start at 1 to skip leading slash
  for(let i = 1; i < p.length; ++i) {
    if(p[i] === '' || p[i] === '.') {
      continue;
    }
    else if(p[i] === '..') {
      ++i;
    }
    else {
      v.push(p[i]);
    }
  }

  window.location.replace('/' + v.join("/"));
}

await liar();