const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');
const yaml = require('js-yaml');

const FgGreen = '\x1b[32m';
const FgRed = '\x1b[31m';
const FgYellow = '\x1b[33m';

const hostname = 'cli.odb.dev';
const argv = process.argv;
const length = argv.length;
const config = {};
const options = {
    c: 'create',
    d: 'directory',
    f: 'file',
    m: 'migrate',
    r: 'run',
    s: 'sql',
    t: 'token',
    x: 'config',
    v: 'version',
};

if (argv.some((a) => /^-v$|^version$/.test(a))) {
    const pck = fs.readFileSync(path.join(__dirname, 'package.json'));
    const version = JSON.parse(pck.toString()).version;

    console.log('', 'v' + version);
} else if (argv.some((a) => /^-h$|^help$/.test(a))) {
    const pck = fs.readFileSync(path.join(__dirname, 'package.json'));
    const version = JSON.parse(pck.toString()).version;
    const help = fs.readFileSync(path.join(__dirname, 'HELP'));

    console.log(help.toString().replace('__PACKAGE__', version));
} else {
    let i;

    for (i = 2; i < length; i++) {
        const item = argv[i];
        const isFlag = /^-/.test(item);
        const isCommand = new RegExp(
            `^${options.c}$|^${options.r}$|^${options.m}$|^${options.f}$|^${options.d}$|^${options.s}$|^${options.t}$|^${options.x}$|^${options.v}$`
        ).test(item);

        if (!isCommand && !isFlag) {
            error(
                `Error: You have to use a command or a flag. Please, check the ones available using the command "help"`
            );
        }

        if (isCommand || isFlag) {
            const command = isFlag
                ? options[/--config|-x/.test(item) ? 'x' : item.match(/-(\w)/)[1]]
                : item;
            const value = argv[++i];

            if (command !== options.s && (!value || /^-/.test(value))) {
                error(`Error: ${command} requires extra arguments`);
            }

            config[command] = command === options.s ? 1 : value;

            if (command === options.m) {
                const fileOrFolder = argv[++i];
                const hasExtension = path.extname(fileOrFolder || '');

                if (!fileOrFolder) {
                    error(
                        `Error: You have to define a [FILE_NAME] or a [DIRECTORY]. Please, check the documentation using the command "help"`
                    );
                }

                if (!fileOrFolder) {
                    error(
                        `Error: You have to define a [FILE_NAME] or a [DIRECTORY]. Please, check the documentation using the command "help"`
                    );
                }

                config[hasExtension ? options.f : options.d] = fileOrFolder;
            }
        }
    }

    const { create, run, directory, file, migrate, sql } = config;

    if (!run && !migrate && !sql && !create) {
        error(`Error: You have to choose what you want, create or run or migrate or do a query`);
    }

    if (create) {
        requestCreate();
    } else if (sql) {
        let query = '';

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
        });

        rl.prompt();

        rl.on('line', (line) => {
            query = `${query ? query + ' ' : ''}${line.trim()}`;

            if (/^\.quit$|^exit$/.test(query)) {
                process.exit(0);
            }

            if (/;$/.test(line.trim())) {
                requestQuery(query).then(() => rl.prompt());
                query = '';
            }
        }).on('close', () => {
            process.exit(0);
        });
    } else if ((file && migrate) || run) {
        const extension = path.extname(file || run);
        if (['.db', '.sql', '.yaml', '.yml'].includes(extension)) {
            requestFile(file || run);
        }
    } else if (directory && migrate) {
        const filesNames = getFiles(path.join(process.cwd(), directory));

        filesNames.forEach((fileName) => {
            const extension = path.extname(fileName);
            if (['.db', '.sql', '.yaml', '.yml'].includes(extension)) {
                requestFile(fileName);
            }
        });
    }
}

