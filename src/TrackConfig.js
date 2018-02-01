import { h } from 'hyperapp';

const TrackConfig = ({ track, actions }) => (
  <div class="track-config">
    <div class="info">
      <div class="title">Oscillator</div>
      <a
        class="remove"
        href="#"
        onclick={(e) => {
          e.preventDefault();
          actions.removeTrack(track.id);
        }}
      >
        &times;
      </a>
    </div>
    <div class="frequency">
      <div class="frequency-readout">{track.frequency}</div>
      <input
        class="frequency-slider"
        type="range"
        min={27.5}
        max={4186.01}
        step="0.1"
        value={track.frequency}
        oninput={e => actions.modifyTrack({ id: track.id, freq: Number(e.target.value) })}
      />
    </div>
  </div>
);

export default TrackConfig;
