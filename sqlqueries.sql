#Some useful database queries

use burdell;

#Get flashcard based on username
#SELECT * FROM `flashcard`
#INNER JOIN `cardInAccount` on cardInAccount.flashcardid = flashcard.id
#INNER JOIN `account` on account.uid = cardInAccount.uid; 

#Get flashcard based on account id
SELECT * FROM `flashcard`
INNER JOIN `cardInAccount` on cardInAccount.uid = 'Sebastian' and cardInAccount.id = flashcard.id;

#Get flashcards based on tag id
SELECT * FROM `flashcard`
INNER JOIN `tagInCard` on 1 = tagInCard.flashcardid and tagInCard.flashcardid = flashcard.id;

#Get flashcard based on tag label
SELECT * FROM `flashcard`
INNER JOIN `tagInCard` on tagInCard.flashcardid = flashcard.id
INNER JOIN `tag` on tag.id = tagInCard.tagid and tag.label = 'Sweden';

#Get tags on flashcard id
SELECT tag.label FROM `tag`
INNER JOIN `tagInCard` on tagInCard.tagid = tag.id and tagInCard.flashcardid = '1';

#Use this to get the id of the table you just created
SELECT LAST_INSERT_ID();

SELECT * FROM `deck`
INNER JOIN `deckOwnerShip` on deck.id = deckOwnerShip.deck_id
INNER JOIN `Account` on  deckOwnerShip.uid = account.uid and account.uid = 'Sebastian';

SELECT * from `flashcard`
INNER JOIN `flashCardInDeck` on flashCardInDeck.flashcard_id = flashcard.id
INNER JOIN `deck` on deck.id = flashCardInDeck.deck_id and deck.name = 'Sweden';