function requestFile(file) {
    const { config: conf, run, directory, migrate, token } = config;
    const filePath = file
        ? path.join(process.cwd(), file)
        : path.join(process.cwd(), directory, file);
    const buffer = fs.readFileSync(filePath, 'utf8');
    const postData = migrate ? getMigrationContent(buffer)[migrate] : buffer;
    const extension = path.extname(file);
    const type = /^\w+/.exec(buffer)[0];
    const isYaml = /yaml|yml/.test(extension);
    const options = {
        hostname,
        path: `/cli/${isYaml ? `${type}-builder` : 'query'}`,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            Authorization: `Bearer ${token || process.env.ODB_TOKEN || getToken(conf)}`,
        },
    };

    info(options, '\n');
    info(filePath, '\n');
    info(postData, '\n');

    isYaml && info(JSON.stringify(importFunction(yaml.load(postData), type), null, 2), '\n');

    return httpsRequest(
        options,
        isYaml ? JSON.stringify(importFunction(yaml.load(postData), type)) : postData
    )
        .then(() => {
            migrate &&
                success(
                    `Success: ${migrate === 'up' ? 'upgrade' : 'downgrade'} of ${file || filePath}`
                );
            run && success(`Success: run ${file || filePath}`);
        })
        .catch((e) => {
            migrate &&
                error(
                    `Error: ${migrate === 'up' ? 'Upgrade' : 'Downgrade'} of ${file || filePath}${
                        e.statusCode ? ` with status code ${e.statusCode}` : ''
                    }${e.statusMessage ? ` and status message ${e.statusMessage}` : ''}`
                );
            run &&
                error(
                    `Error: ${file || filePath}${
                        e.statusCode ? ` with status code ${e.statusCode}` : ''
                    }${e.statusMessage ? ` and status message ${e.statusMessage}` : ''}`
                );
        });
}

function requestCreate() {
    const { create, config: conf, token } = config;
    const options = {
        hostname,
        path: `/cli/create`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: `Bearer ${token || process.env.ODB_TOKEN || getToken(conf)}`,
        },
    };

    return httpsRequest(options, JSON.stringify({ create }))
        .then((response) => {
            console.log('\r');
            success(`Congratulations, the ${create} has been created successfully!`);
            response && success('Response', response);
        })
        .catch((e) => {
            error(`Error: ${JSON.stringify(e)}`);
        });
}

function requestQuery(query) {
    const { config: conf, token } = config;
    const options = {
        hostname,
        path: `/cli/query`,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            Authorization: `Bearer ${token || process.env.ODB_TOKEN || getToken(conf)}`,
        },
    };

    return httpsRequest(options, query)
        .then((response) => {
            console.log('\r');
            console.table(JSON.parse(response.toString()).data);
        })
        .catch((e) => {
            error(`Error: ${JSON.stringify(e)}`);
        });
}

function getMigrationContent(data) {
    const [u, d] = data.split(/^--\s+?down\b/im);

    if (!u || !d) {
        error('The migrate has to have an upgrade and a downgrade');
    }

    const up = u.replace(/^--.*?$/gm, '').trim();
    const down = d.replace(/^--.*?$/gm, '').trim();

    return { up, down };
}

function getFiles(path) {
    return fs
        .readdirSync(path, { withFileTypes: true })
        .filter((dir) => !dir.isDirectory())
        .map((dir) => dir.name);
}

function getToken(conf = '.odbrc') {
    const filePath = path.join(process.cwd(), conf);
    const content = fs.readFileSync(filePath);

    return content.toString().replace(/=/, '').split('token').join('').trim();
}

function httpsRequest(options, postData) {
    return new Promise(function (resolve, reject) {
        const req = https.request(options, function (res) {
            let body = [];

            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject({ statusCode: res.statusCode, statusMessage: res.statusMessage });
            }

            res.on('data', function (chunk) {
                body.push(chunk);
            });

            res.on('end', function () {
                try {
                    resolve(body);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', function (err) {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

function importFunction(obj, type) {
    const fn = type === 'api' ? obj.api.function : obj.page.function;
    if (fn) {
        const content = fs
            .readFileSync(fn)
            .toString()
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^\(/, '')
            .replace(/(\)\(\);|\)\(\))$/, '');

        if (type === 'api') {
            obj.api.query = content;
        } else {
            obj.page.function = content;
        }
    }

    return obj;
}

function error(message) {
    console.error(FgRed, message);
    process.exit(0);
}

function info(message) {
    console.log(FgYellow, message);
}

function success(message) {
    console.log(FgGreen, message);
}
