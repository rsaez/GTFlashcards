var decks;
var allFlashcards;
var tags;
//var courses;
var allFlashcardsCount = -1;
var courseDepts = [];

var currentDeckIndex = -1;
var currentFlashcardIndex = -1;
var currentCourseDeptIndex = -1;
var currentCourseCodeIndex = -1;
var currentTagIndex = -1;
var currentCourseIndex = -1;

var section = 0; //0=decks, 1=tags, 2=courses
var DECK_SECTION = 0;
var TAG_SECTION = 1;
var COURSE_SECTION = 2;

var subset = 0; //0=all, 1=unknown, 2=known
var ALL = 0;
var UNKNOWN = 1;
var KNOWN = 2

var currentFlashcardPage = 1;

$(document).bind("mobileinit", function(){
  $.mobile.defaultPageTransition = 'slide';
	myAjax('INDEX', 'account', null);
	
	//load course depts
	courseDepts = [];
	myAjax('INDEX', 'course', null, function(data) {
		var courseDeptList = $('#course_dept_list');
		for (var i = 0; i < data.length; i++) {
			var course_dept = data[i].course_dept;
			courseDepts.push(new CourseDept(course_dept));
			courseDeptList.append($('<li>').append($('<a href="#cloud_course_code_page" onclick="setCurrentCourseDept('+i+')">').text(course_dept)));
		}
	});
	
	$('#edit_deck_dialog').dialog();
});

