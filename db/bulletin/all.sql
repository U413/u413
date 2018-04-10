select bulletin.*, users.name as username from bulletin
	inner join users on users.id=bulletin.author;
