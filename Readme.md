## U413

### External Dependencies
* PostgreSQL

### How to run
To connect to the database, u413 uses the following environment variables:
* PGUSER/USER (defaults to `whoami`)
* PGDATABASE/DB (defaults to "u413")
* PGPASSWORD/PASS

A typical invocation: `USER=postgres PASS=password node .`

Make sure the postgreSQL server is running.

### Utilities
* query.sh allows the invocation of named SQL queries, eg `query.sh nuke`
