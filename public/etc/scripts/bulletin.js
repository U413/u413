'use strict';

todo.push(() => {
	const
		bp = $id("bulletin-post"),
		cli = $class("cli");
	
	bp.addEventListener("input", () => {
		cli.placeholder = bp.value;
	});
});
