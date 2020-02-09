process.env.UV_THREADPOOL_SIZE = 10;

const numCPUs = require('os').cpus().length;
const app = require('express')();
const {
    workers,
    cpp,
    db,
    dummy,
    fs,
    jsProcessing,
    request,
} = require('./routes');

app
    .use((req, res, next) => {
        req.initTime = new Date();
        console.log({
            url: req.url,
            PID: process.pid,
        });

        res.on('finish', () => {
            console.log('Finished', {
                url: req.url,
                PID: process.pid,
                time: (Date.now() - req.initTime)/1000
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
