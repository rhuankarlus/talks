const {
    parentPort,
    threadId,
} = require('worker_threads');

console.log(`worker-${threadId}: starting...`);
let counter = 0;
const interval = setInterval(() => {
    console.log(`worker-${threadId}: counting now... I'm on -> ${counter}`);
    if (++counter == 10) {
        clearInterval(interval);
        parentPort.postMessage({
            counter,
            threadId,
        });
        console.log(`worker-${threadId}: message sent...`);
    }
}, 1000);
