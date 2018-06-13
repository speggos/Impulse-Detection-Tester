const plotlyUsername = "speggos";
const plotlyAPIKey = "w2yFmEomigwcPbLUtv9T";

//TODO get bufferSize in actual cellphone
const bufferSize = 1024;

// For recursive average calculation
const beta = 0.65;

// How much "larger" a period of time has to be to trigger the peak detection algorithm
const audioThreshold = 1.5;

// How "loud" randomly generated noise is compared to average of sample
const noiseConstant = 0.1;
const buffersToRead = 8;


module.exports = {
    plotlyUsername,
    plotlyAPIKey,
    bufferSize,
    beta,
    audioThreshold,
    buffersToRead,
    noiseConstant,
};