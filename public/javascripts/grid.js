var wall = new freewall("#serp");
wall.reset({
	selector: '.result_article',
	animate: true,
	cellW: 200,
	onResize: function() {
		wall.fitWidth();
	}
});
wall.fitWidth();
