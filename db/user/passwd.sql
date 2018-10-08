update users set pass = $2 where searchname = $1 returning 1;
