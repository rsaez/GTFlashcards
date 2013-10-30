insert into account (uid, userpassword, roleid)
values('Sebastian', 'secret', 1);

insert into flashcard(title, question, answer)
values ('Sweden', 'What is the capital of Sweden?', 'Stockholm');

insert into cardInAccount(uid, flashcardid)
values('Sebastian', 1);

insert into flashcard(title, question, answer)
values ('Karlskrona', 'What year was Karlskrona founded?', '1680');

insert into cardInAccount(uid, flashcardid)
values('Sebastian', 2);

insert into flashcard(title, question, answer)
values ('Karlskrona', 'Who founded Karlskrona?', 'Karl XI of Sweden');

insert into cardInAccount(uid, flashcardid)
values('Sebastian', 3);

insert into tag(label, flashcardid)
values ('Sweden, 1');

insert into tag(label, flashcardid)
values ('Sweden, 2');

insert into tag(label, flashcardid)
values ('Sweden, 3');

insert into tag(label, flashcardid)
values ('Stockholm, 1');

insert into tag(label)
values ('Karlskrona, 2');

insert into tag(label)
values ('Karlskrona, 3');