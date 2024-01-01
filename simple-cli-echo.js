'use strict'

// Echo app. It streams the audio from default input device directly
// to default output device.

// Usage: node simple-cli-echo.js

// Note: this script expects that there are default output and input device that
// support 16-bit 48000 Hz playback. If that's not the case, you'll need to
// change `sampleRate` and `RtAudioFormat.RTAUDIO_SINT16` below.

const { RtAudio, RtAudioFormat, RtAudioErrorType, RtAudioStreamStatus } = require('@hamitzor/rtaudio.js')
const consoleClear = require('console-clear')
const { bufferFrames, channels, frameSize, sampleRate, version } = require('./common')

const apis = RtAudio.getCompiledApi()

if (apis.length < 1) {
  console.error("No available API found")
  process.exit(1)
}

const api = apis[0] // Use the first api available.

// Create the RtAudio instance
const rtAudio = new RtAudio(api)

// Get default devices
const defaultInputDevice = rtAudio.getDefaultInputDevice(api.id)
const defaultOutputDevice = rtAudio.getDefaultOutputDevice(api.id)

if (!defaultOutputDevice || !defaultInputDevice) {
  console.error(`No default ${!defaultOutputDevice ? 'output' : 'input'} device found.`)
  process.exit(1)
}

// Attach error handler
rtAudio.setErrorCallback((type, message) => {
  switch (type) {
    case RtAudioErrorType.WARNING: return console.warn('WARNING:', message)
    case RtAudioErrorType.DEBUG_WARNING: return console.warn('DEBUG_WARNING:', message)
    case RtAudioErrorType.DRIVER_ERROR: return console.error('DRIVER_ERROR:', message)
    case RtAudioErrorType.INVALID_DEVICE: return console.error('INVALID_DEVICE:', message)
    case RtAudioErrorType.INVALID_PARAMETER: return console.error('INVALID_PARAMETER:', message)
    case RtAudioErrorType.INVALID_USE: return console.error('INVALID_USE:', message)
    case RtAudioErrorType.MEMORY_ERROR: return console.error('MEMORY_ERROR:', message)
    case RtAudioErrorType.NO_DEVICES_FOUND: return console.error('NO_DEVICES_FOUND:', message)
    case RtAudioErrorType.SYSTEM_ERROR: return console.error('SYSTEM_ERROR:', message)
    case RtAudioErrorType.THREAD_ERROR: return console.error('THREAD_ERROR:', message)
    case RtAudioErrorType.UNSPECIFIED: return console.error('UNSPECIFIED:', message)
  }
})

// Open the stream
rtAudio.openStream(
  { deviceId: defaultOutputDevice, nChannels: channels },
  { deviceId: defaultInputDevice, nChannels: channels },
  RtAudioFormat.RTAUDIO_SINT16,
  sampleRate,
  bufferFrames,
  null,
  (output, input, _nFrames, _time, status) => {
    // Write input directly to the output buffer, for echoing.
    output.set(input, 0)

    if (status === RtAudioStreamStatus.RTAUDIO_INPUT_OVERFLOW) {
      console.warn('Input data was discarded because of an overflow condition at the driver.')
    }

    if (status === RtAudioStreamStatus.RTAUDIO_OUTPUT_UNDERFLOW) {
      console.warn('The output buffer ran low, likely producing a break in the output sound.')
    }
  }
)

// Start the stream
rtAudio.startStream()

// On SIGINT, close the stream and exit
process.on('SIGINT', () => {
  rtAudio.closeStream()
  process.exit()
})

// Extra: print some info and statistics

consoleClear()
console.log(`Echo app\n`)
console.log(`RtAudio.js version\t${version}`)
console.log(`RTAudio version\t\t${RtAudio.getVersion()}\n`)
console.log(`Output device\t\t${rtAudio.getDevices().find(dev => dev.id === defaultOutputDevice).name}`)
console.log(`Input device\t\t${rtAudio.getDevices().find(dev => dev.id === defaultInputDevice).name}`)
console.log(`Native API name\t\t${RtAudio.getApiDisplayName(api)}`)
console.log(`Sample rate\t\t${sampleRate} Hz`)
console.log(`Frame size\t\t${frameSize}ms\n`)
console.log(`Echoing audio... (Ctrl+C to exit)\n`)
