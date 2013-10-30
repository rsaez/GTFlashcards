use burdell;

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

drop table if exists cardInAccount;
drop table if exists deckOwnership;
drop table if exists cardInDeck;
drop table if exists tagInCard;

SET FOREIGN_KEY_CHECKS = 1;

create table account(
#id int auto_increment  primary key,
uid varchar(100) unique primary key,
userpassword varchar(100),
roleid varchar(20) not null default 'user'
);

create table flashcard(
id int auto_increment primary key,
question varchar(255),
answer varchar(255),
upvotes int not null default 0,
downvotes int not null default 0,
private boolean,
lastEdited datetime
);

create table cardInAccount(
id int auto_increment primary key,
uid varchar(100),
foreign key (uid) references account(uid),
flashcard_id int,
foreign key (flashcard_id) references flashcard(id),
known int,
relation int
);

create table tag(
id int auto_increment primary key,
label varchar(50) primary key,
flashcard_id int,
);

create table deck(
id int auto_increment primary key,
name varchar(50)
);

create table deckOwnership(
id int auto_increment primary key,
uid varchar(100),
foreign key (uid) references account(uid),
deck_id int,
foreign key (deck_id) references deck(id)
);

create table flashcardInDeck(
id int auto_increment primary key,
deck_id int,
foreign key (deck_id) references deck(id),
flashcard_id int,
foreign key (flashcard_id) references flashcard(id)
);

