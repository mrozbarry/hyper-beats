import { h, app } from 'hyperapp';
import uuidv4 from 'uuid/v4';

import oscillatorFactory from './oscillatorFactory';
import Beat from './Beat';

import './index.scss';

const debug = (...desc) => (arg) => {
  if (process.env.NODE_ENV === 'development') console.log(...desc, arg)
  return arg
}

const audioContext = () => (
  new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' })
)

const state = {
  tracks: [],
  activeTracks: [],
  context: audioContext(),
  sampler: audioContext(),
  syncInterval: null,
  currentTime: 0,
  currentBeat: null,
  playing: true,
  bpm: 60,
  beatsPerLoop: 16,
}

const actions = {
  initialize: () => state => ({ currentTime: state.context.currentTime }),

  setCurrentTime: currentTime => (state, actions) => {
    const beatTime = 60 / state.bpm;
    const currentBeat = Math.floor(state.context.currentTime / beatTime) % state.beatsPerLoop
    if (state.currentBeat === currentBeat) return

    state.activeTracks.forEach(t => {
      t.stop();
    });

    const activeTracks = state.tracks
      .filter(t => t.beats.indexOf(currentBeat) >= 0)
      .map(t => {
        const source = t.factory()
        source.start(0);
        source.stop(state.context.currentTime + beatTime);

        return source;
      })

    return {
      currentTime: currentTime,
      currentBeat: currentBeat,
      activeTracks: activeTracks,
    }
  },

  resume: () => (state, actions) => {
    state.context.resume();

    if (state.syncInterval) clearInterval(state.syncInterval)
    const syncInterval = setInterval(() => {
      actions.setCurrentTime(state.context.currentTime)
    }, 1)

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

  sampleTrack: freq => state => {
    const src = oscillatorFactory('demo', state.sampler)(freq)()
    src.start(0);
    src.stop(state.sampler.currentTime + 0.1);
  },

};

const view = (state, actions) => {
  const beats = ' '.repeat(state.beatsPerLoop).split('').map((_, idx) => idx);
  console.log(beats)

  return (
    <div>
      <div>
        {!state.playing && <button onclick={() => actions.resume()}>|&gt;</button>}
        {state.playing && <button onclick={() => actions.suspend()}>||</button>}
      </div>

      <div>
        BPM:
        <input
          type="number"
          value={state.bpm}
          oninput={(e) => actions.setBpm(e.target.value)}
        />
      </div>

      <div>Time: {state.currentTime}</div>
      <div>Beat: {state.currentBeat}</div>

      <div class="tracks">
        {state.tracks.map(track => (
          <div key={track.id} class="track">
            <div class="track-config">
              <input
                type="range"
                min={27.5}
                max={4186.01}
                step="0.1"
                value={track.frequency}
                oninput={e => actions.modifyTrack({ id: track.id, freq: Number(e.target.value) })}
              />
              {track.frequency}
            </div>
            <div class="beats">
              {beats.map(beat => (
                <Beat key={beat} track={track} beat={beat} current={beat === state.currentBeat} actions={actions} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onclick={() => actions.addTrack()}>Add Track</button>
    </div>
  );
}

const loop = app(state, actions, view, document.getElementById('root'));

loop.initialize();
loop.suspend();
