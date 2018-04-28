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
* tools/query allows the invocation of named SQL queries, eg `tools/query nuke`
* tools/run uses files from private/ to start the server with a simple
   invocation
  - db.pwd gives the password for the server (make sure this has proper
     permissions!!)
* tools/genssl generates SSL certificates (*NOTE:* doesn't work yet)

### Working todo
1. Markdown support
2. User groups
3. User profiles
4. ls command
5. Autocomplete

### Todo
* Shell features
  - Tab completion
  - Proper command parsing and composition
* Nicer styling
  - User-defined styling
* HTTPS (high priority)
* User groups
* Admin commands
  - Add SQL sanity check (# affected rows)
  - JS injection
  - Board creation? (currently easy with sql)
* User profiles (/home/\*)
* Private messaging
* Vanity features
  - /dev/
    * (u)random
	* null
	* zero
	* std(in|out|err)
	* log
  - Easter eggs, hidden commands, dotfiles
* IPC
  - More commands (examples..?)
* Markdown support for bulletin and replies
* Make reply work for bulletin

### Long-term goals
* Access to u413 via ssh and shell emulation
* User-defined theming (eg the colors on the terminal)
* IRC integration
* GraphQL integration?
* Native apps?
* Reimplementation in Netcoin?
* Sub-boards
* Semi-anonymous users?
