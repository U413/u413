'use strict';

let cli = document.querySelector("#cli");

cli.addEventListener("keydown", function(ev) {
	if(ev.key !== "Enter") {
		return false;
	}
	
	let [cmd, rest] = this.value.split(/\s+/g, 2);
	if(cmd === 'bulletin') {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/dev/api/bulletin");
		xhr.send(encodeURI(rest));
		console.log("Sending", encodeURI(rest));
	}
	
	this.value = "";
});
document.addEventListener('click', () => {
	let cvl = cli.value.length;
	cli.focus();
	cli.setSelectionRange(cvl, cvl);
});
document.getElementsByTagName("main")[0].
	addEventListener("click", ev => ev.stopPropagation());
