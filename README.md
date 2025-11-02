# Linuxwave GUI

A simple Electron-based GUI for [linuxwave](https://github.com/orhun/linuxwave), a command-line tool to generate music from bytes of files (default: /dev/urandom). This app lets you easily run linuxwave and post-process the output with sox, providing a user-friendly interface for random music generation.

## Features

- Enter BPM, key, and duration to generate music.
- Runs linuxwave and sox with your chosen parameters.
- Displays status updates when generation is complete.
- Requires linuxwave and sox to be installed on your system.

## Prerequisites

- **Any Linux Distro** (recommended: Arch, Ubuntu, etc.)
- [linuxwave](https://github.com/orhun/linuxwave) (install from source or download a release)
- [sox](http://sox.sourceforge.net/) (install via your package manager)
- [Node.js](https://nodejs.org/) (v16+ recommended)

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/Arcmyx/linuxwavegui.git
   cd linuxwavegui
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Make sure `linuxwave` and `sox` are installed and available in your PATH.
2. Start the Electron app:
   ```sh
   npm start
   ```
3. Enter your desired BPM, key, and duration, then click **Generate**.
4. When finished, `output.wav` and `output.mid` will be generated in the project directory. Note that `output.mid` will be a little bit different from the audio. This is to be expected - I used the best tool I could find for pitch detection on `npm`. It still sounds cool, though.

## Notes

- This app only works on Linux, as linuxwave and sox are Linux-only tools.
- The GUI is not intended to be run in a web browser. Always launch with Electron, or the execution of programs will fail.
- If you encounter issues with permissions or missing dependencies, ensure all prerequisites are installed and accessible.

## License

GPLv3

---

**Author:** Arcmyx
