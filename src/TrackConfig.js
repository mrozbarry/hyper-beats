import { h } from 'hyperapp';

const TrackConfig = ({ track, actions }) => (
  <div class="track-config">
    <div class="info">
      <div class="track-title">
        <div class="label text-smaller">Track Title</div>
        <div class="title">Oscillator</div>
      </div>
      <a
        class="remove"
        href="#"
        onclick={(e) => {
          e.preventDefault();
          actions.removeTrack(track.id);
        }}
      >
        <i class="fas fa-times"></i>
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
