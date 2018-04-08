/**
 * Submits forms when enter is pressed on an input.
**/

'use strict';

document.addEventListener("DOMContentLoaded", () => {
	for(let fin of document.querySelectorAll("form input")) {
		fin.addEventListener('keydown', function(ev) {
			if(ev.key === "Enter") {
				this.parentNode.submit();
			}
		})
	}
});
