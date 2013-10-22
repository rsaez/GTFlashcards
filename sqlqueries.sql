#Some useful database queries

use burdell;

#Get flashcard based on username
SELECT * FROM `flashcard`
INNER JOIN `flashcardtable` on flashcardtable.flashcardid = flashcard.id
INNER JOIN `account` on account.id = flashcardtable.accountid and account.username = 'Sebastian'; 

#Get flashcard based on account id
SELECT * FROM `flashcard`
INNER JOIN `flashcardtable` on flashcardtable.accountid = 1 and flashcardtable.flashcardid = flashcard.id;

#Get flashcards based on tag id
SELECT * FROM `flashcard`
INNER JOIN `tagtable` on 1 = tagtable.flashcardid and tagtable.flashcardid = flashcard.id;

#Get flashcard based on tag label
SELECT * FROM `flashcard`
INNER JOIN `tagtable` on tagtable.flashcardid = flashcard.id
INNER JOIN `tag` on tag.id = tagtable.tagid and tag.label = 'Sweden';

#Get tags on flashcard id
SELECT tag.label FROM `tag`
INNER JOIN `tagtable` on tagtable.tagid = tag.id and tagtable.flashcardid = '1';

#Get account based on session
SELECT * from `account`
INNER JOIN `sessions` on sessions.sessionid = "abc123" and account.id = sessions.accountid;

#Use this to get the id of the table you just created
SELECT LAST_INSERT_ID();