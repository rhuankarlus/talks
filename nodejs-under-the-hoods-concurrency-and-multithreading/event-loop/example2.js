process.nextTick(() => console.log('1: nextTick'));

const httpPromise = () => new Promise(resolve => {
    require('http').get('http://localhost:3000/wait_200', res => {
        res.on("data", () => {});
        res.on("close", () => {
            console.log("2: Response close");
        });
        res.on('end', () => {
            console.log('3: Response end');
            return resolve();
        });
    });
});

httpPromise().then(() => console.log('4: httpPromise resolved'));

setTimeout(() => console.log('5: setTimeout'), 220);

setImmediate(() => { console.log('6: setImmediate'); });


const initTime = Date.now();

while(Date.now() - initTime < 200) {
    // espera 200ms;
}

console.log('7: while');


