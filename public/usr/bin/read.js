'use strict';

if(argv[1] === '--help') {
  shell.echo("Usage: read [-s] [-p prompt]")
  shell.echo("Prompt the user for input.");
  shell.echo('\t-s  "Silent" (password entry)');
  return;
}

// Read from stdin and fulfill a promise when it's submitted
async function read() {
  shell.stdin.disabled = false;
  shell.realign();
  shell.focus();

  // Return a promise that will only resolve when shell.reader is called.
  return await new Promise((ok, no) => {
    shell.reader = function(body) {
      shell.stdin.focus();
      ok(body);
    }
  });
}

// Read a password
async function readPass() {
  shell.input.classList.add("pass");
  shell.realign();
  shell.focus();

  // Return a promise that will only resolve when shell.reader
  //  is called.
  let p = await new Promise((ok, no) => {
    shell.reader = function(body) {
      shell.stdpass.focus();
      ok(body);
    }
  });

  shell.input.classList.remove("pass");

  return p;
}

let opts = {
  silent: false,
  prompt: ""
};

for(let i = 1; i < argv.length; ++i) {
  let a = argv[i];

  // TODO: implement combined flags, e.g. -sp "Prompt"
  switch(a) {
    case '-s':
      opts.silent = true;
      break;
    case '-p':
      opts.prompt = argv[++i];
      break;
  }
}

let t = shell.current.appendChild(
  tag('div', {class: 'prompt'}, opts.prompt.replace(' ', '\u00a0'))
);
shell.prompt = t;

return await (opts.silent? readPass : read)();
