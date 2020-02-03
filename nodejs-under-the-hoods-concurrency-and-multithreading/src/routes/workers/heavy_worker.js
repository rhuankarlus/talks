const {
    parentPort,
    threadId,
} = require('worker_threads');

console.log(`worker-${threadId}: starting...`);
const jsSum = () => {
    let a = 3.1415926, b = 2.718;
    for (i = 0; i < 1000000000; i++) {
        for (j = 0; j < 10; j++) {
            a += b;
        }
    }
    return a;
};

parentPort.postMessage({
    sum: jsSum(),
    threadId,
});

console.log(`worker-${threadId}: message sent...`);