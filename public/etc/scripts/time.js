'use strict';

todo(() => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(parseInt(el.textContent));

		el.textContent =
			(d.getHours() + "").padStart(2, "0") + ":" +
			(d.getMinutes() + "").padStart(2, "0") + ":" +
			(d.getSeconds() + "").padStart(2, "0") + " " +
			(d.getFullYear() + "") + "-" +
			(d.getMonth() + "").padStart(2, "0") + "-" +
			(d.getDate() + "").padStart(2, "0");
		el.title = "HH:MM:SS YYYY-MM-DD";
	}
});
