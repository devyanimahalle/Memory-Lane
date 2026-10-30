
import React, { useState, useEffect } from "react";
import "./PicturePuzzle.css";

const pictures = [
  { emoji: "🌳", name: "Tree" },
  { emoji: "🌸", name: "Flower" },
  { emoji: "🦋", name: "Butterfly" },
  { emoji: "🌻", name: "Sunflower" }
];

const solvedOrder = [0, 1, 2, 3];

function shuffleTiles() {
  return [2, 0, 3, 1];
}

export default function PicturePuzzle({ onBack, onComplete }) {
  const [tiles, setTiles] = useState(shuffleTiles);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const completed = tiles.every(
    (tile, index) => tile === solvedOrder[index]
  );

  useEffect(() => {
    if (completed && onComplete) {
      onComplete();
    }
  }, [completed, onComplete]);

  const handleTileClick = (index) => {
    if (completed) return;

    if (selected === null) {
      setSelected(index);
      return;
    }

    if (selected === index) {
      setSelected(null);
      return;
    }

    const updated = [...tiles];

    [updated[selected], updated[index]] =
      [updated[index], updated[selected]];

    setTiles(updated);
    setMoves((previous) => previous + 1);
    setSelected(null);
  };

  const restartGame = () => {
    setTiles(shuffleTiles());
    setSelected(null);
    setMoves(0);
    setShowPreview(false);
  };

  return (
    <div className="pp-container">

      <button className="pp-back" onClick={onBack}>
        ← Back to Activities
      </button>

      <div className="pp-heading">
        <span className="pp-label">BRAIN GAME</span>
        <h1>Picture Puzzle 🧩</h1>
        <p>
          Put the picture pieces together.
          Take your time and enjoy!
        </p>
      </div>

      <div className="pp-info">
        <div>
          <span>YOUR MOVES</span>
          <strong>{moves}</strong>
        </div>

        <button onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <div className="pp-preview">
          {pictures.map((picture) => (
            <span key={picture.name}>{picture.emoji}</span>
          ))}
        </div>
      )}

      <div className="pp-board">
        {tiles.map((tile, index) => (
          <button
            key={index}
            className={`pp-tile ${
              selected === index ? "pp-selected" : ""
            }`}
            onClick={() => handleTileClick(index)}
            disabled={completed}
            aria-label={`Puzzle position ${index + 1}`}
          >
            <span>{pictures[tile].emoji}</span>
            <small>{pictures[tile].name}</small>
          </button>
        ))}
      </div>

      <p className="pp-instruction">
        {completed
          ? "Wonderful! You completed the picture! 🌸"
          : selected === null
          ? "Select one piece, then select another to swap them."
          : "Now select another piece to swap."}
      </p>

      {completed && (
        <div className="pp-success">
          <h2>Beautifully Done! 🎉</h2>
          <p>You completed the picture in {moves} moves.</p>
        </div>
      )}

      <button className="pp-restart" onClick={restartGame}>
        ↻ Play Again
      </button>

    </div>
  );
}
