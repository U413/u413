select * from groups where id in (
	select id from members where uid=$1
);
