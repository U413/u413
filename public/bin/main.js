(function() {
	'use strict';
	
	function get_url(url) {
		return new Promise((ok, no) => {
			var req = new XMLHttpRequest();
			req.onreadystatechanged = function() {
				if(this.readyState == 4 && /^2/.test(this.status)) {
					ok(req.responseText);
				}
				else {
					no();
				}
			}
			req.open("GET", url, true);
			req.send(null);
		})
	}
	
	function print_error(err) {
		console.error(err);
	}
	
	document.addEventListener("DOMContentLoaded", () => {
		let form = document.querySelector("form");
		form.addEventListener("submit", e => {
			(async function() {
				try {
					let data = JSON.parse(await get_url("/api.json!"));
				}
				catch(e) {
					print_error(e);
				}
			})();
			
			e.preventDefault();
			return false;
		})
	});
})();