$(document).bind('pageinit', function() {
	//Get decks of the user
	$('#my_decks_page').unbind();
	$('#my_decks_page').bind('pagebeforeshow',function(event, indata){
		currentDeckIndex = -1;
		section = 0;
		downloadDecks(function() {
			if(decks.length > 0) {
				showDecks();
			} else {
				console.log('showing no decks message');
				$('#noDecksPane').show();
				$('#hasDecksPane').hide();
			}
		});
	});
	
	$('#deck_page').unbind();
	$('#deck_page').bind('pagebeforeshow',function(event, indata){
		$('.flashcard_list_row').remove();
		if (currentDeckIndex == -1) {
			$('.deck_name').text('All Flashcards');
			$('.deck-content').hide();
			$('.allFlashcards-content').show();
			downloadAllFlashcards(function() {
				showFlashcards($('#deck_page'), allFlashcards);
			});
		} else { 
			$('.deck_name').text(decks[currentDeckIndex].name);
			$('.allFlashcards-content').hide();
			$('.deck-content').show();
			if (!decks[currentDeckIndex].flashcards) {
				downloadFlashcardsInDeck(currentDeckIndex, function() {
					showFlashcards($('#deck_page'), decks[currentDeckIndex].flashcards);
				});
			} else {
				showFlashcards($('#deck_page'), decks[currentDeckIndex].flashcards);
			}
		}
	});
	
	$('#cloud_course_code_page').unbind();
	$('#cloud_course_code_page').bind('pagebeforeshow',function(event, indata){
		currentCourseIndex = -1;
		section = 2;
		
		var courseDept = courseDepts[currentCourseDeptIndex];
		downloadCourseCodes(courseDept, function() {
			showCourseCodes();
		});
	});
	
	$('#cloud_course_code_flashcards_page').unbind();
	$('#cloud_course_code_flashcards_page').bind('pagebeforeshow',function(event, indata){
		var currentCourseCode = getCurrentCourseCode();
		$('.course_code').text(currentCourseCode.code);
		$('.course_full_code').text(currentCourseCode.dept+' '+currentCourseCode.code);
		$('.flashcard_list_row').remove();
		downloadFlashcardsInCourse(currentCourseCode, function() {
			showFlashcards($('#cloud_course_code_flashcards_page'), currentCourseCode.flashcards);
		});
	});
	
	$('#cloud_tag_page').unbind();
	$('#cloud_tag_page').bind('pagebeforeshow',function(event, indata){
		currentTagIndex = -1;
		section = 1;
		downloadTags(function() {
			showTags();
		});
	});
	
	$('#cloud_tag_flashcards_page').unbind();
	$('#cloud_tag_flashcards_page').bind('pagebeforeshow',function(event, indata){
		$('.tag_name').text(tags[currentTagIndex].name);
		$('.flashcard_list_row').remove();
		downloadFlashcardsInTag(currentTagIndex, function() {
			showFlashcards($('#cloud_tag_flashcards_page'), tags[currentTagIndex].flashcards);
		});
	});
	
	
	$('#new_flashcard_dialog').unbind();
	$('#new_flashcard_dialog').bind('pagebeforeshow',function(event, indata){
		$('#newFlashcardQuestion').val('');
		$('#newFlashcardAnswer').val('');
		$('#newFlashcardTags').val('');
		//$('#newDeckSelect #firstOption').attr('selected','selected');
		$('#newDeckSelect option[value="'+currentDeckIndex+'"]').attr('selected','selected');
		$('#newDeckSelect').selectmenu('refresh');
		$('#newCourseCode').val('');
		setCheckbox($('#newMakePublicCheckbox'), false);
		setCheckbox($('#newAnonymityCheckbox'), false);
	});
	
	$('#edit_flashcard_dialog').unbind();
	$('#edit_flashcard_dialog').bind('pagebeforeshow',function(event, indata){
		var currentFlashcard = getCurrentFlashcard();
		if (currentFlashcard) {
			$('#editFlashcardQuestion').val(currentFlashcard.question);
			$('#editFlashcardAnswer').val(currentFlashcard.answer);
			$('#editFlashcardTags').val(currentFlashcard.tags.join(' '));
			$('#editDeckSelect option[value="' + currentDeckIndex + '"]').attr('selected','selected');
			$('#editDeckSelect').selectmenu('refresh');
			$('#editCourseCode').val(currentFlashcard.course_dept+' '+currentFlashcard.course_code);
			setCheckbox($('#editMakePublicCheckbox'), currentFlashcard.isPublic);
			setCheckbox($('#editAnonymityCheckbox'), currentFlashcard.isAnonymous);
		} else {
			$('#editFlashcardQuestion').val('');
			$('#editFlashcardAnswer').val('');
			$('#editFlashcardTags').val('');
			$('#editDeckSelect option[value="-1"]').attr('selected','selected');
			$('#editCourseCode').val('');
			setCheckbox($('#editMakePublicCheckbox'), false);
			setCheckbox($('#editAnonymityCheckbox'), false);
		}
	});
	
	$('#save_flashcard_dialog').unbind();
	$('#save_flashcard_dialog').bind('pagebeforeshow',function(event, indata){
		var currentFlashcard = getCurrentFlashcard();
		$('#saveFlashcardQuestion').text(currentFlashcard.question);
		$('#saveDeckSelect #firstOption').attr('selected','selected');
		if (!decks) {
			downloadDecks(function() {
				for (var i = 0; i < decks.length; i++) {
					var deckName = decks[i].name;
					$('#saveDeckSelect').append($('<option class="deck_option" value="'+i+'">').text(deckName));
				}
				$('#saveDeckSelect').selectmenu('refresh');
			});
		} else {
			$('#saveDeckSelect').selectmenu('refresh');
		}
	});
	
	$('#card_front_page_1').unbind();
	$('#card_front_page_1').swipeleft(function(event){ goToFlashcard(currentFlashcardIndex+1, 2, false) });
	$('#card_front_page_1').swiperight(function(){ goToFlashcard(currentFlashcardIndex-1, 2, true) });
	
	$('#card_back_page_1').unbind();
	$('#card_back_page_1').swipeleft(function(){ goToFlashcard(currentFlashcardIndex+1, 2, false) });
	$('#card_back_page_1').swiperight(function(){ goToFlashcard(currentFlashcardIndex-1, 2, true) });
	
	$('#card_front_page_2').unbind();
	$('#card_front_page_2').swipeleft(function(){ goToFlashcard(currentFlashcardIndex+1, 1, false) });
	$('#card_front_page_2').swiperight(function(){ goToFlashcard(currentFlashcardIndex-1, 1, true) });
	
	$('#card_back_page_2').unbind();
	$('#card_back_page_2').swipeleft(function(){ goToFlashcard(currentFlashcardIndex+1, 1, false) });
	$('#card_back_page_2').swiperight(function(){ goToFlashcard(currentFlashcardIndex-1, 1, true) });
	
	$('#flashcard_front_1').unbind();
	$('#flashcard_front_1').tap(function(){ 
		console.log('flashcard front 1 tapped');
		if ($.mobile.activePage.attr('id') == 'card_front_page_1') {
			$.mobile.changePage($("#card_back_page_1"), {
				transition: 'flip'
			});
		}
	});
	$('#flashcard_back_1').unbind();
	$('#flashcard_back_1').tap(function(){ 
		if ($.mobile.activePage.attr('id') == 'card_back_page_1') {
			$.mobile.changePage($("#card_front_page_1"), {
				transition: 'flip',
				reverse: true
			});
		}
	});
	$('#flashcard_front_2').unbind();
	$('#flashcard_front_2').tap(function(){ 
		if ($.mobile.activePage.attr('id') == 'card_front_page_2') {
			$.mobile.changePage($("#card_back_page_2"), {
				transition: 'flip'
			});
		}
	});
	$('#flashcard_back_2').unbind();
	$('#flashcard_back_2').tap(function(){ 
		if ($.mobile.activePage.attr('id') == 'card_back_page_2') {
			$.mobile.changePage($("#card_front_page_2"), {
				transition: 'flip',
				reverse: true
			});
		}
	});
	
	
	$('#newMakePublicCheckbox').unbind();
	$('#newMakePublicCheckbox').click(function() {
		console.log('***make public checkbox clicked');
		var checkbox = $('#newAnonymityCheckbox');
		if($(this).is(':checked')){ //enable the fields
			checkbox.attr('disabled',false);
			checkbox.closest('.ui-checkbox').removeClass('ui-disabled');
		} else { //disable them
			checkbox.attr('disabled','');
			checkbox.closest('.ui-checkbox').addClass('ui-disabled');
		}
	});
	
	$('#editMakePublicCheckbox').unbind();
	$('#editMakePublicCheckbox').click(function() {
		console.log('***make public checkbox clicked');
		var checkbox = $('#editAnonymityCheckbox');
		if($(this).is(':checked')){ //enable the fields
			checkbox.attr('disabled',false);
			checkbox.closest('.ui-checkbox').removeClass('ui-disabled');
		} else { //disable them
			checkbox.attr('disabled','');
			checkbox.closest('.ui-checkbox').addClass('ui-disabled');
		}
	});
	
	$('.knownCheckbox').unbind();
	$('.knownCheckbox').click(function() {
		console.log('***known checkbox clicked');
		toggleFlashcardKnown(); //$(this).is(':checked'));
	});
	
	
	$('#new_deck_dialog').unbind();
	$('#new_deck_dialog').bind('pagebeforeshow',function(event, indata){
		$('#newDeckName').val('');
	});
	
	$('#edit_deck_dialog').unbind();
	$('#edit_deck_dialog').bind('pagebeforeshow',function(event, indata){
		$('#editDeckName').val(decks[currentDeckIndex].name);
	});
	
});

