export default (id, context) => (freq) => () => {
  const source = context.createOscillator();
  source.type = 'triangle';
  source.frequency.setValueAtTime(freq, 0);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.2, 0);
  source.connect(gain);
  gain.connect(context.destination);

  source.addEventListener('ended', () => {
    source.disconnect(gain);
    gain.disconnect(context.destination);
  }, false);

  source._id = id;

  return source;
}
