'use strict';

const todo = [], cwd = window.location.pathname;

todo.push(() => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(el.textContent);
		
		el.textContent =
			(d.getHours() + "").padStart(2, "0") + ":" +
			(d.getMinutes() + "").padStart(2, "0") + ":" +
			(d.getSeconds() + "").padStart(2, "0") + " " +
			(d.getFullYear() + "") + "-" +
			(d.getMonth() + "").padStart(2, "0") + "-" +
			(d.getDate() + "").padStart(2, "0");
		el.title = "HH:MM:SS YYYY-MM-DD"
	}
});

document.addEventListener("DOMContentLoaded", () => {
	for(let task of todo) {
		task();
	}
});

function $id(id) {
	return document.getElementById(id);
}

function $class(k) {
	return document.getElementsByClassName(k);
}

function fetch(method, url, body="") {
	return new Promise((ok, no) => {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(this.readyState === 4) {
				if(this.statusCode%100 === 2) {
					ok(this.response);
				}
				else {
					let err = new Error("HTTP request rejected ()");
					err.statusCode = this.statusCode;
					err.xhr = this;
					
					no(err);
				}
			}
		}
		xhr.open(method, url);
		if(body) {
			xhr.send(body);
		}
	})
}
