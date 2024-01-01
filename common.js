const { readFileSync } = require('fs')
const { resolve } = require('path')

// Common stuff used across examples


// Stream parameters

module.exports.sampleRate = 48000 // Hz

module.exports.channels = 1

/** A frame is a chunk consists of multiple samples (or sample frames).
 * 
 * A 40 ms frame would mean that the API will be processing chunks
 * of audio data that are 40ms long. E.g. if the sample rate is 48000
 * then a 1 ms chunk would contain 48 samples. Therefore 40 ms long
 * chunks would contain 48 * 40 = 1920 samples. The API would buffer
 * 1920 samples before propagating it to the user program.
 */
module.exports.frameSize = 40 // ms 
module.exports.bufferFrames = 48000 / 1000 * 40 // 1920

// Buffer size in bytes.
// 16-bit signed (2 bytes) * 1920 * 1 (1 channel)
module.exports.bufferSize = 2 * module.exports.bufferFrames * module.exports.channels

// RtAudio.js version
module.exports.version = JSON.parse(readFileSync(resolve(__dirname, 'node_modules', '@hamitzor', 'rtaudio.js', 'package.json'))).version