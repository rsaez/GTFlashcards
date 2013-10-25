<?php
	include 'db_helper.php';

	 function test() {
        global $_REST;
        print "REST: ";
        var_dump($_REST);
        print "<br />";
     
        print "GET: ";
        var_dump($_GET);
        print "<br />";
     
        print "POST: ";
        var_dump($_POST);
        print "<br />";
     
        print "FILES: ";
        var_dump($_FILES);
        print "<br />";
    }

	function listFlashcards() {
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard");
		$result = getDBResultsArray($dbQuery);
		error_log("test");
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function getFlashcard($id) {
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard WHERE id = '%s'",
			mysql_real_escape_string($id));
		$result=getDBResultRecord($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function addFlashcard($title,$question,$answer) {
		$dbQuery = sprintf("INSERT INTO flashcard (title,question,answer) VALUES ('%s','%s','%s')",
			mysql_real_escape_string($title),
			mysql_real_escape_string($question),
			mysql_real_escape_string($answer));
		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function editFlashcard($id,$title,$question,$answer) {
		$dbQuery = sprintf("UPDATE flashcard SET title = '%s', question = '%s', answer = '%s' WHERE id = '%s'",
			mysql_real_escape_string($title),
			mysql_real_escape_string($question),
			mysql_real_escape_string($answer),
			mysql_real_escape_string($id));
		
		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function deleteFlashcard($id) {
		$dbQuery = sprintf("DELETE FROM flashcard WHERE id = '%s'",
			mysql_real_escape_string($id));
		
		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function shuffleFlashcards() {
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard");
		$result = getDBResultsArray($dbQuery);
		shuffle($result);
		error_log("test");
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function listTags() {
		$dbQuery = sprintf("SELECT id,label FROM tag");
		$result = getDBResultsArray($dbQuery);
		error_log("test");
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function createTag($label) {
		$dbQuery = sprintf("INSERT INTO tag (label) VALUES ('%s')",
			mysql_real_escape_string($label));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function deleteTag($label) {
		$dbQuery = sprintf("DELETE FROM tag WHERE label = '%s'",
			mysql_real_escape_string($label));
		
		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


	function searchByTag($label) {
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard INNER JOIN tag_card_relation ON tag_label = '%s' AND flashcard_id = id",
			mysql_real_escape_string($label));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function addTag($tag_label,$flashcard_id) {
		$dbQuery = sprintf("INSERT INTO tag_card_relation (tag_label,flashcard_id) VALUES ('%s','%s')",
			mysql_real_escape_string($tag_label),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function removeTag($tag_label,$flashcard_id) {
		$dbQuery = sprintf("DELETE FROM tag_card_relation WHERE tag_label = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($tag_label),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function listDecks() {
		global $_USER;
		$dbQuery = sprintf("SELECT id,name FROM deck WHERE uid = '%s'",
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function checkDeckPermission($deck_id) {
		global $_USER;
		$user = $_USER["uid"];
		$dbQuery = sprintf("SELECT uid from deck where id = '%s'",
					mysql_real_escape_string($deck_id));
		$result = getDBResultRecord($dbQuery);

		if ($result["uid"] != $user) {
			$GLOBALS["_PLATFORM"]->sandboxHeader('HTTP/1.1 401 Unauthorized');
			die();
		}
	}

	
	function cardsInDeck($deck_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard INNER JOIN deck_card_relation ON deck_id = '%s' AND flashcard_id = id",
			mysql_real_escape_string($deck_id));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function shuffleDeck($deck_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$dbQuery = sprintf("SELECT id,title,question,answer FROM flashcard INNER JOIN deck_card_relation ON deck_id = '%s' AND flashcard_id = id",
			mysql_real_escape_string($deck_id));

		$result = getDBResultsArray($dbQuery);
		shuffle($result);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function createDeck($name) {
		global $_USER;
		$dbQuery = sprintf("INSERT INTO deck (name,uid) VALUES ('%s','%s')",
			mysql_real_escape_string($name),
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function deleteDeck($deck_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$dbQuery = sprintf("DELETE FROM deck WHERE id = '%s'",
			mysql_real_escape_string($deck_id));
		
		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


	function addToDeck($deck_id,$flashcard_id) {

		checkDeckPermission($deck_id);

		$dbQuery = sprintf("INSERT INTO deck_card_relation (deck_id,flashcard_id) VALUES ('%s','%s')",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function removeFromDeck($deck_id,$flashcard_id) {

		checkDeckPermission($deck_id);

		$dbQuery = sprintf("DELETE FROM deck_card_relation WHERE deck_id = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


?>
