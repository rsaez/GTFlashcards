<?php
	include 'db_helper.php';


	function listFlashcards() {
		$dbQuery = sprintf("SELECT id,question FROM flashcard");
		$result = getDBResultsArray($dbQuery);
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

	function getFlashcard($id) {
		$dbQuery = sprintf("SELECT id,question,answer FROM flashcard WHERE id = '%s'",
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


?>
