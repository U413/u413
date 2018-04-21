'use strict';

/**
 * NOTE: This doesn't work currently.
**/

(async () => {
	if(user.name === 'nobody') {
		shell.log("Looks like you aren't logged in. Do you have a user? (y/n)");
		
		do {
			var res = await shell.read();
		} while(/^[yn]/i.test(res[0]);
		
		res = /^([yn]).*$/.exec(res.toLowerCase());
		if(res == 'y') {
			shell.log("Ok, to login just type: login <username> <password>");
			shell.writePrompt();
			
		}
	}
})();
