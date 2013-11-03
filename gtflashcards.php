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


    function addAccount () {
		global $_USER;
		$user = $_USER["uid"];

		$dbQuery = sprintf("INSERT INTO account (uid, userpassword, roleid) VALUES ('%s', '%s', '1')",
			mysql_real_escape_string($user),
			mysql_real_escape_string($user));
			
		$result = getDBResultInserted($dbQuery);

	}


    function checkAccount () {
		global $_USER;
		$user = $_USER["uid"];
		$dbQuery = sprintf("SELECT * FROM account WHERE uid = '%s'",
					mysql_real_escape_string($user));

		$result = mysql_query($dbQuery);

		if (mysql_num_rows($result) == 0) {
			addAccount ();
		}

		$dbQuery = sprintf("SELECT uid, roleid FROM account WHERE uid = '%s'",
				mysql_real_escape_string($user));
		$result = getDBResultRecord($dbQuery);

		header("Content-type: application/json");
		echo json_encode($result);
	}

	function listCourseDept () {
		$dbQuery = sprintf("SELECT * FROM courseDept");
		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function listCourseCode ($dept) {
		$dbQuery = sprintf("SELECT DISTINCT course_dept, course_code FROM flashcard WHERE course_dept = '%s'",
			mysql_real_escape_string($dept));
		
		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function countAll () {
		$dbQuery = sprintf("SELECT COUNT(*) AS count FROM flashcard");
		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function countInCourse ($dept, $code) {
		$dbQuery = sprintf("SELECT COUNT(*) AS count FROM flashcard WHERE course_dept = '%s' AND course_code = '%s'",
			mysql_real_escape_string($dept),
			mysql_real_escape_string($code));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function cardsInCourse($dept, $code) {
		$dbQuery = sprintf("SELECT id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM flashcard 
							WHERE private = 0 AND course_dept = '%s' AND course_code = '%s'
							ORDER BY upvotes DESC",
			mysql_real_escape_string($dept),
			mysql_real_escape_string($code));

		$result = getDBResultsArray($dbQuery);
		error_log("test");
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function addCardInAccount ($flashcard_id) {
		global $_USER;
		$uid = $_USER["uid"];

		$dbQuery = sprintf("INSERT INTO cardInAccount(uid, flashcard_id)
							 VALUES ('%s', '%s')",
			mysql_real_escape_string($uid),
			mysql_real_escape_string($flashcard_id));
		$result = getDBResultsArray($dbQuery);
	}

	function listFlashcards() {
		$dbQuery = sprintf("SELECT id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM flashcard 
							WHERE private = 0
							ORDER BY upvotes DESC");
		$result = getDBResultsArray($dbQuery);
		error_log("test");
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function getFlashcard($id) {
		$dbQuery = sprintf("SELECT id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM flashcard
							WHERE id = '%s'",
			mysql_real_escape_string($id));
		$result=getDBResultRecord($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}



	function addFlashcard($question,$answer,$course_dept,$course_code,$private,$anonymous) {

		if ($anonymous == 0) {
			global $_USER;
			$creator = $_USER["uid"];
		}
		else {
			$creator = 'anonymous';
		}

		$dbQuery = sprintf("INSERT INTO flashcard(question, answer, course_dept, course_code, creator, private) VALUES ('%s','%s','%s','%s','%s','%s')",
			mysql_real_escape_string($question),
			mysql_real_escape_string($answer),
			mysql_real_escape_string($course_dept),
			mysql_real_escape_string($course_code),
			mysql_real_escape_string($creator),
			mysql_real_escape_string($private));

		$result = getDBResultInserted($dbQuery);

		$dbQuery = sprintf("SELECT LAST_INSERT_ID() AS id");
		$result = getDBResultRecord($dbQuery);

		$flashcard_id = $result["id"];

		global $_USER;
		$uid = $_USER["uid"];

		$dbQuery = sprintf("INSERT INTO cardInAccount(uid, flashcard_id)
							VALUES ('%s', '%s')",
			mysql_real_escape_string($uid),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);

		$dbQuery = sprintf("SELECT id FROM flashcard
							WHERE id = '%s'",
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultRecord($dbQuery);

		header("Content-type: application/json");
		echo json_encode($result);
	}

	function editFlashcard($id,$question,$answer,$course_dept,$course_code) {
		$dbQuery = sprintf("UPDATE flashcard
							SET question = '%s', answer = '%s', course_dept = '%s', course_code = '%s' 
							WHERE id = '%s'",
			mysql_real_escape_string($question),
			mysql_real_escape_string($answer),
			mysql_real_escape_string($course_dept),
			mysql_real_escape_string($course_code),
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

	function upvote($id) {
		$dbQuery = sprintf("UPDATE flashcard SET upvotes = upvotes + 1 WHERE id = '%s'",
			mysql_real_escape_string($id));
		
		$result=getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function downvote($id) {
		$dbQuery = sprintf("UPDATE flashcard SET downvotes = downvotes + 1 WHERE id = '%s'",
			mysql_real_escape_string($id));
		
		$result=getDBResultAffected($dbQuery);
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

	function listDecks() {
		global $_USER;
		$dbQuery = sprintf("SELECT id,name FROM deck WHERE uid = '%s'",
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function cardsInAllDecks() {
		global $_USER;

		$dbQuery = sprintf("SELECT id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM
							flashcard 
							INNER JOIN
							(SELECT flashcard_id 
							FROM 
							flashcardInDeck f
							INNER JOIN
							(SELECT id FROM deck WHERE uid = '%s') d
							WHERE f.deck_id=d.id
							) fid
							ON id=flashcard_id",
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function cardsInAccount() {

		global $_USER;
		$uid = $_USER["uid"];

		$dbQuery = sprintf("SELECT flashcard.id AS id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM flashcard 
							INNER JOIN 
							cardInAccount
							ON uid = '%s' AND flashcard_id = flashcard.id",
			mysql_real_escape_string($uid));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function cardsInDeck($deck_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$dbQuery = sprintf("SELECT flashcard.id AS id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private
							FROM flashcard 
							INNER JOIN 
							flashcardInDeck 
							ON deck_id = '%s' AND flashcard_id = flashcard.id",
			mysql_real_escape_string($deck_id));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


	function countInAllDecks() {
		global $_USER;

		$dbQuery = sprintf("SELECT COUNT(*) AS count
							FROM
							flashcard 
							INNER JOIN
							(SELECT flashcard_id 
							FROM 
							flashcardInDeck f
							INNER JOIN
							(SELECT id FROM deck WHERE uid = '%s') d
							WHERE f.deck_id=d.id
							) fid
							ON id=flashcard_id",
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function countInDeck($deck_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$dbQuery = sprintf("SELECT COUNT(*) AS count
							FROM flashcard 
							INNER JOIN 
							flashcardInDeck 
							ON deck_id = '%s' AND flashcard_id = flashcard.id",
			mysql_real_escape_string($deck_id));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

<<<<<<< HEAD
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

=======
>>>>>>> Uploading all files - v0.1
	function createDeck($name) {
		global $_USER;
		$dbQuery = sprintf("INSERT INTO deck (name,uid) VALUES ('%s','%s')",
			mysql_real_escape_string($name),
			mysql_real_escape_string($_USER['uid']));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function renameDeck($deck_id, $new_name) {
		checkDeckPermission($deck_id);

		$dbQuery = sprintf("UPDATE deck SET name = '%s' WHERE id = '%s'",
			mysql_real_escape_string($new_name),
			mysql_real_escape_string($deck_id));

		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function deleteDeck($deck_id) {

		checkDeckPermission($deck_id);

		$dbQuery = sprintf("DELETE FROM deck WHERE id = '%s'",
			mysql_real_escape_string($deck_id));
		
		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


	function addToDeck($deck_id,$flashcard_id) {

		checkDeckPermission($deck_id);

		global $_USER;
		$uid = $_USER["uid"];

		$dbQuery = sprintf("INSERT INTO flashcardInDeck (deck_id,flashcard_id, known) VALUES ('%s','%s', 0)",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);

		header("Content-type: application/json");
		echo json_encode($result);
	}

	function removeFromDeck($deck_id,$flashcard_id) {

		checkDeckPermission($deck_id);

		$dbQuery = sprintf("DELETE FROM flashcardInDeck WHERE deck_id = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function isKnown($deck_id,$flashcard_id) {
		checkDeckPermission($deck_id);

		$dbQuery = sprintf("SELECT known FROM flashcardInDeck
							WHERE  deck_id = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultRecord($dbQuery);

		header("Content-type: application/json");
		echo json_encode($result);

	}

	function toggleKnown($deck_id,$flashcard_id) {
		checkDeckPermission($deck_id);

		$dbQuery = sprintf("SELECT known FROM flashcardInDeck
							WHERE  deck_id = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultRecord($dbQuery);

		$known = $result["known"];

		if ($known == 0) {
			$known = 1;
		}
		else {
			$known = 0;
		}

		$dbQuery = sprintf("UPDATE flashcardInDeck SET known = '%s'
							WHERE deck_id = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($known),				
			mysql_real_escape_string($deck_id),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function resetToUnknown($deck_id) {
		checkDeckPermission($deck_id);

		$dbQuery = sprintf("UPDATE flashcardInDeck SET known = 0
							WHERE deck_id = '%s'",			
			mysql_real_escape_string($deck_id));

		$result = getDBResultAffected($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function listTags() {
		$dbQuery = sprintf("SELECT label FROM tag");
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
		$dbQuery = sprintf("SELECT id,question,answer,course_dept,course_code,creator,upvotes,downvotes,private FROM flashcard INNER JOIN flashcardInTag ON tag_label = '%s' AND flashcard_id = id",
			mysql_real_escape_string($label));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function addTag($tag_label,$flashcard_id) {

		$dbQuery = sprintf("SELECT * FROM tag WHERE label = '%s'",
					mysql_real_escape_string($tag_label));

		$result = mysql_query($dbQuery);

		if (mysql_num_rows($result) == 0) {
			$dbQuery = sprintf("INSERT INTO tag (label) VALUES ('%s')",
			mysql_real_escape_string($tag_label));
			$result = getDBResultInserted($dbQuery);
		}

		$dbQuery = sprintf("INSERT INTO flashcardInTag (tag_label,flashcard_id) VALUES ('%s','%s')",
			mysql_real_escape_string($tag_label),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function removeTag($tag_label,$flashcard_id) {
		$dbQuery = sprintf("DELETE FROM flashcardInTag WHERE tag_label = '%s' AND flashcard_id = '%s'",
			mysql_real_escape_string($tag_label),
			mysql_real_escape_string($flashcard_id));

		$result = getDBResultInserted($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}

	function tagsOfCard ($id) {
		$dbQuery = sprintf("SELECT DISTINCT tag_label FROM flashcardInTag WHERE flashcard_id = '%s'",
			mysql_real_escape_string($id));

		$result = getDBResultsArray($dbQuery);
		header("Content-type: application/json");
		echo json_encode($result);
	}


?>
