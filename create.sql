SET FOREIGN_KEY_CHECKS = 0;
drop table if exists account;
drop table if exists sessions;
drop table if exists accountrole;
drop table if exists role;
drop table if exists flashcardtable;
drop table if exists flashcard;
drop table if exists tagtable;
drop table if exists tag;
drop table if exists accountdecktable;
drop table if exists deck;
drop table if exists flashcardindeck;
drop table if exists decktag;

SET FOREIGN_KEY_CHECKS = 1;

create table accountrole(
id int auto_increment primary key,
name varchar(100)
);

create table account(
id int auto_increment  primary key,
username varchar(100) unique,
password varchar(100),
roleid int not null default 1,
foreign key (userroleid) references accountrole(id)
);

create table sessions(
id int auto_increment  primary key,
accountid int,
foreign key (accountid) references account(id),
sessionid varchar(50)
);

create table flashcard(
id int auto_increment primary key,
title varchar(100),
question varchar(255),
answer varchar(255),
upvotes int not null default 0,
downvotes int not null default 0
);

create table flashcardtable(
id int auto_increment primary key,
accountid int,
foreign key (accountid) references account(id),
flashcardid int,
foreign key (flashcardid) references flashcard(id)
);

create table tag(
id int auto_increment primary key,
label varchar(50)
);

create table tagtable(
id int auto_increment primary key,
tagid int,
foreign key(tagid) references tag(id),
flashcardid int,
foreign key (flashcardid) references flashcard(id)
);

create table deck(
id int auto_increment primary key,
name varchar(50)
);

create table accountdecktable(
id int auto_increment primary key,
accountid int,
foreign key (accountid) references account(id),
deckid int,
foreign key (deckid) references deck(id)
);

create table flashcardindeck(
id int auto_increment primary key,
deckid int,
foreign key (deckid) references deck(id),
flashcardid int,
foreign key (flashcardid) references flashcard(id)
);

create table decktag(
id int auto_increment primary key,
label varchar(50)
);