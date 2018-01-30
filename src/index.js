import { h, app } from 'hyperapp';

import TrackConfig from './TrackConfig';
import Beat from './Beat';

import { initialState, actions } from './state';


import './index.scss';

const view = (state, actions) => {
  const beats = ' '.repeat(state.beatsPerLoop).split('').map((_, idx) => idx);

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

      <button onclick={() => actions.addTrack()}>Add Track</button>

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
loop.addTrack();
