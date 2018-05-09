select count(*) from members where uid=$1 and gid=(
	select id from groups where name=$2
);
