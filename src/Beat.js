import { h } from 'hyperapp';

const Beat = ({ track, beat, current, actions }) => {
  const className = ['beat']
    .concat(track.beats.indexOf(beat) >= 0 ? 'active' : [])
    .concat(current ? 'current' : [])
    .join(' ')

  return (
    <div
      class={className}
      onclick={() => actions.toggleTrackBeat({ id: track.id, beat: beat })}
    />
  );
}

export default Beat;
