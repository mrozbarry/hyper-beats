import { h, app } from 'hyperapp';

import TrackConfig from './TrackConfig';
import Beat from './Beat';

import { initialState, actions } from './state';


import './styles/index.scss';

const view = (state, actions) => {
  const beats = ' '.repeat(state.beatsPerLoop).split('').map((_, idx) => idx);

  return (
    <div>
      <div class="song">
        <div class="play-controls">
          {!state.playing && <button class="button button-default text-large" onclick={() => actions.resume()}><i class="fas fa-play" /></button>}
          {state.playing && <button class="button button-default text-large" onclick={() => actions.suspend()}><i class="fas fa-pause" /></button>}
        </div>

        <div class="bpm">
          <span class="label text-small">BPM:</span>
          <input
            class="input-text"
            type="number"
            value={state.bpm}
            oninput={(e) => actions.setBpm(e.target.value)}
          />
        </div>

        <div class="time"><span class="label text-small">Time:</span> {state.currentTime.toFixed(2)}</div>
        <div class="beat"><span class="label text-small">Beat:</span> {state.currentBeat}</div>

        <div class="track-add">
          <button class="button button-default uppercase" onclick={() => actions.addTrack()}><i class="fas fa-plus margin-right-small" /> Add Track</button>
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
loop.addTrack();
