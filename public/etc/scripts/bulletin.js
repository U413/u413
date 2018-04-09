'use strict';

todo.push(() => {
	const
		bp = $id("bulletin-post"),
		cli = $id("cli");

	bp.addEventListener("input", () => {
		console.log("GO");
		cli.placeholder = "bulletin " + bp.value;
	});
});
