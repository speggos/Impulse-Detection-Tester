const constants = require('./constants');
const helpers = require('./helpers');

const plotly = require('plotly')(constants.plotlyUsername, constants.plotlyAPIKey);

helpers.decodeAudioFile('./samples/loc1_3.wav', (audioFile) => {

    const audioData = audioFile.channelData[0];

    const decimatedData = helpers.decimateByN(audioData,2);

    const x = [];
    const y = [];
    const x2 = [];
    const y2 = [];
    const x3 = [];
    const y3 = [];
    const x4 = [];
    const y4 = [];


    // Show RMS
    for (let i=0; i<decimatedData.length / constants.bufferSize; i++) {
        x.push(i/(24000/constants.bufferSize));
        y.push(helpers.getSumOfSquares(decimatedData.slice(i*constants.bufferSize, (i+1)*constants.bufferSize)))
    }

    // Show recursive average
    let recursiveAverage;
    let currentBufferTotal;
    for (let i=0; i<decimatedData.length / constants.bufferSize; i++) {
        currentBufferTotal = helpers.getSumOfSquares(decimatedData.slice(i*constants.bufferSize, (i+1)*constants.bufferSize));
        if (i===0) {
            recursiveAverage = currentBufferTotal
        } else {
            recursiveAverage = helpers.updateRecursiveAverage(recursiveAverage, currentBufferTotal, constants.beta);
        }

        x2.push(i/(24000/constants.bufferSize));
        y2.push(recursiveAverage);
        x4.push(i/(24000/constants.bufferSize));
        y4.push(currentBufferTotal - recursiveAverage);

    }

    // Show waveform data
    for (let i=0; i<decimatedData.length; i++) {
        x3.push(i/24000);
        y3.push(decimatedData[i]);
    }

    const data = [
        {x:x, y:y, type: 'line'},
        {x:x2, y:y2, type:'line'},
        {x:x3, y:y3, type:'line'},
        {x:x4, y:y4, type:'line'}
    ];

    const layout = {fileopt : "overwrite", filename : "Waveform-Data"};

    plotly.plot(data, layout, function (err, msg) {
        if (err) return console.log(err);
        console.log(msg);
    });
});