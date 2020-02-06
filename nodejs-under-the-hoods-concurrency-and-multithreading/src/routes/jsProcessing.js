const router = require('express').Router();
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

router.get('/js_timeout', (req, res) => {
    const init = Date.now();
    setTimeout(() => {
        const sum = jsSum();
        res.jsonp({
            sum,
            timeInSeconds: (Date.now() - init)/1000,
            proccesses: {
                pid: processId,
            }
        });
    }, 1000);
});

module.exports = router;
