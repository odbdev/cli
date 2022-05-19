# ODB Command Line

The ODB Command Line connects to your database from your terminal. You can create databases, run queries, send API schemas, and execute migrations.

## Key Features

- Run queries against your serverless DB
- Send API schemas to update your APIs
- Execute upgrade and downgrade migrations of queries and API schemas

## Install

You can use pnpm, npm or yarn to install it.

```bash
npm install -g git+https://github.com/odbdev/cli.git
```

Or
    
```bash
pnpm install -g git+https://github.com/odbdev/cli.git
```

## Commands

List of commands to use.

### Help

Shows helpful information to work with the odb-cli.

```
odb help
```

Or

```
odb -h
```

### Create

Allows to create a whole database schema and APIs. For now there is only the option to use `create blog`.

```bash
odb create [TYPE]<blog>
```

Or

```bash
odb -c [TYPE]<blog>
```

### Migrate

Allows upgrade and downgrade the migrations.

```
odb migrate [TYPE]<up | down> [FILE_NAME]<*.db | *.yaml> | [DIRECTORY]
```

Or

```
odb -m [TYPE]<up | down> [FILE_NAME]<*.db | *.yaml> | [DIRECTORY]
```

The migrations file format should be like the one below.

```
---------------------
-- Up
---------------------

The code to upgrade

---------------------
-- Down
---------------------

The code to downgrade
```

### Run

Use it to run directly queries or API schemas. Useful for first time creation.

```
odb run [FILE_NAME]<*.db | *.yaml>
```

Or

```
odb -r [FILE_NAME]<*.db | *.yaml>
```

### SQL

It enables the terminal to write queries and execute them against your database. 

```
odb sql
```

Or

```
odb -s
```

Type exit or .quit to leave the SQL CLI.

### Token

It is mandatory to have a token. It can be defined using the command or export or with a .odbrc file.

```
odb token [TOKEN] (default ODB_TOKEN env variable (ex. export ODB_TOKEN=...))
```

Or

```
odb -t [TOKEN] (default ODB_TOKEN env variable (ex. export ODB_TOKEN=...))
```

### Config

It is used to define the config file name

```
odb config [FILE_NAME] (default .odbrc)
```

Or

```
odb -x [FILE_NAME] (default .odbrc)
```

### Version

It prints the current version

```
odb version
```

Or

```
odb -v
```

## Compatible Versioning

### Summary

Given a version number MAJOR.MINOR, increment the:

-   MAJOR version when you make backwards-incompatible updates of any kind
-   MINOR version when you make 100% backwards-compatible updates

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR format.

[![ComVer](https://img.shields.io/badge/ComVer-compliant-brightgreen.svg)](https://github.com/staltz/comver)

## Contribute

First off, thanks for taking the time to contribute!
Now, take a moment to be sure your contributions make sense to everyone else.

### Reporting Issues

Found a problem? Want a new feature? First of all, see if your issue or idea has [already been reported](../../issues).
If it hasn't, just open a [new clear and descriptive issue](../../issues/new).

### Commit message conventions

A specification for adding human and machine readable meaning to commit messages.

-   [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Submitting pull requests

Pull requests are the greatest contributions, so be sure they are focused in scope and do avoid unrelated commits.

-   Fork it!
-   Clone your fork: `git clone http://github.com/<your-username>/odb-cli`
-   Navigate to the newly cloned directory: `cd odb-cli`
-   Create a new branch for the new feature: `git checkout -b my-new-feature`
-   Install the tools necessary for development: `pnpm install`
-   Make your changes.
-   Commit your changes: `git commit -am 'Add some feature'`
-   Push to the branch: `git push origin my-new-feature`
-   Submit a pull request with full remarks documenting your changes.

## License

[MIT License](https://github.com/gc-victor/h/blob/master/LICENSE)

Copyright (c) 2022 Víctor García

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
