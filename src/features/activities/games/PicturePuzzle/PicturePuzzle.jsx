import React, { useState, useEffect } from "react";
import "./PicturePuzzle.css";
import { playGentleChime, playCelebrationChime } from "../../soundEffects";

// High-resolution realistic photography scenes for Picture Puzzle
const PUZZLES = [
  {
    id: "puppy",
    title: "Golden Retriever Puppy",
    description: "A joyful golden retriever resting in the green grass.",
    image: "/images/puzzle/puppy.jpg"
  },
  {
    id: "garden",
    title: "Blooming Cottage Garden",
    description: "Sunlit garden pathway surrounded by vibrant summer flowers.",
    image: "/images/puzzle/garden.jpg"
  },
  {
    id: "lake",
    title: "Serene Lakeside Sunrise",
    description: "Quiet morning reflections across mist-kissed mountain waters.",
    image: "/images/puzzle/lake.jpg"
  },
  {
    id: "tea",
    title: "Warm Afternoon Tea",
    description: "A cozy porcelain cup with soothing chamomile and gentle light.",
    image: "/images/puzzle/tea.jpg"
  },
  {
    id: "cat",
    title: "Sleeping Tabby Cat",
    description: "A peaceful sleeping kitten curled up comfortably.",
    image: "/images/puzzle/cat.jpg"
  }
];

const GRID_OPTIONS = [
  { id: "4", label: "4 Pieces (2 × 2)", cols: 2, rows: 2, difficulty: "Gentle" },
  { id: "6", label: "6 Pieces (3 × 2)", cols: 3, rows: 2, difficulty: "Relaxed" },
  { id: "9", label: "9 Pieces (3 × 3)", cols: 3, rows: 3, difficulty: "Standard" },
  { id: "12", label: "12 Pieces (4 × 3)", cols: 4, rows: 3, difficulty: "Challenge" }
];

function generateSolvedOrder(count) {
  return Array.from({ length: count }, (_, i) => i);
}

