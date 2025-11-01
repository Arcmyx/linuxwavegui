const fs = require("fs");
const wav = require("wav-decoder");
const Pitchfinder = require("pitchfinder");
const { Midi } = require("@tonejs/midi");

const buffer = fs.readFileSync("output.wav");

wav.decode(buffer).then((audioData) => {
  const float32Array = audioData.channelData[0];
  const sampleRate = audioData.sampleRate;
  const detectPitch = Pitchfinder.YIN();

  const frequencies = Pitchfinder.frequencies(detectPitch, float32Array, {
    tempo: 174,
    quantization: 4,
  });

  const hzToMidi = (hz) => Math.round(69 + 12 * Math.log2(hz / 440));

  const midi = new Midi();
  const track = midi.addTrack();

  let time = 0;
  const duration = 0.25; // quarter note

  for (const freq of frequencies) {
    if (freq) {
      const midiNote = hzToMidi(freq);
      track.addNote({ midi: midiNote, time, duration });
    }
    time += duration;
  }

  const midiData = midi.toArray();
  fs.writeFileSync("output.mid", Buffer.from(midiData));
  console.log("✅ MIDI file written: output.mid");
});
