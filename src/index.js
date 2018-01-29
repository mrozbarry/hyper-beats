import { h, app } from 'hyperapp';

import TrackConfig from './TrackConfig';
import Beat from './Beat';

import { initialState, actions } from './state';


import './index.scss';

const view = (state, actions) => {
  const beats = ' '.repeat(state.beatsPerLoop).split('').map((_, idx) => idx);

  return (
    <div>
      <div class="song">
        <div class="play-controls">
          {!state.playing && <button onclick={() => actions.resume()}>|&gt;</button>}
          {state.playing && <button onclick={() => actions.suspend()}>||</button>}
        </div>

        <div class="bpm">
          <span class="label">BPM:</span>
          <input
            type="number"
            value={state.bpm}
            oninput={(e) => actions.setBpm(e.target.value)}
          />
        </div>

        <div class="time"><span class="label">Time:</span> {state.currentTime}</div>
        <div class="beat"><span class="label">Beat:</span> {state.currentBeat}</div>

        <div class="track-add">
          <button onclick={() => actions.addTrack()}>Add Track</button>
        </div>
      </div>

      <div class="tracks">
        {state.tracks.map(track => (
          <div key={track.id} class="track">
            <TrackConfig
              track={track}
              actions={actions}
            />
            <div class="beats">
              {beats.map(beat => (
                <Beat key={beat} track={track} beat={beat} current={beat === state.currentBeat} actions={actions} />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const loop = app(initialState, actions, view, document.getElementById('root'));
loop.suspend();
