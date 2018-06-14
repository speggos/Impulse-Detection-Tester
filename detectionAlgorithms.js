const helpers = require('./helpers');
const constants = require('./constants');

// Each detection algorithm must take the same data, in the same order. See other algorithms for the current data

// Detect peak, (buffersToRead) buffers later check if the signal is half of audiothreshold or less
function detectImpulseOriginal(waveData, beta, audioThreshold, buffersToRead) {

    let recursiveAverage = -1;
    let peakDetectedIndex = -1;
    let recursiveAverageAtPeakDetection;
    let currentBufferTotal;

    for (let i=0; i< Math.floor(waveData.length / constants.bufferSize); i++) {

        // Get sum of squares for indexes from i*bufferSize to (i+1)*bufferSize
        currentBufferTotal = helpers.getSumOfSquares(waveData.slice(i*constants.bufferSize, (i+1)*constants.bufferSize));

        // First Iteration
        if (recursiveAverage === -1) {

            recursiveAverage = currentBufferTotal;

            // If we are at the end of the file, or
        } else if (i === waveData.length - 1 || i === peakDetectedIndex + buffersToRead) {

            return currentBufferTotal < (audioThreshold / 2) * recursiveAverageAtPeakDetection

        } else {

            recursiveAverage = helpers.updateRecursiveAverage(recursiveAverage,currentBufferTotal, beta);

            // How peaks are detected
            if (peakDetectedIndex === -1 && currentBufferTotal > audioThreshold * recursiveAverage) {

                peakDetectedIndex = i;
                recursiveAverageAtPeakDetection = recursiveAverage;
            }
        }
    }

    return false;
}

// Detect peak, keep updating MA and adding new potential peaks. Each iteration check if MA is below/above current
function detectImpulseMA(waveData, beta, audioThreshold, buffersToRead) {

    let recursiveAverage = -1;
    let potentialPeaks = [];
    let currentBufferTotal;


    for (let i=0; i< Math.floor(waveData.length / constants.bufferSize); i++) {

        // Get sum of squares for indexes from i*bufferSize to (i+1)*bufferSize
        currentBufferTotal = helpers.getSumOfSquares(waveData.slice(i*constants.bufferSize, (i+1)*constants.bufferSize));

        // First Iteration
        if (recursiveAverage === -1) {

            recursiveAverage = currentBufferTotal;

        } else  {

            recursiveAverage = helpers.updateRecursiveAverage(recursiveAverage, currentBufferTotal, beta);

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


module.exports = {
    detectImpulseOriginal,
    detectImpulseMA,
};