function getCurrentCourseCode() {
	return courseDepts[currentCourseDeptIndex].codes[currentCourseCodeIndex];
}

function toggleFlashcardKnown() {
	if (currentDeckIndex > -1) {
		var currentFlashcard = getCurrentFlashcard();
		var flashcardId = currentFlashcard.id;
		var deckId = decks[currentDeckIndex].id;
		myAjax('POST', 'toggle_known', { flashcard_id:flashcardId, deck_id:deckId }, function() {
			currentFlashcard.setKnown(!currentFlashcard.isKnown);
			console.log('***successfully toggled flashcard known to '+currentFlashcard.isKnown);
			updateCurrentFlashcardContent();
		});
	}
}

function setCheckbox(checkbox, setChecked) {
	var label = checkbox.prev();
	if (setChecked) {
		label.find('.ui-icon').removeClass('ui-icon-checkbox-off').addClass('ui-icon-checkbox-on');
		label.removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
	} else {
		label.find('.ui-icon').removeClass('ui-icon-checkbox-on').addClass('ui-icon-checkbox-off');
		label.removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
	}
}

function setCurrentDeck(index) {
	console.log('set current deck, index='+index);
	currentDeckIndex = index;
}

function setCurrentCourseDept(index) {
	console.log('set current course dept, index='+index);
	currentCourseDeptIndex = index;
}

function setCurrentCourseCode(index) {
	console.log('set current course code, index='+index);
	currentCourseCodeIndex = index;
}

function setCurrentTagIndex(index) {
	console.log('set current tag, index='+index);
	currentTagIndex = index;
}

function downloadDecks(callback) {
	decks = [];
	myAjax('INDEX', 'deck', null, function(data) {
		for (var i = 0; i < data.length; i++) {
			var deck_id = data[i].id;
			var deck_name = decodeURIComponent(data[i].name);
			myAjax('POST', 'count_in_deck', { deck_id:deck_id }, function(data) { //too slow
				var count = data[0].count;
				decks.push(new Deck(deck_id, deck_name, count));
			});
		}
		callback();
	});
}

function downloadTags(callback) {
	tags = [];		
	myAjax('INDEX', 'tag', null, function(data) {
		for (var i = 0; i < data.length; i++) {
			var tagName = data[i].label;
			if (tagName)
				tags.push(new Tag(tagName));
		}
		callback();
	});
}

function downloadCourseCodes(courseDept, callback) {
	courseDept.codes = [];
	var cnt = 0;
	myAjax('POST', 'course', { dept:courseDept.dept }, function(data) {
		for (var i = 0; i < data.length; i++) {
			var courseCode = data[i].course_code;
			myAjax('POST', 'count', { dept:courseDept.dept, code:courseCode }, function(data2) {
				var count = data2[0].count;
				courseDept.codes.push(new CourseCode(courseDept.dept, courseCode, count));
				cnt++;
			});
		}
		var intrvl = setInterval(function() {
			if (cnt>=data.length) {
				clearInterval(intrvl);
				callback();
			}
		}, 100);
	});
}

function showCourseCodes() {
	var courseDept = courseDepts[currentCourseDeptIndex].dept;
	var courseCodes = courseDepts[currentCourseDeptIndex].codes;
	
	$('.course_dept').text(courseDept);
	$('.course_code_list_row').remove();
	$('#course_code_list').listview();
	for (var i = 0; i < courseCodes.length; i++) {
		var count = courseCodes[i].count;
		var dept = courseCodes[i].dept;
		var code = courseCodes[i].code;
		$('#course_code_list').append($('<li class="course_code_list_row">').append($('<a href="#cloud_course_code_flashcards_page" onclick="setCurrentCourseCode('+i+')">').text(dept+' '+code).append($('<span class="ui-li-count">'+count+'</span>'))));
	}
	$('#course_code_list').listview('refresh');
}

function showDecks() {
	$('#noDecksPane').hide();
	$('.deck_list_row').remove();
	$('.deck_option').remove();
	for (var i = 0; i < decks.length; i++) {
		var deck_id = decks[i].id;
		var deck_name = decks[i].name;
		var deck_count = decks[i].count;
		$('#deck_list').append($('<li class="deck_list_row">').append($('<a href="#deck_page" onclick="setCurrentDeck('+i+')">').text(deck_name).append($('<span class="ui-li-count">'+deck_count+'</span>'))));
		$('#newDeckSelect').append($('<option class="deck_option" value="'+i+'">').text(deck_name));
		$('#editDeckSelect').append($('<option class="deck_option" value="'+i+'">').text(deck_name));
		$('#saveDeckSelect').append($('<option class="deck_option" value="'+i+'">').text(deck_name));
	}
	myAjax('INDEX', 'count_in_deck', null, function(data) {
		allFlashcardsCount = data[0].count;
		$('#deck_list').append($('<li class="deck_list_row">').append($('<a href="#deck_page" onclick="setCurrentDeck(-1)">').text('All Flashcards').append($('<span class="ui-li-count">'+allFlashcardsCount+'</span>'))));				
		$('#deck_list').listview('refresh');
		$('#hasDecksPane').show();
	});
}

