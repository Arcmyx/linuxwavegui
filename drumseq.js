const fs = require("fs");
const wav = require("wav-decoder");
const { encode: encodeWav } = require("wav-encoder");
const AudioBuffer = require("audio-buffer");
const utils = require("audio-buffer-utils");

const sampleRate = 44100;
const bpm = parseFloat(process.argv[2]) || 120; // Default to 120 if no arg
const steps = 16;
const beatDuration = 60 / bpm;
const stepDuration = beatDuration / 4;
console.log(`Step duration: ${stepDuration}s`);
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
  console.log("Loaded sample rate:", decoded.sampleRate);
  return buffer;
}

(async () => {
  try {
    const kick = await loadSample("kick.wav");
    const snare = await loadSample("snare.wav");
    const hihat = await loadSample("hihat.wav");

    const loopLength = stepDuration * steps;

    const maxSampleLength = Math.max(kick.length, snare.length, hihat.length);
    const outputLength = Math.ceil(loopLength * sampleRate + maxSampleLength);

    const output = new AudioBuffer({
      numberOfChannels: 1,
      length: outputLength,
      sampleRate: sampleRate,
    });

    function mixSample(output, sample, offset) {
      const outData = output.getChannelData(0);
      const inData = sample.getChannelData(0);
      console.log(
        `Mixing sample of length ${inData.length} at offset ${offset}`
      );
      for (let j = 0; j < inData.length; j++) {
        if (offset + j < outData.length) {
          outData[offset + j] += inData[j];
        }
      }
    }

    for (let i = 0; i < steps; i++) {
      const time = i * stepDuration;
      const offset = Math.floor(time * sampleRate);

      if (i % 2 === 0) mixSample(output, hihat, offset);
      if (i % 16 === 0 || i % 16 === 8) mixSample(output, kick, offset);
      if (i % 16 === 4 || i % 16 === 12) mixSample(output, snare, offset);
      console.log(`Step ${i}, offset ${offset}`);
    }
    utils.normalize(output);

    console.log("Output length (samples):", output.length);
    console.log("Step duration (s):", stepDuration);
    console.log("Max sample length (samples):", maxSampleLength);

    const encoded = await encodeWav({
      sampleRate,
      channelData: [output.getChannelData(0)],
    });

    fs.writeFileSync("rockbeat.wav", Buffer.from(encoded));
    console.log("✅ Rock beat written to rockbeat.wav");
  } catch (err) {
    console.error("Error creating drum sequence:", err);
  }
})();
