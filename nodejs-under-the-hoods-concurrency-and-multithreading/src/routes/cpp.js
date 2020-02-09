const router = require('express').Router();

const sumSync = require('../../build/Release/sum_sync');
const sumAsync = require('../../build/Release/sum_async');

const processId = process.pid;

router.get('/cpp_sync', (req, res) => {
    const init = Date.now();
    const sum = sumSync.sum();
    res.jsonp({
        sum,
        timeInSeconds: (Date.now() - init) / 1000,
        proccesses: {
            pid: processId,
        }
    });
});

router.get('/cpp_async', (req, res) => {
    const init = Date.now();
    sumAsync.sum((sum) => {
        const timeInSeconds = (Date.now() - init) / 1000;
        console.log(`terminei: ${timeInSeconds}`);
        res.jsonp({
            sum,
            timeInSeconds,
            proccesses: {
                pid: processId,
            }
        });
    });
});

router.get('/cpp_promise', async (req, res) => {
    const init = Date.now();
    const sum = await new Promise(resolve => {
        sumAsync.sum((result) => {
            setImmediate(() => resolve(result));
        });
    });
    const timeInSeconds = (Date.now() - init) / 1000;
    console.log(`terminei: ${timeInSeconds}`);
    res.jsonp({
        sum,
        proccesses: {
            pid: processId,
        }
    });
});

module.exports = router;