function showTags() {
	$('.cloud_tag_list_row').remove();
	for (var i = 0; i < tags.length; i++) {
		var tagName = tags[i].name;
		$('#cloud_tag_list').append($('<li class="cloud_tag_list_row">').append($('<a href="#cloud_tag_flashcards_page" onclick="setCurrentTagIndex('+i+')">').text(tagName)));
	}
	$('#cloud_tag_list').listview('refresh');
}

function createDeck() {
	console.log('create deck clicked');
	var newDeckName = $('#newDeckName').val();
	myAjax('POST', 'create_deck', { 'name': encodeURIComponent(newDeckName) }, function(data) {
		console.log('***successfully created deck "'+newDeckName+'"');
		downloadDecks(function() {
			showDecks();
		});
	});
}

function editDeck() {
	console.log('edit deck clicked');
	var deckId = decks[currentDeckIndex].id;
	var deckName = $('#editDeckName').val();
	myAjax('POST', 'rename_deck', { deck_id:deckId, new_name:encodeURIComponent(deckName) }, function() {
		console.log('successfully renamed deck to "'+deckName+'"');
		downloadDecks(function() {
			showDecks();
		});
	});
}

function removeFlashcardsFromDeck(flashcards, deckId, callback) {
	if (flashcards.length == 0) {
		callback();
	} else {
		var flashcard = flashcards.pop();
		removeFlashcardFromDeck(flashcard.id, deckId, function() {
			removeFlashcardsFromDeck(flashcards, deckId, callback);
		});
	}
}

function deleteFlashcards(flashcards, callback) {
	console.log('***in deleteFlaschards, length='+flashcards.length);
	if (flashcards.length == 0) {
		callback();
	} else {
		var flashcard = flashcards.pop();
		myAjax('DELETE', 'flashcard/'+flashcard.id, null, function(data) {
			console.log('***successfully deleted flashcard');
			deleteFlashcards(flashcards, callback);
		});
	}
}

function deleteDeck() {
	if (currentDeckIndex > -1) {
		var currentFlashcards = getCurrentFlashcards();
		var deckId = decks[currentDeckIndex].id;
		if(currentFlashcards) {
			removeFlashcardsFromDeck(currentFlashcards.slice(0), deckId, function() {
				myAjax('POST', 'delete_deck', { 'deck_id' : deckId }, function(data) {
					console.log('***successfully deleted deck, id='+deckId);
					downloadDecks(function() {
						showDecks();
					});
				});
			});
		} else {
			myAjax('POST', 'delete_deck', { 'deck_id' : deckId }, function(data) {
				console.log('***successfully deleted deck, id='+deckId);
				downloadDecks(function() {
					showDecks();
				});
			});
		}
	}
}

function deleteDeckAndFlashcards() {
	if (currentDeckIndex > -1) {
		var currentFlashcards = getCurrentFlashcards();
		var deckId = decks[currentDeckIndex].id;
		if(currentFlashcards) {
			deleteFlashcards(currentFlashcards.slice(0), function() {
				myAjax('POST', 'delete_deck', { 'deck_id' : deckId }, function(data) {
					console.log('***successfully deleted deck, id='+deckId);
					downloadDecks(function() {
						showDecks();
					});
				});
			});
		} else {
			myAjax('POST', 'delete_deck', { 'deck_id' : deckId }, function(data) {
				console.log('***successfully deleted deck, id='+deckId);
				downloadDecks(function() {
					showDecks();
				});
			});
		}
	}
}

function getCurrentFlashcard() {
	if (currentFlashcardIndex == -1)
		return null;
		
	var currentFlashcards = getCurrentFlashcards();
	return currentFlashcards[currentFlashcardIndex];
}

function goToFlashcard(index, pageNumber, rvrse) {
	var currentFlashcards = getCurrentFlashcards();
	if (index == -1)
		currentFlashcardIndex = currentFlashcards.length-1;
	else if (index == currentFlashcards.length) {
		currentFlashcardIndex = 0;
	} else {
		currentFlashcardIndex = index;
	}
	console.log('going to flashcard, index='+currentFlashcardIndex+' on page='+pageNumber);
	
	//update content
	currentFlashcardPage = pageNumber;
	
	downloadFlashcard(currentFlashcards[currentFlashcardIndex].id, function() {
		updateCurrentFlashcardContent(function() {
			$.mobile.changePage($("#card_front_page_" + pageNumber), {
				transition: 'slide',
				reverse: rvrse,
				reloadPage : true
			});
		});
	});
	
}

function getCurrentFlashcards() {
	var currentFlashcards;
	if (section == DECK_SECTION) {
		currentFlashcards = allFlashcards;
		if (currentDeckIndex > -1)
			currentFlashcards = decks[currentDeckIndex].flashcards;
	} else if (section == TAG_SECTION) {
		currentFlashcards = tags[currentTagIndex].flashcards;
	} else if (section == COURSE_SECTION) {
		currentFlashcards = courseDepts[currentCourseDeptIndex].codes[currentCourseCodeIndex].flashcards;
	}
	return currentFlashcards;
}

