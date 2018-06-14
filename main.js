const fs = require('fs');
const helpers = require('./helpers');
const detectionAlgorithms =require('./detectionAlgorithms');
const constants = require('./constants');

const tests = [
    new helpers.Test("Undefined Vars", detectionAlgorithms.detectImpulseMA, './samples/', undefined, undefined, undefined),
    new helpers.Test("Defined", detectionAlgorithms.detectImpulseMA, './samples/', constants.beta, constants.audioThreshold, constants.buffersToRead)
];


async function performTest(name, detectionAlg, path, beta, audioThreshold, buffersToRead) {

    const files = fs.readdirSync(path);

    let successfulTests = [];
    let unsuccessfulTests = [];

    let promiseInstance;
    let allPromises = [];

    for (let file of files) {

        if (file.split('.')[1] !== 'wav') {
            continue;
        }

        promiseInstance = helpers.decodeAudioFile(path + file, (data) => {

            const audioData = helpers.combineArrays(data.channelData[0], data.channelData[1]);

            //Decimate data by 2
            const decimatedData = helpers.decimateByN(audioData, 2);

            if (detectionAlg(decimatedData, beta, audioThreshold, buffersToRead)) {
                successfulTests.push(file);
            } else {
                unsuccessfulTests.push(file);
            }
        });

        allPromises.push(promiseInstance);

    }

    // Wait for all promises to complete before outputting results
    await Promise.all(allPromises)
        .then(()=>{
            console.log("");
            console.log("Finished test: " + name);
            console.log("Peaks Correctly detected: " + successfulTests.length);
            console.log("Peaks Incorrectly Detected: " + unsuccessfulTests.length);
            // TODO non-peaks correctly not detected...
        })

}

function main() {
    for (let test of tests) {
        performTest(test.getName(), test.getDetectionAlg(), test.getDataPath(), test.getBeta(), test.getAudioThreshold(), test.getBuffersToRead())
    }
}


main();