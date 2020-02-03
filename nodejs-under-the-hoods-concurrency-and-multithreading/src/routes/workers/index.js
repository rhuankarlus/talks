const router = require('express').Router();
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const processId = process.pid;

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

    heavyWorker.on('message', ({ sum, threadId }) => {
        console.log(`[MAIN PROCESS]: message reveived from ${threadId}`);
        heavyWorkerData.sum = sum;
        heavyWorkerData.threadId = threadId;
    });
    heavyWorker.on('error', (err) => console.log('[heavy worker] ERROR:', err));
    heavyWorker.on('exit', (code) => {
        console.log(`[heavy worker] finished with code -> ${code}`);
        heavyWorkerData.finished = true;
        sendResponse();
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
        sendResponse();
    });
});

module.exports = router;