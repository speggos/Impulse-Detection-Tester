const fs = require('fs');
const WaveDecoder = require('wav-decoder');
const helpers = require('./helpers');
const detectionAlgorithms =require('./detectionAlgorithms');


async function test() {

    const files = fs.readdirSync('./samples');

    let successfulTests = [];
    let unsuccessfulTests = [];

    let promiseIstance;
    let allPromises = [];

    // file is a string
    for (let file of files) {

        if (file.split('.')[1] !== 'wav') {
            continue;
        }

        let res = fs.readFileSync('./samples/' + file);

        promiseIstance = WaveDecoder.decode(res)
        // channelData is (# of channels) arrays of signed decimals
            .then((data) => {

                const audioData = helpers.combineArrays(data.channelData[0], data.channelData[1]);

                const decimatedData = helpers.decimateByN(audioData);

                const dataWithNoiseBefore = helpers.addNoiseToFront(audioData);

                const noisyData = helpers.addNoise(audioData);

                if (detectionAlgorithms.detectImpulseMA(decimatedData)) {
                    successfulTests.push(file);
                } else {
                    unsuccessfulTests.push(file);
                }
            });

        allPromises.push(promiseIstance);

    }

    // Wait for all promises to complete before outputting results
    await Promise.all(allPromises)
        .then(()=>{
            console.log("Correct: " + successfulTests.length);
            console.log("Incorrect: " + unsuccessfulTests.length);
        })

}

test();