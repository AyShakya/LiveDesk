import { useMemo, useState } from 'react';

const moods = ['Focused', 'Creative', 'Chaotic', 'Zen', 'Curious'];
const facts = [
  'Bananas are berries, but strawberries are not.',
  'Octopuses have three hearts.',
  'A day on Venus is longer than its year.',
  'Honey never spoils.',
  'Sharks are older than trees.'
];

export default function App() {
  const [count, setCount] = useState(0);
  const [mood, setMood] = useState(moods[0]);
  const [fact, setFact] = useState(facts[0]);

  const vibeColor = useMemo(() => {
    const colors = ['#7c3aed', '#0ea5e9', '#16a34a', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, [mood, fact]);

  const randomize = () => {
    setMood(moods[Math.floor(Math.random() * moods.length)]);
    setFact(facts[Math.floor(Math.random() * facts.length)]);
    setCount((value) => value + 1);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>LiveDesk 🎲</h1>
      <p style={{ marginTop: 0, color: '#6b7280' }}>Random stuff mode activated.</p>

      <div
        style={{
          border: `2px solid ${vibeColor}`,
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          background: '#fafafa'
        }}
      >
        <p><strong>Current mood:</strong> {mood}</p>
        <p><strong>Random fact:</strong> {fact}</p>
        <p><strong>Shuffle count:</strong> {count}</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={randomize}>Shuffle</button>
        <button onClick={() => setCount(0)}>Reset Counter</button>
      </div>
    </div>
  );
}