function updateCurrentFlashcardContent(callback) {
	var flashcard = getCurrentFlashcard();
	var cardFrontPage = $('#card_front_page_'+currentFlashcardPage);
	var cardBackPage = $('#card_back_page_'+currentFlashcardPage);
	
	if (section == DECK_SECTION) {
		cardFrontPage.find('#header_link').attr('href','#deck_page');
		cardBackPage.find('#header_link').attr('href','#deck_page');
		$('.tag-content').hide();
		$('.course-content').hide();
		$('.deck-content').show();
	} else if (section == TAG_SECTION) {
		cardFrontPage.find('#header_link').attr('href','#cloud_tag_flashcards_page');
		cardBackPage.find('#header_link').attr('href','#cloud_tag_flashcards_page');
		$('.deck-content').hide();
		$('.course-content').hide();
		$('.tag-content').show();
	} else if (section == COURSE_SECTION) {
		cardFrontPage.find('#header_link').attr('href','#cloud_course_code_flashcards_page');
		cardBackPage.find('#header_link').attr('href','#cloud_course_code_flashcards_page');
		$('.deck-content').hide();
		$('.tag-content').hide();
		$('.course-content').show();
	}
	if (currentFlashcardIndex > -1) {
		var flashcardIndex = currentFlashcardIndex;
		var flashcards = getCurrentFlashcards();
		cardFrontPage.find('.flashcard_heading').text((flashcardIndex+1) + ' of ' + flashcards.length);
		cardBackPage.find('.flashcard_heading').text((flashcardIndex+1) + ' of ' + flashcards.length);
	}
	cardFrontPage.find('.flashcard_question').text(flashcard.question);
	cardBackPage.find('.flashcard_answer').text(flashcard.answer);
	cardFrontPage.find('.upvoteCount').text(flashcard.upvotes);
	cardBackPage.find('.upvoteCount').text(flashcard.upvotes);
	cardFrontPage.find('.author').text(flashcard.creator);
	cardBackPage.find('.author').text(flashcard.creator);
	setCheckbox(cardFrontPage.find('.knownCheckbox'), flashcard.isKnown);
	setCheckbox(cardBackPage.find('.knownCheckbox'), flashcard.isKnown);
	
	//download isknown here
	
	if (!flashcard.tags) {
		downloadTagsForFlashcard(flashcard, function() {
			cardFrontPage.find('.flashcard_tags').text(flashcard.tags.join(', '));
			cardBackPage.find('.flashcard_tags').text(flashcard.tags.join(', '));
			if (callback)
				callback();
		});
	} else {
		cardFrontPage.find('.flashcard_tags').text(flashcard.tags.join(', '));
		cardBackPage.find('.flashcard_tags').text(flashcard.tags.join(', '));
		if (callback)
			callback();
	}
}

function downloadTagsForFlashcard(flashcard, callback) {
	myAjax('POST', 'tags_of_card', { flashcard_id:flashcard.id }, function(data) {
		var tags = [];
		if (data) {
			for (var i = 0; i < data.length; i++) {
				tags.push(data[i].tag_label);
			}
		}
		flashcard.tags = tags;
		callback();
	}, true);
}

function shuffleFlashcards() {
	var currentFlashcards;
	if (currentDeckIndex == -1) {
		allFlashcards = shuffle(allFlashcards);
		currentFlashcards = allFlashcards;
	} else {
		decks[currentDeckIndex].flashcards = shuffle(decks[currentDeckIndex].flashcards);
		currentFlashcards = decks[currentDeckIndex].flashcards;
	}
	
	if (subset == KNOWN) {
		showFlashcards($('#deck_page'), findKnownFlashcards(currentFlashcards));
	} else if (subset == UNKNOWN) {
		showFlashcards($('#deck_page'), findUnknownFlashcards(currentFlashcards));
	} else if (subset == ALL) {
		showFlashcards($('#deck_page'), currentFlashcards);
	}
}

function downloadFlashcardsInDeck(deckIndex, callback) {
	var flashcards = [];
	var deckId = decks[deckIndex].id;
	myAjax('POST', 'cards_in_deck', { 'deck_id': deckId }, function(data) {
		//console.log('***imhere');
		//console.log(data[0]);
		for (var i = 0; i < data.length; i++) {
			var flashcardId = data[i].id;
			flashcards.push(
				new Flashcard(
					flashcardId,
					decodeURIComponent(data[i].creator),
					decodeURIComponent(data[i].question),
					decodeURIComponent(data[i].answer),
					decodeURIComponent(data[i].course_dept),
					decodeURIComponent(data[i].course_code), 
					data[i].upvotes,
					data[i].downvotes,
					data[i].isPublic,
					data[i].isAnonymous
				)
			);
		}
		decks[deckIndex].flashcards = flashcards;
		if (callback)
			callback();
	});
}

function downloadFlashcardsInTag(tagIndex, callback) {
	var flashcards = [];
	myAjax('POST', 'search_by_tag', { 'label': tags[tagIndex].name }, function(data) {
		for (var i = 0; i < data.length; i++) {
			flashcards.push(
				new Flashcard(
					data[i].id, 
					decodeURIComponent(data[i].creator),
					decodeURIComponent(data[i].question),
					decodeURIComponent(data[i].answer),
					decodeURIComponent(data[i].course_dept),
					decodeURIComponent(data[i].course_code), 
					data[i].upvotes,
					data[i].downvotes,
					data[i].isPublic,
					data[i].isAnonymous
				)
			);
		}
		tags[tagIndex].flashcards = flashcards;
		if (callback)
			callback();
	});
}

