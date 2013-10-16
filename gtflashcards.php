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


?>
