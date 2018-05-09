do $$ begin

/* Metadata used for migrating databases if need be */
if to_regclass('metadata') is null then
	create table metadata (
		version int default 1
	);
	insert into metadata default values;
end if;

if to_regclass('users') is null then
	create table users (
		id serial unique primary key not null,
		name varchar(32) not null,
		/* a normalized name to make searching easy */
		searchname varchar(32) not null,
		/* Pass is nullable to make pseudo-users */
		pass char(60),
		made timestamp default now() not null,
		seen timestamp default now() not null
	);
	
	insert into users (id, name, searchname, pass) values (
		/* Note: pass set to null to prevent anyone from logging in */
		0, 'nobody', 'nobody', null
	);
end if;

if to_regclass('groups') is null then
	create table groups (
		id serial unique primary key not null,
		name varchar(32) unique not null,
		made timestamp default now() not null
	);
	
	insert into groups (name) values ('root');
	insert into groups (name) values ('admin');
	insert into groups (name) values ('mod');
end if;

end $$;

create table if not exists subgroups (
	parent int references groups(id) on delete cascade not null,
	child int references groups(id) on delete cascade not null,
	
	unique(parent, child)
);

/* User inclusion in groups */
create table if not exists members (
	gid int references groups(id) on delete cascade not null,
	uid int references users(id) on delete cascade not null,
	
	/* where the user was added to the group */
	added timestamp default now() not null,
	
	unique(gid, uid)
);

/* Board definitions */
create table if not exists boards (
	id serial unique primary key not null,
	name varchar(32) unique not null,
	
	/* The group which is allowed to use the board */
	/* This can be null representing a board accessible to anyone */
	gid int references groups(id) on delete cascade
);

create table if not exists topics (
	id serial unique primary key not null,
	
	board int references boards(id) on delete cascade not null,
	author int references users(id) on delete cascade not null,
	
	created timestamp default now() not null,
	title varchar(256) not null,
	body text not null
);

/* Topics are posts with parent=0 */
create table if not exists replies (
	id serial unique primary key not null,
	
	topic int references topics(id) on delete cascade not null,
	author int references users(id) on delete cascade not null,
	
	created timestamp default now() not null,
	body text not null
);

create table if not exists bulletin (
	id serial unique primary key not null,
	author int references users(id) on delete cascade not null,
	
	created timestamp default now() not null,
	body varchar(140) not null
);