function downloadFlashcardsInCourse(courseCode, callback) {
	var flashcards = [];
	myAjax('POST', 'cards_in_course', { 'dept':courseCode.dept, 'code':courseCode.code }, function(data) {
		for (var i = 0; i < data.length; i++) {
			flashcards.push(
				new Flashcard(
					data[i].id, 
					decodeURIComponent(data[i].creator),
					decodeURIComponent(data[i].question),
					decodeURIComponent(data[i].answer),
					decodeURIComponent(data[i].course_dept),
					decodeURIComponent(data[i].course_code), 
					data[i].upvotes,
					data[i].downvotes,
					data[i].isPublic,
					data[i].isAnonymous
				)
			);
		}
		courseCode.flashcards = flashcards;
		if (callback)
			callback();
	});
}

function downloadAllFlashcards(callback) {
	var flashcards = [];
	myAjax('INDEX', 'cards_in_deck', null, function(data) {
		for (var i = 0; i < data.length; i++) {
			flashcards.push(
				new Flashcard(
					data[i].id, 
					decodeURIComponent(data[i].creator), 
					decodeURIComponent(data[i].question), 
					decodeURIComponent(data[i].answer),
					decodeURIComponent(data[i].course_dept),
					decodeURIComponent(data[i].course_code), 
					data[i].upvotes,
					data[i].downvotes,
					data[i].isPublic,
					data[i].isAnonymous
				)
			);
		}
		allFlashcards = flashcards;
		allFlashcardsCount = data.length;
		callback();
	});
}

function showFlashcards(page, flashcards) {
	var flashcardList = page.find('#flashcard_list');
	page.find('.flashcard_list_row').remove();
	flashcardList.listview();
	for (var i = 0; i < flashcards.length; i++) {
		var flashcard_id = flashcards[i].id;
		var question = flashcards[i].question;
		var answer = flashcards[i].answer;
		var upvotes = flashcards[i].upvotes;
		flashcardList.append($('<li class="flashcard_list_row">').append($('<a href="#" onclick="goToFlashcard('+i+', 1)">').text(question)));
	}
	flashcardList.listview('refresh');
}

function createFlashcard() {
	var question = $('#newFlashcardQuestion').val();
	var answer = $('#newFlashcardAnswer').val();
	var tags = parseTags($('#newFlashcardTags').val());
	var deckIndex = $( "#newDeckSelect option:selected").val();
	
	var course = $('#newCourseCode').val();
	var course_dept = '';
	var course_code = '';
	if (course) {
		var courseSplit = course.split(' ');
		var course_dept = courseSplit[0].trim().toUpperCase();
		var course_code = courseSplit[1].trim();
	}
	
	var isPublic = $('#newMakePublicCheckbox').is(':checked');
	if (isPublic)
		var isAnonymous = $('#newAnonymityCheckbox').is(':checked');
	
	var newFlashcardData = { 
		'question' : encodeURIComponent(question), 
		'answer' : encodeURIComponent(answer),
		'course_dept' : encodeURIComponent(course_dept),
		'course_code' : encodeURIComponent(course_code),
		'private' : (isPublic ? 0 : 1),
		'anonymous' : (isAnonymous ? 1 : 0)
	};
	
	createFlashcardFromData(newFlashcardData, deckIndex, tags, function() {
		if(deckIndex == currentDeckIndex) {
			if (deckIndex == -1)
				showFlashcards($('#deck_page'), allFlashcards);
			else
				showFlashcards($('#deck_page'), decks[deckIndex].flashcards);
		}
	});
}

function editFlashcard() {
	var question = $('#editFlashcardQuestion').val();
	var answer = $('#editFlashcardAnswer').val();
	var tags = parseTags($('#editFlashcardTags').val());
	var deckIndex = $( "#editDeckSelect option:selected").val();
	
	var course = $('#editCourseCode').val();
	var course_dept = '';
	var course_code = '';
	if (course) {
		var courseSplit = course.split(' ');
		var course_dept = courseSplit[0].trim().toUpperCase();
		var course_code = courseSplit[1].trim();
	}
	
	var isPublic = $('#editMakePublicCheckbox').is(':checked');
	var isAnonymous = false;
	if (isPublic)
		var isAnonymous = $('#editAnonymityCheckbox').is(':checked');
	
	var currentFlashcard = getCurrentFlashcard();
	var flashcardId = currentFlashcard.id;
	var editFlashcardData = { 
		'id' : flashcardId,
		'question' : encodeURIComponent(question), 
		'answer' : encodeURIComponent(answer),
		'course_dept' : encodeURIComponent(course_dept),
		'course_code' : encodeURIComponent(course_code),
		'private' : (isPublic ? 0 : 1),
		'anonymous' : (isAnonymous ? 1 : 0)
	};
	
	myAjax('POST', 'edit_flashcard', editFlashcardData, function(data) {
		console.log('***successfully edited flashcard');
		var newTags = findNewTags(currentFlashcard.tags, tags);
		addTagsToFlashcard(flashcardId, newTags, function() {
			if (deckIndex != currentDeckIndex) {
				if (deckIndex > -1) {
					addFlashcardToDeck(flashcardId, decks[deckIndex].id, function() {
						if (currentDeckIndex > -1) {
							removeFlashcardFromDeck(flashcardId, decks[currentDeckIndex].id, function() {
								//currentFlashcard.update(question, answer, tags, course_dept, course_code, isPublic, isAnonymous);
								downloadFlashcard(flashcardId, function() {
									$.mobile.changePage($("#deck_page"), {
										transition:'slide',
										reverse:true 
									});
								});
							});
						} else {
							//currentFlashcard.update(question, answer, tags, course_dept, course_code, isPublic, isAnonymous);
							downloadFlashcard(flashcardId, function() {
								$.mobile.changePage($("#deck_page"), {
									transition:'slide',
									reverse:true
								});
							});
						}
					});
				} else {
					removeFlashcardFromDeck(flashcardId, decks[currentDeckIndex].id, function() {
						//currentFlashcard.update(question, answer, tags, course_dept, course_code, isPublic, isAnonymous);
						downloadFlashcard(flashcardId, function() {
							$.mobile.changePage($("#deck_page"), {
								transition:'slide',
								reverse:true 
							});
						});
					});
				}
			} else {
				downloadFlashcard(flashcardId, function() {
					updateCurrentFlashcardContent(function() {
						//$('#edit_deck_dialog').dialog();
						//$('#edit_deck_dialog').dialog('close');
						//$('#edit_deck_dialog a[title=Close]').click();
						history.back();
					});
				});
				//currentFlashcard.update(question, answer, tags, course_dept, course_code, isPublic, isAnonymous);
				//updateCurrentFlashcardContent();
			}
		});
	});
}

