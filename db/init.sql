/* Metadata used for migrating databases if need be */
create table if not exists metadata (
	version int default 0
);

create table if not exists users (
	id serial unique primary key,
	name varchar(32) not null,
	salt char(32) not null,
	pass char(64) not null,
	made timestamp default now(),
	seen timestamp
);

create table if not exists groups (
	id serial unique primary key,
	name varchar(32) not null,
	made timestamp default now()
);

create table if not exists subgroups (
	parent int references groups(id),
	child int references groups(id)
);

/* User inclusion in groups */
create table if not exists members (
	gid int references groups(id),
	uid int references users(id),
	
	/* When the user was added to the group */
	added timestamp default now()
);

/* Board definitions */
create table if not exists boards (
	id serial unique primary key,
	name varchar(32) not null,
	
	/* The group which is allowed to use the board */
	gid int references groups(id)
);

/* Topics are posts with parent=0 */
create table if not exists posts (
	id serial unique primary key,
	parent int references posts(id),
	board int references boards(id),
	author int references users(id),
	
	created timestamp default now(),
	title varchar(256),
	body text
);

create table if not exists bulletin (
	id serial unique primary key,
	author int references users(id),
	
	created timestamp default now(),
	body varchar(140)
);
