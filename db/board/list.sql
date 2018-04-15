select * from topics where board=(select id from boards where name=$1);