function downloadFlashcard(flashcardId, callback) {
	myAjax('GET', 'flashcard/'+flashcardId, null, function(data) {
		console.log('***successfully downloaded flashcard');
		var currentFlashcard = getCurrentFlashcard();
		currentFlashcard.update(
			decodeURIComponent(data.creator), 
			decodeURIComponent(data.question), 
			decodeURIComponent(data.answer), 
			decodeURIComponent(data.course_dept), 
			decodeURIComponent(data.course_code), 
			data.upvotes, 
			data.downvotes, 
			data.isPublic, 
			data.isAnonymous
		);
		callback();
	});
}

function findNewTags(previousTags, currentTags) {
	var newTags = [];
	var tagsObj = {};
	for (var i = 0; i < previousTags.length; i++) {
		tagsObj[previousTags[i]] = true;
	}
	for (var i = 0; i < currentTags.length; i++) {
		if (!tagsObj[currentTags[i]])
			newTags.push(currentTags[i]);
	}
	return newTags;
}

function deleteFlashcard() {
	var flashcardId = getCurrentFlashcard().id;
	myAjax('DELETE', 'flashcard/'+flashcardId, null, function(data) {
		console.log('***successfully deleted flashcard');
		/*if (currentDeckIndex > -1) {
			downloadFlashcardsInDeck(currentDeckIndex, function() {
				showFlashcards($('#deck_page'), decks[currentDeckIndex].flashcards);
			});
		}*/
	});
}

function addTagsToFlashcard(flashcardId, tags, callback) {
	if (tags.length == 0) {
		callback();
	} else {
		var tagLabel = tags.pop();
		myAjax('POST', 'add_tag', { tag_label: tagLabel, flashcard_id:flashcardId }, function() {
			console.log('***successfully added tag "' + tagLabel + '" to flashcard');
			addTagsToFlashcard(flashcardId, tags, callback);
		});
	}
}

function addFlashcardToDeck(flashcardId, deckId, callback) {
	myAjax('POST', 'add_to_deck', { flashcard_id:flashcardId, deck_id:deckId }, function() {
		console.log('***successfully added flashcard to deck='+deckId);
		callback();
	});
}

function removeFlashcardFromDeck(flashcardId, deckId, callback) {
	myAjax('POST', 'remove_from_deck', { flashcard_id:flashcardId, deck_id:deckId }, function() {
		console.log('***successfully removed flashcard from deck='+deckId);
		callback();
	});
}

function filterFlashcards() {
	//todo:implement this
	console.log('filter flashcards clicked');
}

function saveFlashcard(index) {
	/* for only saving to a deck
	var currentFlashcard = getCurrentFlashcard();
	var deckIndex = $('#saveDeckSelect option:selected').val();
	addFlashcardToDeck(currentFlashcard.id, decks[deckIndex].id, function() {
		console.log('***successfully saved flashcard to deck');
	});*/
	
	/*this code creates a new copy */
	var currentFlashcard = getCurrentFlashcard();
	var deckIndex = $('#saveDeckSelect option:selected').val();
	
	var question = currentFlashcard.question;
	var answer = currentFlashcard.answer;
	var tags = currentFlashcard.tags;
	var course_dept = currentFlashcard.course_dept;
	var course_code = currentFlashcard.course_code;
	var isPublic = currentFlashcard.isPublic;
	var isAnonymous = currentFlashcard.isAnonymous;
	
	var flashcardData = { 
		'question' : encodeURIComponent(question), 
		'answer' : encodeURIComponent(answer),
		'course_dept' : encodeURIComponent(course_dept),
		'course_code' : encodeURIComponent(course_code),
		'private' : (isPublic ? 0 : 1),
		'anonymous' : (isAnonymous ? 1 : 0)
	};
	createFlashcardFromData(flashcardData, deckIndex, tags);
}

