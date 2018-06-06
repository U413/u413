function todo(f) {
	if(todo.now) {
		f();
	}
	else {
		todo.list.push(f);
	}
}
todo.now = false;
todo.list = [];

document.addEventListener("DOMContentLoaded", () => {
	for(let task of todo.list) {
		task();
	}

	todo.now = true;
	delete todo.list;
});

function byId(id) {
	return document.getElementById(id);
}

/*
 * Create a promise that will never be fulfilled
 *  This is used for commands which reload the page so they don't
 *  exit early and write to the prompt beforehand
**/
function liar() {
	return new Promise(() => 0);
}

/**
 * Very pretty function for composing dynamic HTML structures.
**/
function tag(name, attrs, ...content) {
	let el = document.createElement(name);
	for(let a in attrs) {
		el.setAttribute(a, attrs[a]);
	}
	for(let c of content) {
		if(typeof c === 'string') {
			el.appendChild(document.createTextNode(c));
		}
		else if(c) {
			el.appendChild(c);
		}
		else {
			/* Ignore falsey stuff */
		}
	}
	return el;
}
