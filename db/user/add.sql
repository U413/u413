insert into users (name, searchname, pass) values ($1, $2, $3) returning *;
