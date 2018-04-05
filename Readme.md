## U413

### External Dependencies
* PostgreSQL

### How to run
To connect to the database, u413 uses the following environment variables:
* PGUSER/USER (defaults to `whoami`)
* PGDATABASE/DB (defaults to "u413")
* PGPASSWORD/PASS

A typical invocation: `DEBUG=1 USER=postgres PASS=password node .`

Make sure the postgreSQL server is running.

### Utilities
* query.sh allows the invocation of named SQL queries, eg `query.sh nuke`

### Todo
* /var/bulletin
  - /var/bulletin route works and allows unauthorized posting without usernames using the client-side `bulletin` command.
* User registration & authentication
* HTTPS (high priority)
* User group integration (admin/mod/user/etc)
* Admin commands
  - create boards
  - raw sql execution (with a sanity check showing the number of affected records)
  - JS code injection
* Boards
  - Write the view
  - Implement database handling
  - Implement client-side commands
* Topics
  - Write the view
  - Implement database handling
  - Implement client-side commands
* User data
  - /home/<username>/*
* Private messaging
* Vanity features
  - /dev/
    * (u)random
	* null
	* zero
	* std(in|out|err)
	* log
  - Easter eggs, hidden commands, dotfiles

### Long-term goals
* Access to u413 via ssh and shell emulation
* User-defined theming (eg the colors on the terminal)
* IRC integration
* GraphQL integration?
* Native apps?
* Reimplementation in Netcoin?
* Sub-boards
* Semi-anonymous users?
