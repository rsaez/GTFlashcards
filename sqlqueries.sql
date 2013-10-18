#Some useful database queries

SELECT * FROM `flashcard`
INNER JOIN `flashcardtable` on flashcardtable.flashcardid = flashcard.id
INNER JOIN `account` on account.id = flashcardtable.accountid and account.username = 'Sebastian'; 

SELECT * FROM `flashcard`
INNER JOIN `flashcardtable` on flashcardtable.accountid = 1 and flashcardtable.flashcardid = flashcard.id

SELECT * FROM `flashcard`
INNER JOIN `tagtable` on 1 = tagtable.flashcardid and tagtable.flashcardid = flashcard.id;

SELECT * FROM `flashcard`
INNER JOIN `tagtable` on tagtable.flashcardid = flashcard.id
INNER JOIN `tag` on tag.id = tagtable.tagid and tag.label = 'Sweden';

SELECT tag.label FROM `tag`
INNER JOIN `tagtable` on tagtable.tagid = tag.id
INNER JOIN `flashcard` on flashcard.id = tagtable.flashcardid and flashcard.id = '1';

insert into flashcard(title, question, answer)
values ('Karlskrona1', 'What year was Karlskrona founded?1', '16801');


SELECT LAST_INSERT_ID();