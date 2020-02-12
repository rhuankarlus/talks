const callback = (cb) => cb();

require('fs').readFile(__filename, (err, data) => {
    console.log('1: readFile');
});

setImmediate(() => console.log('2: setImmediate'));

setTimeout(() => console.log('3: setTimeout'), 0);

Promise.resolve().then(() => {
    console.log('4: promise resolve');
});

console.log('5: console.log');

callback(() => console.log('6: callback'));

process.nextTick(() => {
    console.log('7: nextTick');
});
