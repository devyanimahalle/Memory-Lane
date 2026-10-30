
import React, { useState } from "react";
import "./FindDifference.css";

const differences = [
  { x: 25, y: 30, label: "Flower" },
  { x: 70, y: 65, label: "Bird" }
];

export default function FindDifference() {
  const [found, setFound] = useState([]);
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    differences.forEach((item, index) => {
      const alreadyFound = found.includes(index);
      const close =
        Math.abs(x - item.x) < 8 &&
        Math.abs(y - item.y) < 8;

      if (close && !alreadyFound) {
        const updated = [...found, index];
        setFound(updated);
        setMessage(
          updated.length === differences.length
            ? "Wonderful! You found all the differences!"
            : "Great job! You found one!"
        );
      }
    });
  };

  return (
    <div className="difference-game">
      <button onClick={() => window.history.back()}>
        ← Back
      </button>

      <h1>Find the Difference 🌸</h1>
      <p>Look carefully at the picture and find what is different.</p>

      <div className="difference-images">
        <div
          className="scene"
          onClick={handleImageClick}
        >
          <div className="garden">
            🌳 🌷 🌻 🦋 🌼 🌳
            <br /><br />
            🏡 🌸 🌿 🐦 🌺 🌿
            <br /><br />
            🌱 🌻 🌷 🌱 🌼 🌱
          </div>
        </div>

        <div className="scene">
          <div className="garden">
            🌳 🌷 🌻 🦋 🌼 🌳
            <br /><br />
            🏡 🌸 🌿 🐦 🌺 🌿
            <br /><br />
            🌱 🌻 🌷 🌱 🌼 🌱
          </div>
        </div>
      </div>

      <h3>Differences found: {found.length}/2</h3>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${found.length * 50}%` }}
        />
      </div>

      <button onClick={() => setHint(true)}>
        💡 Show Hint
      </button>

      {hint && <p>Look carefully at the flowers and birds!</p>}

      <p>{message}</p>

      <button onClick={() => {
        setFound([]);
        setHint(false);
        setMessage("");
      }}>
        Play Again
      </button>
    </div>
  );
}
