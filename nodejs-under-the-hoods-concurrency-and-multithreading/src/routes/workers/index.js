const router = require('express').Router();
const { Worker } = require('worker_threads');

const processId = process.pid;

const EVENTS = {
    MESSAGE: 'message',
    ERROR: 'error',
    EXIT: 'exit',
};

router.get('/workers', (req, res) => {
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
    const heavyWorker = new Worker(`${__dirname}/heavy_worker.js`);
    const talkativeWorker = new Worker(`${__dirname}/talkative_worker.js`);

    const sendResponse = () => {
        if (heavyWorkerData.finished && talkativeWorkerData.finished) {
            console.log('finished', (Date.now() - init)/1000);
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
    };

    heavyWorker.on(EVENTS.MESSAGE, ({ sum, threadId }) => {
        heavyWorkerData.sum = sum;
        heavyWorkerData.threadId = threadId;
    });
    heavyWorker.on(EVENTS.ERROR, (err) => console.log('[heavy worker] ERROR:', err));
    heavyWorker.on(EVENTS.EXIT, (code) => {
        heavyWorkerData.finished = true;
        sendResponse();
    });

    talkativeWorker.on(EVENTS.MESSAGE, ({ counter, threadId }) => {
        talkativeWorkerData.counter = counter;
        talkativeWorkerData.threadId = threadId;
    });
    talkativeWorker.on(EVENTS.ERROR, (err) => console.log('[talkative worker] ERROR:', err));
    talkativeWorker.on(EVENTS.EXIT, (code) => {
        talkativeWorkerData.finished = true;
        sendResponse();
    });
});

router.get('/workers_teamplate_string', (req, res) => {
    const init = Date.now();
    const tsWorker = new Worker(`
        const {
            parentPort,
            threadId,
        } = require('worker_threads');

        console.log(\`Starting at ${new Date()}\`);
        let talk = 1;
        const interval = setInterval(() => {
            console.log(\`counting....\${talk}\`);
            if (++talk === 6) {
                clearInterval(interval);
                parentPort.postMessage({ threadId });
            }
        }, 1000);
    `, { eval: true });

    tsWorker.on(EVENTS.MESSAGE, ({ threadId }) => {
        console.log(`[MAIN PROCESS]: message reveived from ${threadId}`);
        res.jsonp({
            timeInSeconds: (Date.now() - init)/1000,
            proccesses: {
                pid: processId,
                threadId,
            },
        });
    });
    tsWorker.on(EVENTS.ERROR, (err) => console.log('[template string worker] ERROR:', err));
    tsWorker.on(EVENTS.EXIT, (code) => {
        console.log(`[template string worker] finished with code -> ${code}`);
    });
});

module.exports = router;