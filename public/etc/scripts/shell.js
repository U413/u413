'use strict';

let
	cli = $id("cli"),
	errdiv = $id("error");

cli.addEventListener("keydown", function(ev) {
	if(ev.key !== "Enter") {
		return false;
	}
	
	let value = this.value || this.placeholder;
	
	let [all, cmd, rest] = /^(\S+)\s+().*)$/g.exec(value);
	if(cmd === 'bulletin') {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				if(xhr.statusCode !== 200) {
					errdiv.textContent = xhr.response;
				}
			}
		}
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
