const fs = require('fs');
const WaveDecoder = require('wav-decoder');
const helpers = require('./helpers');

//TODO get bufferSize
const bufferSize = 1024;

// Time constant
const beta = 0.85;

// How much "larger" a period of time has to be to trigger the peak detection algorithm
const audioThreshold = 3;
const buffersToRead = 16;


function detectImpulse(waveData) {

    let recursiveAverage = -1;
    let peakDetectedIndex = -1;
    let recursiveAverageAtPeakDetection;
    let currentBufferTotal;

    for (let i=0; i< Math.floor(waveData.length / bufferSize); i++) {

        // Get sum of squares for indexes from i*bufferSize to (i+1)*bufferSize
        currentBufferTotal = helpers.getSumOfSquares(waveData.slice(i*bufferSize, i*bufferSize + bufferSize));

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

function detectImpulseMA(waveData) {

    let recursiveAverage = -1;
    let potentialPeaks = [];
    let currentBufferTotal;


    for (let i=0; i< Math.floor(waveData.length / bufferSize); i++) {

        // Get sum of squares for indexes from i*bufferSize to (i+1)*bufferSize
        currentBufferTotal = helpers.getSumOfSquares(waveData.slice(i*bufferSize, i*bufferSize + bufferSize));

        // First Iteration
        if (recursiveAverage === -1) {

            recursiveAverage = currentBufferTotal;

        } else  {

            recursiveAverage = beta * recursiveAverage + (1-beta) * currentBufferTotal;

            let currPeak;
            // Loop through each potential peak
            for (let j=potentialPeaks.length - 1; j >= 0; j--) {

                currPeak = potentialPeaks[j];

                // If the potentialPeak finished being analyzed
                if (currPeak.getRemaining() === 0) {

                    // Where we confirm a peak. If there were more buffers below MA than above
                    if (currPeak.getBelowMA() - currPeak.getAboveMA() > 0) {
                        return true
                    }

                    potentialPeaks.pop();

                //Update the potentialPeak
                } else {

                    // If they are equal, incrementing belowMA
                    if (currentBufferTotal - recursiveAverage > 0) {
                        currPeak.incAboveMA();
                    } else {
                        currPeak.incBelowMA();
                    }
                    currPeak.decRemaining();

                }
            }

            if (currentBufferTotal > recursiveAverage * audioThreshold) {
                potentialPeaks.push(new helpers.PotentialPeak(buffersToRead));
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

                const audioData = helpers.combineArrays(data.channelData[0], data.channelData[1]);

                const dataWithNoiseBefore = helpers.addNoiseToFront(audioData);

                const noisyData = helpers.addNoise(audioData);

                if (detectImpulseMA(audioData)) {
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