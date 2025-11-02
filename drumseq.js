const fs = require("fs");
const wav = require("wav-decoder");
const { encode: encodeWav } = require("wav-encoder");
const AudioBuffer = require("audio-buffer");
const utils = require("audio-buffer-utils");

const sampleRate = 44100;
const bpm = parseFloat(process.argv[2]) || 120; // Default to 120 if no arg
const totalDuration = parseFloat(process.argv[3]) || 4; // Default to 4 seconds if not provided
const addClap = parseInt(process.argv[4]) === 1;
const steps = 16;
const beatDuration = 60 / bpm;
const stepDuration = beatDuration / 4;
console.log(`Step duration: ${stepDuration}s`);
console.log(`Total duration: ${totalDuration}s`);
async function loadSample(filePath) {
  const file = fs.readFileSync(filePath); // sync read is simplest
  const decoded = await wav.decode(file);

  // force mono
  const left = decoded.channelData[0];
  const right = decoded.channelData[1] || left;
  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) mono[i] = (left[i] + right[i]) / 2;

  // create AudioBuffer (v4 style)
  // FIXED: Use options object for constructor
  const buffer = new AudioBuffer({
    numberOfChannels: 1,
    length: mono.length,
    sampleRate: decoded.sampleRate,
  });
  buffer.getChannelData(0).set(mono);
  return buffer;
}

(async () => {
  try {
    const kick = await loadSample("assets/kick.wav");
    const snare = await loadSample("assets/snare.wav");
    const hihat = await loadSample("assets/hihat.wav");
    let clap = null;
    if (addClap) {
      clap = await loadSample("assets/clap.wav");
    }

    const loopLength = stepDuration * steps;
    const maxSampleLength = Math.max(kick.length, snare.length, hihat.length);
    const singleLoopLength = Math.ceil(
      loopLength * sampleRate + maxSampleLength
    );

    // Calculate how many times to repeat the loop
    const numRepeats = Math.ceil(totalDuration / loopLength);
    const outputLength = Math.ceil(
      totalDuration * sampleRate + maxSampleLength
    );

    const output = new AudioBuffer({
      numberOfChannels: 1,
      length: outputLength,
      sampleRate: sampleRate,
    });

    function mixSample(output, sample, offset) {
      const outData = output.getChannelData(0);
      const inData = sample.getChannelData(0);
      // ...existing code...
      for (let j = 0; j < inData.length; j++) {
        if (offset + j < outData.length) {
          outData[offset + j] += inData[j];
        }
      }
    }

    // Render and mix the loop multiple times
    for (let repeat = 0; repeat < numRepeats; repeat++) {
      const loopOffset = Math.floor(repeat * loopLength * sampleRate);
      let kickCount = 0;
      for (let i = 0; i < steps; i++) {
        const time = i * stepDuration;
        const offset = loopOffset + Math.floor(time * sampleRate);

        if (i % 2 === 0) mixSample(output, hihat, offset);
        // Kicks on i == 0 and i == 8
        if (i % 16 === 0 || i % 16 === 8) {
          kickCount++;
          mixSample(output, kick, offset);
          // Add claps before and after every even kick
          if (addClap && kickCount % 2 === 0 && clap) {
            const clapBefore = offset - Math.floor(stepDuration * sampleRate);
            const clapAfter = offset + Math.floor(stepDuration * sampleRate);
            if (clapBefore >= 0) mixSample(output, clap, clapBefore);
            if (clapAfter < output.length) mixSample(output, clap, clapAfter);
          }
        }
        if (i % 16 === 4 || i % 16 === 12) mixSample(output, snare, offset);
      }
    }
    utils.normalize(output);

    const encoded = await encodeWav({
      sampleRate,
      channelData: [output.getChannelData(0)],
    });

    fs.writeFileSync("rockbeat.wav", Buffer.from(encoded));
    console.log("Rock beat written to rockbeat.wav");
  } catch (err) {
    console.error("Error creating drum sequence:", err);
  }
})();
