import React, { useState } from "react";
import "./FindDifference.css";
import { playGentleChime, playCelebrationChime } from "../../soundEffects";

// Authentic printable Spot the Difference game puzzles sourced from Google (World of Printables)
const SCENES = [
  {
    id: "woodland",
    title: "Enchanted Woodland Journey",
    subtitle: "Matched to your reference puzzle",
    instruction: "There are eight differences in the images below. Can you spot them all and win the game?",
    imageA: "/images/find-difference/woodland_a.png",
    imageB: "/images/find-difference/woodland_b.png",
    differences: [
      { id: "fox", x: 21, y: 8, label: "Orange Fox in Tree Canopy", hint: "Look high in the leafy tree branches on the upper left." },
      { id: "bear", x: 96, y: 12, label: "White Bear on Tree Branch", hint: "Look high in the tree branches on the upper right." },
      { id: "daisy_right", x: 92, y: 86, label: "Daisy Flower in the Bush", hint: "Look down at the blooming flowers on the bottom right." },
      { id: "bird_wing", x: 63, y: 29, label: "Flying Bird in the Trees", hint: "Look at the bird flying between the trees on the upper right." },
      { id: "hooded_boy", x: 62, y: 58, label: "Boy's Cloak & Wand", hint: "Look at the child in the purple hood walking near the center." },
      { id: "daisy_left", x: 25, y: 98, label: "Daisy in the Grass", hint: "Look down in the grass at the very bottom left." },
      { id: "butterfly", x: 57, y: 52, label: "Butterfly above Pathway", hint: "Look near the center pathway above the children." },
      { id: "paper", x: 45, y: 85, label: "Paper in Boy's Hands", hint: "Look at the paper held by the boy in the foreground." }
    ]
  },
  {
    id: "cute_animals",
    title: "Meadow Animals Gathering",
    subtitle: "Authentic World of Printables Puzzle",
    instruction: "There are eight natural differences in the meadow below. Can you discover them all?",
    imageA: "/images/find-difference/cute_animals_a.jpg",
    imageB: "/images/find-difference/cute_animals_b.jpg",
    differences: [
      { id: "c1", x: 26, y: 21, label: "Animal in Tree Branch", hint: "Look in the leafy tree branches on the upper left." },
      { id: "c2", x: 70, y: 83, label: "Flower in Meadow Grass", hint: "Look near the meadow flowers on the bottom right." },
      { id: "c3", x: 53, y: 7, label: "Bird in Top Clouds", hint: "Look up in the sky near the top center." },
      { id: "c4", x: 70, y: 23, label: "Friendly Bird on Right", hint: "Look high in the branches on the upper right." },
      { id: "c5", x: 28, y: 93, label: "Pebble in Meadow Path", hint: "Look at the ground in the lower left area." },
      { id: "c6", x: 90, y: 86, label: "Meadow Grass Bloom", hint: "Look closely at the greenery in the bottom right corner." },
      { id: "c7", x: 6, y: 90, label: "Daisy in Bottom Left", hint: "Look at the flowers in the far bottom left corner." },
      { id: "c8", x: 66, y: 96, label: "Little Snail on Ground", hint: "Look down along the bottom edge near the center-right." }
    ]
  },
  {
    id: "tree_animals",
    title: "Under the Gentle Tree",
    subtitle: "Authentic World of Printables Puzzle",
    instruction: "Enjoy the peaceful animals under the shady tree. Discover the 6 subtle details.",
    imageA: "/images/find-difference/tree_animals_a.jpg",
    imageB: "/images/find-difference/tree_animals_b.jpg",
    differences: [
      { id: "t1", x: 31, y: 86, label: "Grass Petal on Left", hint: "Look at the grass along the lower left path." },
      { id: "t2", x: 88, y: 69, label: "Bush Leaf on Right", hint: "Look at the green bushes on the right side." },
      { id: "t3", x: 81, y: 12, label: "Tree Canopy Leaves", hint: "Look up in the tree branches on the top right." },
      { id: "t4", x: 9, y: 74, label: "Flower on Far Left", hint: "Look at the flowers along the left edge." },
      { id: "t5", x: 62, y: 81, label: "Animal Footprint in Sand", hint: "Look in the warm sand in the lower right area." },
      { id: "t6", x: 13, y: 54, label: "Hanging Vine Tendril", hint: "Look at the hanging vines on the middle left." }
    ]
  },
  {
    id: "summer",
    title: "Sunny Summer Adventure",
    subtitle: "Authentic World of Printables Puzzle",
    instruction: "Explore the warm summer scene. Spot the 6 natural differences in the picture on the right.",
    imageA: "/images/find-difference/summer_a.jpg",
    imageB: "/images/find-difference/summer_b.jpg",
    differences: [
      { id: "s1", x: 36, y: 7, label: "Sun Cloud in Sky", hint: "Look up in the bright blue sky on the left." },
      { id: "s2", x: 84, y: 17, label: "Flying Bird by Sun", hint: "Look at the sky in the upper right corner." },
      { id: "s3", x: 8, y: 38, label: "Tree Fruit Blossom", hint: "Look along the tree branches on the far left." },
      { id: "s4", x: 53, y: 65, label: "Beach Toy on Sand", hint: "Look near the center foreground in the sand." },
      { id: "s5", x: 90, y: 90, label: "Starfish in the Sand", hint: "Look at the sand in the far lower right corner." },
      { id: "s6", x: 71, y: 81, label: "Shoreline Sea Shell", hint: "Look down by the edge of the water on the right." }
    ]
  },
  {
    id: "camping",
    title: "Forest Camping Retreat",
    subtitle: "Authentic World of Printables Puzzle",
    instruction: "Relax by the tranquil forest campsite. Can you spot all 5 peaceful details?",
    imageA: "/images/find-difference/camping_a.jpg",
    imageB: "/images/find-difference/camping_b.jpg",
    differences: [
      { id: "cp1", x: 8, y: 37, label: "Pine Tree Canopy", hint: "Look in the tall pine branches on the middle left." },
      { id: "cp2", x: 14, y: 34, label: "Campfire Smoke Spark", hint: "Look above the campfire on the left." },
      { id: "cp3", x: 11, y: 86, label: "Campsite Tent Peg", hint: "Look near the base of the tent in the lower left." },
      { id: "cp4", x: 78, y: 34, label: "Mountain Peak Cloud", hint: "Look across the distant mountain ridge on the right." },
      { id: "cp5", x: 74, y: 83, label: "Forest Wildflower", hint: "Look along the campsite path on the lower right." }
    ]
  }
];

