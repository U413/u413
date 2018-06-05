if(argv[1] === '--help') {
	shell.echo("Usage: cat [path]");
	shell.echo("ConCATenate a file.");
	return;
}

return await shell.fetchCache.get(argv[1]);
