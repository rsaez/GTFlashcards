insert into account (uid, userpassword, roleid)
values('Sebastian', 'secret', 1);

insert into flashcard(question, answer)
values ('What is the capital of Sweden?', 'Stockholm');

insert into cardInAccount(uid, flashcard_id)
values('Sebastian', 1);

insert into flashcard(question, answer)
values ('What year was Karlskrona founded?', '1680');

insert into cardInAccount(uid, flashcard_id)
values('Sebastian', 2);

insert into flashcard(question, answer)
values ('Who founded Karlskrona?', 'Karl XI of Sweden');

insert into cardInAccount(uid, flashcard_id)
values('Sebastian', 3);

insert into tag(label, flashcard_id)
values ('Sweden', 1);

insert into tag(label, flashcard_id)
values ('Sweden', 2);

insert into tag(label, flashcard_id)
values ('Sweden', 3);

insert into tag(label, flashcard_id)
values ('Stockholm', 1);

insert into tag(label)
values ('Karlskrona', 2);

insert into tag(label)
values ('Karlskrona', 3);

insert into deck(name)
values('Sweden');

insert into deckOwnership(uid, deck_id)
values ('Sebastian', 1);

insert into flashcardInDeck(deck_id, flashcard_id)
values(1, 1);