export default function FindDifference({ onBack, onComplete }) {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [found, setFound] = useState([]);
  const [hintActive, setHintActive] = useState(false);
  const [message, setMessage] = useState("");

  const currentScene = SCENES[activeSceneIdx];

  const handleImageClick = (e) => {
    if (found.length === currentScene.differences.length) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Dementia-friendly generous click radius (13% tolerance)
    let newlyFoundItem = null;

    currentScene.differences.forEach((item, index) => {
      const alreadyFound = found.includes(index);
      const distance = Math.hypot(x - item.x, y - item.y);

      if (distance < 13 && !alreadyFound) {
        newlyFoundItem = { index, item };
      }
    });

    if (newlyFoundItem) {
      const updated = [...found, newlyFoundItem.index];
      setFound(updated);
      setHintActive(false);

      if (updated.length === currentScene.differences.length) {
        playCelebrationChime();
        setMessage(`Wonderful! You found all ${currentScene.differences.length} differences in ${currentScene.title}!`);
        if (typeof onComplete === "function") {
          onComplete();
        }
      } else {
        playGentleChime();
        setMessage(`Great observation! You found: ${newlyFoundItem.item.label}!`);
      }
    }
  };

  const handleSelectScene = (idx) => {
    setActiveSceneIdx(idx);
    setFound([]);
    setHintActive(false);
    setMessage("");
  };

  const isComplete = found.length === currentScene.differences.length;

  const currentHint = () => {
    const unfound = currentScene.differences.find((_, i) => !found.includes(i));
    return unfound ? unfound.hint : "You found them all! Splendid!";
  };

  return (
    <div className="difference-game" role="region" aria-label="Spot the Difference Game">
      {onBack && (
        <button className="fd-back-btn" onClick={onBack}>
          ← Back to Activities
        </button>
      )}

      {/* Styled header matching the reference printable game */}
      <div className="fd-printable-banner">
        <span className="fd-pill">OBSERVATION GAME</span>
        <h1>Spot The Difference Game</h1>
        <p className="fd-instruction">{currentScene.instruction}</p>
      </div>

      {/* Scene Switcher */}
      <div className="fd-scene-tabs">
        {SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            className={`fd-scene-tab ${activeSceneIdx === idx ? "active" : ""}`}
            onClick={() => handleSelectScene(idx)}
          >
            {scene.title}
          </button>
        ))}
      </div>

      {/* Side-by-Side Landscape Panels */}
      <div className="difference-images">
        {/* Panel 1 (Original) */}
        <div className="photo-panel">
          <div className="photo-label">Original Image</div>
          <div className="photo-container" onClick={handleImageClick}>
            <img
              src={currentScene.imageA}
              alt="Original scene"
              className="photo-img"
              loading="lazy"
            />
            {/* Found Markers on Photo A */}
            {found.map((diffIdx) => {
              const item = currentScene.differences[diffIdx];
              return (
                <div
                  key={`found-a-${item.id}`}
                  className="found-marker"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  <span className="marker-ring" />
                  <span className="marker-tag">✓ {item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2 (With Natural Differences) */}
        <div className="photo-panel">
          <div className="photo-label highlight">Spot Differences Here</div>
          <div className="photo-container" onClick={handleImageClick}>
            <img
              src={currentScene.imageB}
              alt="Scene with natural differences"
              className="photo-img"
              loading="lazy"
            />

            {/* Hint pulses */}
            {hintActive &&
              currentScene.differences.map((diff, index) => {
                if (found.includes(index)) return null;
                return (
                  <div
                    key={`hint-${diff.id}`}
                    className="hint-spot"
                    style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                  >
                    <span className="hint-pulse" />
                  </div>
                );
              })}

            {/* Found Markers on Photo B */}
            {found.map((diffIdx) => {
              const item = currentScene.differences[diffIdx];
              return (
                <div
                  key={`found-b-${item.id}`}
                  className="found-marker"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  <span className="marker-ring" />
                  <span className="marker-tag">✓ {item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress & Feedback Bar */}
      <div className="fd-status-box">
        <div className="fd-count">
          Differences Found: <strong>{found.length}</strong> / {currentScene.differences.length}
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${(found.length / currentScene.differences.length) * 100}%`
            }}
          />
        </div>

        {message && <div className="fd-message-banner">{message}</div>}

        {hintActive && (
          <div className="fd-hint-banner">
            <strong>Gentle Hint:</strong> {currentHint()}
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="fd-actions">
        {!isComplete && (
          <button
            className="fd-hint-btn"
            onClick={() => setHintActive(!hintActive)}
          >
            {hintActive ? "Hide Hint" : "Show Gentle Hint"}
          </button>
        )}

        <button
          className="fd-reset-btn"
          onClick={() => {
            setFound([]);
            setHintActive(false);
            setMessage("");
          }}
        >
          Play Scene Again
        </button>

        {isComplete && activeSceneIdx < SCENES.length - 1 && (
          <button
            className="fd-next-btn"
            onClick={() => handleSelectScene(activeSceneIdx + 1)}
          >
            Next Beautiful Scene →
          </button>
        )}
      </div>

      {/* Footer attribution matching the reference style */}
      <div className="fd-footer-note">
        <span>Authentic Spot the Difference activities from Google &amp; World of Printables</span>
      </div>
    </div>
  );
}
