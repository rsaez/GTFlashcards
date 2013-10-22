insert into accountrole(name)
values('User');

insert into account (username, userpassword, userroleid)
values('Sebastian', 'secret', 1);

insert into flashcard(title, question, answer)
values ('Sweden', 'What is the capital of Sweden?', 'Stockholm');

insert into flashcardtable(accountid, flashcardid)
values(1, 1);

insert into flashcard(title, question, answer)
values ('Karlskrona', 'What year was Karlskrona founded?', '1680');

insert into flashcardtable(accountid, flashcardid)
values(1, 2);

insert into flashcard(title, question, answer)
values ('Karlskrona', 'Who founded Karlskrona?', 'Karl XI of Sweden');

insert into flashcardtable(accountid, flashcardid)
values(1, 3);

insert into tag(label)
values ('Sweden');

insert into tagtable(tagid, flashcardid)
values(1, 1);

insert into tagtable(tagid, flashcardid)
values(1, 2);

insert into tagtable(tagid, flashcardid)
values(1, 3);

insert into tag(label)
values ('Stockholm');

insert into tagtable(tagid, flashcardid)
values(2, 1);

insert into tag(label)
values ('Karlskrona');

insert into tagtable(tagid, flashcardid)
values(3, 2);

insert into tagtable(tagid, flashcardid)
values(3, 3);

insert into sessions(accountid, sessionid)
values(1, 'abc123');