const router = require('express').Router();
const https = require('https');
const processId = process.pid;

router.get('/sendRequest', (req, res) => {
    https.get(
        'https://jsonplaceholder.typicode.com/todos/',
        httpRes => {
            let chunk = '';
            httpRes.on('data', anotherChunk => {
                if (anotherChunk) chunk += anotherChunk;
            });
            httpRes.on('end', () => {
                res.jsonp({
                    chunk,
                    processId,
                });
            });
        },
    );
});

module.exports = router;
