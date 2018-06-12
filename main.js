const fs = require('fs');
const FileReader = require('filereader');
const WaveDecoder = require('wav-decoder');

//TODO get bufferSize
const bufferSize = 1024;

// Time constant
const beta = 0.98;

// How much "larger" a period of time has to be to trigger the peak detection algorithm
const audioThreshold = 5;

const buffersToRead = 16;

function detectPeak(waveData) {

    let recursiveAverage = -1;
    let peakDetectedIndex = -1;
    let recursiveAverageAtPeakDetection;
    let currentBufferTotal;

    for (let i=0; i< Math.floor(waveData.length / bufferSize); i++) {

        currentBufferTotal = 0;

        // Get "Noise" of buffer
        for (let j=0; j<bufferSize; j++) {
            currentBufferTotal += Math.abs(waveData[i * bufferSize + j])
        }

        // First Iteration
        if (recursiveAverage === -1) {

            recursiveAverage = currentBufferTotal;

        // If we are at the end of the file, or
        } else if (i === waveData.length - 1 || i === peakDetectedIndex + buffersToRead) {

            return currentBufferTotal < (audioThreshold / 2) * recursiveAverageAtPeakDetection

        } else {

            recursiveAverage = beta * recursiveAverage + (1-beta) * currentBufferTotal;

            // How peaks are detected
            if (peakDetectedIndex === -1 && currentBufferTotal > audioThreshold * recursiveAverage) {

                peakDetectedIndex = i;
                recursiveAverageAtPeakDetection = recursiveAverage;
            }
        }
    }

    return false;
}

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
                const audioData = combineArrays(data.channelData[0], data.channelData[1]);

                if (detectPeak(audioData)) {
                    successfulTests.push(file);
                } else {
                    unsuccessfulTests.push(file);
                }
            });

        allPromises.push(promiseIstance);

    }

    await Promise.all(allPromises)
        .then(()=>{
            console.log("Correct: " + successfulTests.length);
            console.log("Incorrect: " + unsuccessfulTests.length);
        })

}

function combineArrays(array1, array2) {

    if (array1.length !== array2.length) {
        console.log('Error: Arrays not of equal length');
        return []
    }

    let combinedArray = [];

    for (let i=0; i<array1.length; i++) {
        combinedArray.push(array1[i] + array2[i])
    }

    return combinedArray;
}

test();