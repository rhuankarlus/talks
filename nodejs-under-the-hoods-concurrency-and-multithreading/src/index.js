const cluster = require('cluster');
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

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs - 1; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    process.env.UV_THREADPOOL_SIZE = 14;

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
}

module.exports = app;
