if(argv[1] === '--help') {
	shell.echo("Usage: ls [dir]");
	shell.echo("List the files in the directory. dir defaults to cwd.");
	return;
}

let dir = argv[1] || subshell.getEnv("path");

if(!dir.startsWith("/")) {
	dir = subshell.getEnv("PWD") + dir;
}

// Use lsCache instead of /ls/bin directly
return (await shell.lsCache.get(dir)).map(v => v.name);
