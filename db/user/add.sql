insert into users (name, searchname, pass) values (
	${name}, ${searchname}, ${pass}
) returning *;
