'use strict';

const todo = []

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

function fetch(method, url, body, type=null) {
	return new Promise((ok, no) => {
		let xhr = new XMLHttpRequest();
		
		Object.assign(xhr, {
			onreadystatechange() {
				if(this.readyState === 4) {
					// 200
					if(((this.status/100)|0) === 2) {
						ok(this.response);
					}
					else {
						let err = new Error(
							`HTTP request rejected (${this.status})`
						);
						err.status = this.status;
						err.xhr = this;
						
						no(err);
					}
				}
			},
			onabort() {
				let err = new Error("Connection aborted");
				err.xhr = this;
				no(err);
			},
			onerror(err) {
				err.xhr = this;
				no(err);
			},
			ontimeout() {
				let err = new Error("Connection timed out");
				err.xhr = this;
				no(err);
			}
		});
		xhr.open(method, url);
		if(type) {
			xhr.setRequestHeader("Content-Type", type);
		}
		if(typeof body === 'undefined') {
			xhr.send();
		}
		else {
			xhr.send(body);
		}
	})
}
