$(document).bind('pageinit', function() {
	$('#cardFront #cardContent').click(function() {
		$.mobile.changePage( $("#cardBack"), {
			transition: "flip"
		});
	});
	
	$('#cardBack #cardContent').click(function() {
		$.mobile.changePage( $("#cardFront"), {
			transition: "flip",
			reverse: true
		});
	});
});