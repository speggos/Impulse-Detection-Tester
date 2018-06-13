const constants = require('./constants');
// Iteratively add each element of array1 and array2 into a resulting array. Both arrays must be of equal length
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

// This function doesn't work very well. Relies on noiseConstant
function addNoise(inputArray) {

    const lastThirdOfArray = inputArray.slice(inputArray.length*2/3, inputArray.length);

    const averageAmpOfLastThird = getAverage(lastThirdOfArray);

    const noisyArray = inputArray.map((index) => {
        return index + (Math.random() * averageAmpOfLastThird * 2 - 1) * constants.noiseConstant
    });

    return noisyArray;
}

// This function doesn't work very well. Relies on noiseConstant
function addNoiseToFront(inputArray) {

    const averageOfLastThird = getAverage(inputArray.slice(inputArray.length*2/3, inputArray.length));

    const noiseArray = [];

    for (let i=0; i<inputArray.length; i++) {
        noiseArray.push( (Math.random() * 2 - 1) * averageOfLastThird * constants.noiseConstant);
    }

    return noiseArray.concat(inputArray);

}

function getAverage(array) {

    let total = 0;

    array.map( (x) => {
        total += Math.abs(x);
    });

    return total / array.length;

}

function getSumOfSquares(array) {

    let total = 0;

    array.map( (x) => {
        total += Math.pow(x,2);
    });

    return Math.sqrt(total);
}

// Returns an array decimated by a factor of N
function decimateByN(array, n = 2) {

    let decimatedArray = [];

    for (let i=0; i < array.length/n; i++) {
        decimatedArray.push(array[n*i])
    }

    return decimatedArray;

}

// Initialize with how many buffers it should read in total
class PotentialPeak {

    constructor(remaining) {
        this.remaining = remaining;
        this.aboveMA = 0;
        this.belowMA = 0;
    }

    incAboveMA() {
        this.aboveMA += 1;
    }

    incBelowMA() {
        this.belowMA += 1;
    }

    decRemaining() {
        this.remaining -= 1;
    }

    getAboveMA() {
        return this.aboveMA;
    }

    getBelowMA() {
        return this.belowMA;
    }

    getRemaining() {
        return this.remaining;
    }
}

class Test {
    constructor(detectionAlg, data, beta=0.9, audioThreshold=3, buffersToRead = 16, minPercentToReject = .5) {
        this.detectionAlg = detectionAlg;
        this.data = data;
        this.beta = beta;
        this.audioThreshold = buffersToRead;
        this.minPercentToReject = minPercentToReject;
    }

    get detectionAlg() {
        return this.detectionAlg;
    }

    get data() {
        return this.data;
    }

    get beta() {
        return this.beta;
    }

    get audioThreshold() {
        return this.audioThreshold;
    }

    get minPercentToReject() {
        return this.minPercentToReject;
    }
}

module.exports = {
    combineArrays,
    addNoise,
    addNoiseToFront,
    getAverage,
    getSumOfSquares,
    decimateByN,
    PotentialPeak,
    Test
};