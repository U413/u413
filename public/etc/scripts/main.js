'use strict';

document.addEventListener("DOMContentLoaded", () => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(el.textContent);
		
		el.textContent =
			`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ` +
			`${d.getDate()}/${d.getMonth()}/${d.getFullYear()%100}`
	}
});
