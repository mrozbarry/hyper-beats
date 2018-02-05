import uuidv4 from 'uuid/v4';

import oscillatorFactory from './oscillatorFactory';

const newAudioContext = () => (
  new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' })
)

const debug = (...desc) => (arg) => {
  if (process.env.NODE_ENV === 'development') console.log(...desc, arg)
  return arg
}

const pipe = (value) => (...steps) => {
  return steps.reduce((memo, fn) => fn(memo), value)
}

export const initialState = {
  tracks: [],
  activeTracks: [],
  context: newAudioContext(),
  sampler: newAudioContext(),
  syncInterval: null,
  currentTimeOffset: 0,
  currentTime: 0,
  currentBeat: null,
  playing: true,
  bpm: 480,
  beatsPerLoop: 16,
}

const getActiveTracksForBeat = ({ currentTime, tracks, beat, beatTime }) => (
  tracks
    .filter(t => t.beats.indexOf(beat) >= 0)
    .map(t => {
      const source = t.factory();
      source.start(0);
      source.stop(currentTime + beatTime);

      return source;
    })
);

export const actions = {
  setCurrentTime: () => (state, actions) => {
    const beatTime = 60 / state.bpm;
    const now = state.context.currentTime - state.currentTimeOffset;
    const currentBeat = Math.floor(now / beatTime) % state.beatsPerLoop

    if (state.currentBeat === currentBeat) return
    state.activeTracks.forEach(t => t.stop());

    return {
      currentTime: state.context.currentTime,
      currentBeat: currentBeat,
      activeTracks: getActiveTracksForBeat({
        currentTime: state.context.currentTime,
        tracks: state.tracks,
        beat: currentBeat,
        beatTime: beatTime,
      }),
    }
  },

  resume: () => (state, actions) => {
    state.context.resume();

    if (state.syncInterval) clearInterval(state.syncInterval)
    const syncInterval = setInterval(actions.setCurrentTime, 10)

    return {
      syncInterval: syncInterval,
      currentTime: state.context.currentTime,
      playing: true,
    }
  },

  suspend: () => state => {
    state.context.suspend();
    clearInterval(state.syncInterval);
    return {
      syncInterval: null,
      currentTime: state.context.currentTime,
      playing: false,
    }
  },

  setBpm: bpm => state => ({ bpm: Number(bpm) }),

  addTrack: () => state => {
    const id = uuidv4();
    const defaultFreq = 260;

    return {
      tracks: state.tracks.concat({
        id: id,
        factory: oscillatorFactory(id, state.context)(defaultFreq),
        frequency: defaultFreq,
        beats: [0],
      })
    }
  },

  modifyTrack: ({ id, freq }) => (state, actions) => {
    actions.sampleTrack(freq);

    return {
      tracks: state.tracks.map(track => {
        if (track.id === id) {
          return Object.assign({}, track, {
            factory: oscillatorFactory(id, state.context)(freq),
            frequency: freq
          });
        }

        return track
      }),
      activeTracks: state.activeTracks.map(track => {
        if (track._id === id) {
          track.frequency.setValueAtTime(freq, 0);
        }
        return track
      })
    }
  },

  toggleTrackBeat: ({ id, beat }) => state => debug('toggleTrackBeat')({
    tracks: state.tracks.map(track => {
      if (track.id === id) {
        const beats = track.beats.indexOf(beat) >= 0
          ? track.beats.filter(b => b !== beat)
          : track.beats.concat(beat)

        return Object.assign({}, track, {
          beats: beats,
        });
      }
      return track;
    })
  }),

  removeTrack: id => state => debug('removeTrack')({
    tracks: state.tracks.filter(t => t.id !== id),
    activeTracks: state.activeTracks.reduce((tracks, source) => {
      if (source._id === id) {
        source.stop();
        return tracks;
      }
      return tracks.concat(source);
    }, []),
  }),

  sampleTrack: freq => state => {
    const src = oscillatorFactory('demo', state.sampler)(freq)()
    src.start(0);
    src.stop(state.sampler.currentTime + 0.1);
  },

};
