// process.env.UV_THREADPOOL_SIZE = 10;

const app = require('express')();
const Pool = require('pg-pool');

const {
    workers,
    cpp,
    db,
    dummy,
    fs,
    jsProcessing,
    request,
} = require('./routes');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 60000,
});

app
    .use((req, res, next) => {
        req.initTime = new Date();
        req.pool = pool;

        console.log({
            url: req.url,
            PID: process.pid,
        });

        res.on('finish', () => {
            console.log('Finished', {
                url: req.url,
                PID: process.pid,
                time: (Date.now() - req.initTime) / 1000
            });
        })

        next();
    })
    .use(workers)
    .use(cpp)
    .use(db)
    .use(dummy)
    .use(fs)
    .use(jsProcessing)
    .use(request)
    .listen(3000, () => {
        console.log(`Process ${process.pid} started`);
    });

module.exports = app;
