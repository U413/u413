insert into bulletin (author, body) values (
	(select id from users where name=${username}), ${body}
);
