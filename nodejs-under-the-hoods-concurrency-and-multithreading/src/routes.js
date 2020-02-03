const router = require('express').Router();
const { Client } = require('pg');
const groupBy = require('lodash').groupBy;
const uniqBy = require('lodash').uniqBy;
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const sumSync = require('../build/Release/sum_sync');
const sumAsync = require('../build/Release/sum_async');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});
client.connect();

const processId = process.pid;
const jsSum = () => {
    let a = 3.1415926, b = 2.718;
    for (i = 0; i < 1000000000; i++) {
        for (j = 0; j < 10; j++) {
            a += b;
        }
    }
    return a;
};

router.get('/', (req, res) => {
    res.send('still alive');
});

router.get('/js_sync', (req, res) => {
    const init = Date.now();
    const sum = jsSum();
    res.jsonp({
        sum,
        timeInSeconds: (Date.now() - init)/1000,
        proccesses: {
            pid: processId,
        }
    });
});

router.get('/js_async', async (req, res) => {
    const init = Date.now();
    const sum = jsSum();
    res.jsonp({
        sum,
        timeInSeconds: (Date.now() - init)/1000,
        proccesses: {
            pid: processId,
        }
    });
});

router.get('/worker', (req, res) => {
    const init = Date.now();
    let heavyWorkerData = {
        finished: false,
        threadId: null,
        sum: 0,
    };
    let talkativeWorkerData = {
        finished: false,
        threadId: null,
        counter: 0,
    };
    const heavyWorker = new Worker('./src/heavy_worker.js');
    const talkativeWorker = new Worker('./src/talkative_worker.js');

    heavyWorker.on('message', ({ sum, threadId }) => {
        console.log(`[MAIN PROCESS]: message reveived from ${threadId}`);
        heavyWorkerData.sum = sum;
        heavyWorkerData.threadId = threadId;
    });
    heavyWorker.on('error', (err) => console.log('[heavy worker] ERROR:', err));
    heavyWorker.on('exit', (code) => {
        console.log(`[heavy worker] finished with code -> ${code}`);
        heavyWorkerData.finished = true;

        if (heavyWorkerData.finished && talkativeWorkerData.finished) {
            res.jsonp({
                sum: heavyWorkerData.sum,
                counter: talkativeWorkerData.counter,
                timeInSeconds: (Date.now() - init)/1000,
                proccesses: {
                    pid: processId,
                    threads: {
                        heavyWorker: heavyWorkerData.threadId,
                        talkativeWorker: talkativeWorkerData.threadId,
                    }
                }
            });
        }
    });

    talkativeWorker.on('message', ({ counter, threadId }) => {
        console.log(`[MAIN PROCESS]: message reveived from ${threadId}`);
        talkativeWorkerData.counter = counter;
        talkativeWorkerData.threadId = threadId;
    });
    talkativeWorker.on('error', (err) => console.log('[talkative worker] ERROR:', err));
    talkativeWorker.on('exit', (code) => {
        console.log(`[talkative worker] finished with code -> ${code}`);
        talkativeWorkerData.finished = true;

        if (heavyWorkerData.finished && talkativeWorkerData.finished) {
            res.jsonp({
                sum: heavyWorkerData.sum,
                counter: talkativeWorkerData.counter,
                timeInSeconds: (Date.now() - init)/1000,
                proccesses: {
                    pid: processId,
                    threads: {
                        heavyWorker: heavyWorkerData.threadId,
                        talkativeWorker: talkativeWorkerData.threadId,
                    }
                }
            });
        }
    });
});

router.get('/cpp_sync', (req, res) => {
    const init = Date.now();
    const sum = sumSync.sum();
    res.jsonp({
        sum,
        timeInSeconds: (Date.now() - init)/1000,
        proccesses: {
            pid: processId,
        }
    });
});

router.get('/cpp_async', (req, res) => {
    setTimeout(() => {
        const init = Date.now();
        sumAsync.sum(result => {
            const timeInSeconds = (Date.now() - init)/1000;
            console.log(`terminei: ${timeInSeconds}`);
            res.jsonp({
                sum: result,
                timeInSeconds,
                proccesses: {
                    pid: processId,
                }
            });
        });
    }, 1000);
});

const inicio = Date.now();
client.query('SELECT * FROM users', (err, res) => {
    const departments = groupBy(
        res.rows.filter(user => user.age >= 18),
        'department',
    );
    Object
        .keys(departments)
        .forEach(department => {
            console.log(`\nDepartment: ${department}`);
            uniqBy(departments[department], user => user.forename)
                .sort((userA, userB) => userA.forename.localeCompare(userB.forename))
                .forEach(user => console.log(`${user.forename} ${user.surname} ${user.age}: ${65 - user.age} para se aposentar`));
        });
    console.log(`tempo total: ${(Date.now() - inicio)/1000}`);
});

module.exports = router;