function createFlashcardFromData(flashcardData, deckIndex, tags, callback) {
	myAjax('POST', 'flashcard', flashcardData, function(data) {
		console.log('***successfully created flashcard "' + flashcardData.question + '"');
		var flashcardId = data.id;
		addTagsToFlashcard(flashcardId, tags, function() {
			if (deckIndex > -1) {
				var deckId = decks[deckIndex].id;
				addFlashcardToDeck(flashcardId, deckId, function() {
					console.log('***successfully added flashcard "' + flashcardData.question + '" to deck "' + decks[deckIndex].name + '"');
					/*decks[deckIndex].flashcards.push(
						new Flashcard(
							flashcardId,
							creator,
							question,
							answer,
							course_dept,
							course_code, 
							0,
							0,
							isPublic,
							isAnonymous
						)
					);
					if(deckIndex == currentDeckIndex) {
						showFlashcards($('#deck_page'), decks[deckIndex].flashcards);
					}*/
					downloadFlashcardsInDeck(deckIndex, function() {
						if (callback)
							callback();
					});
				});
			} else {
				if (callback)
					callback();
			}
		});
	});
}

function upvote() {
	console.log('***upvote clicked');
	var currentFlashcard = getCurrentFlashcard();
	var flashcardId = currentFlashcard.id;
	myAjax('POST', 'upvote', { flashcard_id:flashcardId }, function() {
		console.log('***successfully upvoted flashcard');
		currentFlashcard.upvotes++;
		updateCurrentFlashcardContent();
	});
}

function myAjax(type, to, data, callback, ignoreNotFoundError) {
	$.ajax({
		url: "api/" + to,
		type: type,
		dataType: "json",
		async: false,
		data: data,
		success: function(data, textStatus, jqXHR) {
			if(callback)
				callback(data);
		},
		error: function(jqXHR, textStatus, errorThrown){
			if (ignoreNotFoundError && errorThrown == 'Not Found')
				callback();
			else
				console.log('ajaxError: '+textStatus+': '+errorThrown);
		}
	});
}

function parseTags(str) {
	var tags = str.split(' ');
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i].trim();
		if (tag != '')
			tags[i] = tag;
	}
	return tags;
}

function showUnknownFlashcards() {
	subset = UNKNOWN;
	console.log('showing unknown flashcards');
	//set radio to on
	setRadioOff($('#radio_known'));
	setRadioOff($('#radio_all'));
	setRadioOn($('#radio_unknown'));
	
	var currentFlashcards = getCurrentFlashcards();
	var unknownFlashcards = findUnknownFlashcards(currentFlashcards);
	showFlashcards($('#deck_page'), unknownFlashcards);
}

function showKnownFlashcards() {
	subset = KNOWN;
	console.log('showing known flashcards');
	//set radio to on
	setRadioOff($('#radio_unknown'));
	setRadioOff($('#radio_all'));
	setRadioOn($('#radio_known'));
	
	var currentFlashcards = getCurrentFlashcards();
	var knownFlashcards = findKnownFlashcards(currentFlashcards);
	showFlashcards($('#deck_page'), knownFlashcards);
}

function showAllFlashcards() {	
	subset = ALL;
	console.log('showing all flashcards');
	//set radio to on
	setRadioOff($('#radio_unknown'));
	setRadioOff($('#radio_known'));
	setRadioOn($('#radio_all'));
	
	var currentFlashcards = getCurrentFlashcards();
	showFlashcards($('#deck_page'), currentFlashcards);
}

function setRadioOff(radioEl) {
	radioEl.attr('checked','');
	radioEl.closest('.ui-btn').removeClass('ui-btn-active').removeClass('ui-radio-on').addClass('ui-radio-off');
}

function setRadioOn(radioEl) {
	radioEl.attr('checked','checked');
	radioEl.closest('.ui-btn').removeClass('ui-radio-off').addClass('ui-radio-on').addClass('ui-btn-active');
}

function findKnownFlashcards(flashcards) {
	var knownFlashcards = [];
	for (var i = 0; i < flashcards.length; i++) {
		if(flashcards[i].isKnown)
			knownFlashcards.push(flashcards[i]);
	}
	return knownFlashcards;
}

function findUnknownFlashcards(flashcards) {
	var unknownFlashcards = [];
	for (var i = 0; i < flashcards.length; i++) {
		if(!flashcards[i].isKnown)
			unknownFlashcards.push(flashcards[i]);
	}
	return unknownFlashcards;
}

function Deck(id, name, count) {
	this.id = id;
	this.name = name;
	this.count = count;
	this.flashcards;
}
function Tag(name) {
	this.name = name;
	this.flashcards;
}
function CourseDept(dept) {
	this.dept = dept;
	this.codes;
}
function CourseCode(dept, code, count) {
	this.dept = dept;
	this.code = code;
	this.count = count;
	this.flashcards;
}
function Flashcard(id, creator, question, answer, course_dept, course_code, upvotes, downvotes, isPublic, isAnonymous) {
	this.id = id;
	this.creator = creator;
	this.question = question;
	this.answer = answer;
	this.tags; //tags ? tags : [];
	this.course_dept = course_dept;
	this.course_code = course_code;
	this.upvotes = upvotes;
	this.downvotes = downvotes;
	this.isPublic = isPublic;
	this.isAnonymous = isAnonymous;
	this.isKnown = false;
	
	this.update = function(creator, question, answer, course_dept, course_code, upvotes, downvotes, isPublic, isAnonymous) {
		this.creator = creator;
		this.question = question;
		this.answer = answer;
		this.tags; //tags ? tags : [];
		this.course_dept = course_dept;
		this.course_code = course_code;
		this.upvotes = upvotes;
		this.downvotes = downvotes;
		this.isPublic = isPublic;
		this.isAnonymous = isAnonymous;
	}
	
	this.setKnown = function(isKnown) {
		this.isKnown = isKnown;
	}
}


/* This function from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript */
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};