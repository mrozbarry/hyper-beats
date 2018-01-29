import { h } from 'hyperapp';

const TrackConfig = ({ track, actions }) => (
  <div class="track-config">
    <div>
      <a
        href="#"
        onclick={(e) => {
          e.preventDefault();
          actions.removeTrack(track.id);
        }}
      >
        &times;
      </a>&nbsp;
    </div>
    <div>
      <div>Oscillator</div>
      <div>{track.frequency}</div>
    </div>
    <input
      class="track-config-oscillator-frequency"
      type="range"
      min={27.5}
      max={4186.01}
      step="0.1"
      value={track.frequency}
      oninput={e => actions.modifyTrack({ id: track.id, freq: Number(e.target.value) })}
    />
  </div>
);

export default TrackConfig;