function shuffleTiles(count) {
  const arr = generateSolvedOrder(count);
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not accidentally solved at start
  if (arr.every((val, idx) => val === idx)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export default function PicturePuzzle({ onBack, onComplete }) {
  const [activePuzzleIdx, setActivePuzzleIdx] = useState(0);
  const [selectedGrid, setSelectedGrid] = useState(GRID_OPTIONS[0]); // Default 4 pieces (2x2)
  const [tiles, setTiles] = useState(() => shuffleTiles(GRID_OPTIONS[0].cols * GRID_OPTIONS[0].rows));
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const currentPuzzle = PUZZLES[activePuzzleIdx];
  const totalPieces = selectedGrid.cols * selectedGrid.rows;

  const completed = tiles.length === totalPieces && tiles.every((tile, index) => tile === index);
  const correctCount = tiles.filter((tile, index) => tile === index).length;

  useEffect(() => {
    if (completed && onComplete) {
      playCelebrationChime();
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

    // Swap the two selected tiles
    const updated = [...tiles];
    [updated[selected], updated[index]] = [updated[index], updated[selected]];

    setTiles(updated);
    setMoves((prev) => prev + 1);
    setSelected(null);
    playGentleChime();
  };

  const handleSelectPuzzle = (idx) => {
    setActivePuzzleIdx(idx);
    setTiles(shuffleTiles(selectedGrid.cols * selectedGrid.rows));
    setSelected(null);
    setMoves(0);
    setShowPreview(false);
  };

  const handleGridOptionChange = (newGrid) => {
    setSelectedGrid(newGrid);
    setTiles(shuffleTiles(newGrid.cols * newGrid.rows));
    setSelected(null);
    setMoves(0);
    setShowPreview(false);
  };

  const restartGame = () => {
    setTiles(shuffleTiles(selectedGrid.cols * selectedGrid.rows));
    setSelected(null);
    setMoves(0);
    setShowPreview(false);
  };

  return (
    <div className="pp-container" role="region" aria-label="Picture Puzzle Game">
      {onBack && (
        <button className="pp-back" onClick={onBack} type="button">
          ← Back to Activities
        </button>
      )}

      <div className="pp-heading">
        <span className="pp-label">COGNITIVE CARE</span>
        <h1>Picture Puzzle</h1>
        <p>
          Put the photograph pieces together. Tap two pieces to swap their positions.
        </p>
      </div>

      {/* Photo Selector Tabs */}
      <div className="pp-control-group">
        <span className="pp-control-title">Choose Photograph:</span>
        <div className="pp-puzzle-tabs">
          {PUZZLES.map((puzzle, idx) => (
            <button
              key={puzzle.id}
              className={`pp-puzzle-tab ${activePuzzleIdx === idx ? "active" : ""}`}
              onClick={() => handleSelectPuzzle(idx)}
              type="button"
            >
              {puzzle.title}
            </button>
          ))}
        </div>
      </div>

      {/* Pieces Count / Difficulty Selector */}
      <div className="pp-control-group">
        <span className="pp-control-title">Number of Pieces:</span>
        <div className="pp-grid-tabs">
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`pp-grid-tab ${selectedGrid.id === opt.id ? "active" : ""}`}
              onClick={() => handleGridOptionChange(opt)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Bar */}
      <div className="pp-info">
        <div className="pp-stat">
          <span>YOUR MOVES</span>
          <strong>{moves}</strong>
        </div>

        <div className="pp-stat">
          <span>PLACED CORRECTLY</span>
          <strong>{correctCount} / {totalPieces}</strong>
        </div>

        <button
          className="pp-preview-btn"
          onClick={() => setShowPreview(!showPreview)}
          type="button"
        >
          {showPreview ? "Hide Reference" : "Show Full Photo"}
        </button>
      </div>

      {/* Full Photo Reference Preview */}
      {showPreview && (
        <div className="pp-preview-card">
          <img
            src={currentPuzzle.image}
            alt={currentPuzzle.title}
            className="pp-preview-img"
          />
          <p className="pp-preview-caption">Reference: {currentPuzzle.title}</p>
        </div>
      )}

      {/* Landscape Puzzle Board */}
      <div
        className={`pp-board ${completed ? "completed" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${selectedGrid.rows}, 1fr)`
        }}
      >
        {tiles.map((pieceVal, slotIndex) => {
          // Calculate slice coordinates for current cols x rows
          const col = pieceVal % selectedGrid.cols;
          const row = Math.floor(pieceVal / selectedGrid.cols);
          const posX = selectedGrid.cols > 1 ? (col / (selectedGrid.cols - 1)) * 100 : 0;
          const posY = selectedGrid.rows > 1 ? (row / (selectedGrid.rows - 1)) * 100 : 0;

          const isSelected = selected === slotIndex;
          const isCorrect = pieceVal === slotIndex;

          return (
            <button
              key={`slot-${slotIndex}`}
              className={`pp-tile ${isSelected ? "pp-selected" : ""} ${
                completed ? "pp-solved" : ""
              } ${isCorrect && !completed ? "pp-correct-pos" : ""}`}
              onClick={() => handleTileClick(slotIndex)}
              style={{
                backgroundImage: `url(${currentPuzzle.image})`,
                backgroundPosition: `${posX}% ${posY}%`,
                backgroundSize: `${selectedGrid.cols * 100}% ${selectedGrid.rows * 100}%`
              }}
              aria-label={`Puzzle piece in slot ${slotIndex + 1}`}
              type="button"
            >
              {!completed && (
                <span className="pp-tile-number">{slotIndex + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      {completed && (
        <div className="pp-success">
          <h2>Wonderful! You completed the picture!</h2>
          <p>The photograph of {currentPuzzle.title} ({selectedGrid.label}) is now beautifully assembled.</p>
          <div className="pp-success-actions">
            <button className="pp-restart" onClick={restartGame} type="button">
              Play Again
            </button>
            {activePuzzleIdx < PUZZLES.length - 1 && (
              <button
                className="pp-next-btn"
                onClick={() => handleSelectPuzzle(activePuzzleIdx + 1)}
                type="button"
              >
                Next Photo Puzzle →
              </button>
            )}
          </div>
        </div>
      )}

      <p className="pp-instruction">
        {completed
          ? "All pieces are in the right place. Well done!"
          : selected !== null
          ? "Now tap another piece to swap them."
          : "Tap any piece to select it, then tap another piece to swap."}
      </p>
    </div>
  );
}
