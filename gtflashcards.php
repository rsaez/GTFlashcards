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

?>
