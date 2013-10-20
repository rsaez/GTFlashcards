$(document).bind('pageinit', function() {
	$('#card_front_page #cardContent').click(function() {
		$.mobile.changePage( $("#card_back_page"), {
			transition: "flip"
		});
	});
	
	$('#card_back_page #cardContent').click(function() {
		$.mobile.changePage( $("#card_front_page"), {
			transition: "flip",
			reverse: true
		});
	});

	
	//Bind to the create so the page gets updated with the listing
	$('#deck_page').bind('pagebeforeshow',function(event, ui){
		console.log('***before showing deck page');
		//Remove the old rows
		$(".flashcard_list_row").remove();
		var user = $.url().fparam("user_id");
		var api_url = "api/flashcard";
		if (user) {
			var api_url = "api/user/" + user + "/flashcard";
		}
		
		//JQuery Fetch The New Ones
		$.ajax({
			url: api_url,
			dataType: "json",
					async: false,
					success: function(data, textStatus, jqXHR) {
						console.log(data);
						//Create The New Rows From Template
						$("#flashcard_list_row_template").tmpl(data).appendTo("#flashcard_list");
					},
					error: ajaxError
		});
		
		$('#flashcard_list').listview('refresh');
	}); 
	
});

function ajaxError(jqXHR, textStatus, errorThrown){
	console.log('ajaxError '+textStatus+' '+errorThrown);
	$('#error_message').remove();
	$("#error_message_template").tmpl( {errorName: textStatus, errorDescription: errorThrown} ).appendTo( "#error_dialog_content" );
	$.mobile.changePage($('#error_dialog'), {
		transition: "pop",
		reverse: false,
		changeHash: false
	});
}