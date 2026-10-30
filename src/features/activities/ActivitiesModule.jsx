import React, { useState, useEffect, useRef } from "react";
import { matchingItems } from "./activityData";
import FindDifference from "./games/FindDifference/FindDifference";
import PicturePuzzle from "./games/PicturePuzzle/PicturePuzzle";
import { playCardFlip, playGentleChime, playCelebrationChime } from "./soundEffects";
import "./activities.css";

const createEventId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const CARD_DIFFICULTY_OPTIONS = [
  { id: "4", label: "4 Cards (2 Pairs)", pairs: 2, cols: 2, maxGridWidth: 380 },
  { id: "8", label: "8 Cards (4 Pairs)", pairs: 4, cols: 4, maxGridWidth: 640 },
  { id: "12", label: "12 Cards (6 Pairs)", pairs: 6, cols: 4, maxGridWidth: 760 },
  { id: "16", label: "16 Cards (8 Pairs)", pairs: 8, cols: 4, maxGridWidth: 840 }
];

export default function ActivitiesModule({ onEngagement }) {
  const [screen, setScreen] = useState("home"); // "home", "matching", "findDifference", "picturePuzzle"

  // Matching game difficulty & card count
  const [selectedDifficulty, setSelectedDifficulty] = useState(CARD_DIFFICULTY_OPTIONS[2]); // Default 12 Cards (6 Pairs)
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [gameMessage, setGameMessage] = useState("");

  const mismatchTimer = useRef(null);
  const activityStart = useRef(Date.now());
  const completionSent = useRef(false);

  // Engagement tracking
  const emitEvent = (type, action, label) => {
    if (typeof onEngagement !== "function") return;

    onEngagement({
      id: createEventId(),
      type,
      action,
      label,
      occurredAt: new Date().toISOString(),
      durationMinutes: Math.max(
        1,
        Math.round((Date.now() - activityStart.current) / 60000)
      )
    });
  };

  const startActivity = () => {
    activityStart.current = Date.now();
    completionSent.current = false;
  };

  // Navigation
  const goHome = () => {
    clearTimeout(mismatchTimer.current);
    setScreen("home");
  };

  // =====================================
  // GAME 1: MATCH FAMILIAR PAIRS (REAL PHOTOS)
  // =====================================

  const setupDeckForPairs = (pairCount) => {
    const shuffledItems = [...matchingItems].sort(() => Math.random() - 0.5);
    const chosenItems = shuffledItems.slice(0, pairCount);

    const deck = [...chosenItems, ...chosenItems]
      .map((item, index) => ({
        ...item,
        cardId: `${item.id}-${index}`
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setSelected([]);
    setMatched([]);
    setGameMessage("Take your time. Tap a card to turn it over.");
  };

  const startMatching = (diff = selectedDifficulty) => {
    setupDeckForPairs(diff.pairs);
    startActivity();
    setScreen("matching");
  };

  const handleDifficultyChange = (newDiff) => {
    clearTimeout(mismatchTimer.current);
    setSelectedDifficulty(newDiff);
    setupDeckForPairs(newDiff.pairs);
  };

  const selectCard = (card) => {
    if (
      selected.includes(card.cardId) ||
      matched.includes(card.id) ||
      matched.length === selectedDifficulty.pairs
    ) {
      return;
    }

    playCardFlip();

    // If already showing 2 mismatched cards, dismiss immediately and pick this card
    if (selected.length >= 2) {
      clearTimeout(mismatchTimer.current);
      setSelected([card.cardId]);
      setGameMessage("Tap a second card to find a match.");
      return;
    }

    const newSelected = [...selected, card.cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const firstCard = cards.find((item) => item.cardId === newSelected[0]);
      const secondCard = cards.find((item) => item.cardId === newSelected[1]);

      if (firstCard.id === secondCard.id) {
        const newMatched = [...matched, firstCard.id];
        setMatched(newMatched);
        setSelected([]);

        if (newMatched.length === selectedDifficulty.pairs) {
          playCelebrationChime();
          setGameMessage("Beautifully done! You found all the matching pairs.");
          if (!completionSent.current) {
            completionSent.current = true;
            emitEvent("game", "completed", `Played familiar pairs (${selectedDifficulty.label})`);
          }
        } else {
          playGentleChime();
          setGameMessage(`Wonderful! You matched the ${firstCard.name}.`);
        }
      } else {
        setGameMessage("That's okay. Let's try another one.");
        mismatchTimer.current = setTimeout(() => {
          setSelected([]);
        }, 1100);
      }
    }
  };

  const matchingComplete =
    matched.length === selectedDifficulty.pairs && selectedDifficulty.pairs > 0;

  // =====================================
  // GAME 2: FIND THE DIFFERENCE
  // =====================================

  const startFindDifference = () => {
    startActivity();
    setScreen("findDifference");
  };

  const completeFindDifference = () => {
    if (!completionSent.current) {
      completionSent.current = true;
      emitEvent("game", "completed", "Played Find the Difference");
    }
  };

  // =====================================
  // GAME 3: PICTURE PUZZLE
  // =====================================

  const startPicturePuzzle = () => {
    startActivity();
    setScreen("picturePuzzle");
  };

  const completePicturePuzzle = () => {
    if (!completionSent.current) {
      completionSent.current = true;
      emitEvent("game", "completed", "Played Picture Puzzle");
    }
  };

  // Initialization & cleanup
  useEffect(() => {
    if (cards.length === 0) {
      setupDeckForPairs(selectedDifficulty.pairs);
    }
    return () => {
      clearTimeout(mismatchTimer.current);
    };
  }, []);

  return (
    <div className="ml-module">
      {/* ACTIVITIES HOME (LANDSCAPE 3-GAME GRID WITH REAL PHOTOGRAPHY) */}
      {screen === "home" && (
        <section>
          <div className="ml-heading">
            <span className="ml-eyebrow">A LITTLE TIME FOR YOU</span>
            <h1>Moments of Joy</h1>
            <p>Enjoy gentle, peaceful activities designed for cognitive wellness.</p>
          </div>

          <div className="ml-welcome">
            <div className="ml-welcome-text">
              <span>YOUR HAPPY SPACE</span>
              <h2>Every moment is special.</h2>
              <p>Relax, take your time, and enjoy something lovely today.</p>
            </div>
            <div className="ml-welcome-accent">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b694c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
          </div>

          <h2 className="ml-section-title">Choose an activity</h2>

          <div className="ml-activity-grid">
            {/* MATCH FAMILIAR PAIRS */}
            <button
              className="ml-activity-card ml-card-green"
              onClick={() => startMatching(selectedDifficulty)}
              type="button"
            >
              <div className="ml-card-thumb">
                <img
                  src="/images/covers/matching_cover.jpg"
                  alt="Match Familiar Pairs preview"
                  className="ml-card-photo"
                  loading="lazy"
                />
              </div>
              <span className="ml-card-label">ACTIVITY 01</span>
              <h3>Match Familiar Pairs</h3>
              <p>Discover matching pairs of familiar, comforting photographs. Choose from 4, 8, 12, or 16 cards.</p>
              <span className="ml-card-action">Let's play →</span>
            </button>

            {/* FIND THE DIFFERENCE */}
            <button
              className="ml-activity-card ml-card-peach"
              onClick={startFindDifference}
              type="button"
            >
              <div className="ml-card-thumb">
                <img
                  src="/images/find-difference/woodland_a.png"
                  alt="Spot the Difference preview"
                  className="ml-card-photo"
                  loading="lazy"
                />
              </div>
              <span className="ml-card-label">BRAIN GAME 02</span>
              <h3>Spot the Difference</h3>
              <p>Compare authentic printable puzzle scenes side-by-side and discover natural differences.</p>
              <span className="ml-card-action">Let's play →</span>
            </button>

            {/* PICTURE PUZZLE */}
            <button
              className="ml-activity-card ml-card-lavender"
              onClick={startPicturePuzzle}
              type="button"
            >
              <div className="ml-card-thumb">
                <img
                  src="/images/covers/puzzle_cover.jpg"
                  alt="Picture Puzzle preview"
                  className="ml-card-photo"
                  loading="lazy"
                />
              </div>
              <span className="ml-card-label">BRAIN GAME 03</span>
              <h3>Picture Puzzle</h3>
              <p>Assemble beautiful landscape photograph pieces into a complete picture. Choose 4, 6, 9, or 12 pieces.</p>
              <span className="ml-card-action">Let's play →</span>
            </button>
          </div>
        </section>
      )}

      {/* FIND THE DIFFERENCE (LANDSCAPE REAL IMAGES) */}
      {screen === "findDifference" && (
        <FindDifference
          onBack={goHome}
          onComplete={completeFindDifference}
        />
      )}

      {/* PICTURE PUZZLE (LANDSCAPE REAL PHOTO TILES) */}
      {screen === "picturePuzzle" && (
        <PicturePuzzle
          onBack={goHome}
          onComplete={completePicturePuzzle}
        />
      )}

      {/* MATCH FAMILIAR PAIRS (LANDSCAPE REAL PHOTOGRAPHY GRID) */}
      {screen === "matching" && (
        <section className="ml-matching-section">
          <button className="ml-back" onClick={goHome} type="button">
            ← Back to Activities
          </button>

          <div className="ml-game-heading">
            <span className="ml-eyebrow">MEMORY &amp; FOCUS GAME</span>
            <h1>Match Familiar Pairs</h1>
            <p>Tap a card to turn it over, then find its matching photograph.</p>
          </div>

          {/* Card Count / Difficulty Selector */}
          <div className="ml-control-row">
            <span className="ml-control-label">Number of Cards:</span>
            <div className="ml-selector-pills">
              {CARD_DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`ml-pill-btn ${selectedDifficulty.id === opt.id ? "active" : ""}`}
                  onClick={() => handleDifficultyChange(opt)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress / Status Bar */}
          <div className="ml-matching-status">
            <div className="ml-stat-badge">
              <span>Pairs Matched:</span>
              <strong>{matched.length} / {selectedDifficulty.pairs}</strong>
            </div>
            <button
              className="ml-reshuffle-btn"
              onClick={() => setupDeckForPairs(selectedDifficulty.pairs)}
              type="button"
            >
              Deal New Cards
            </button>
          </div>

          <p className="ml-game-message">{gameMessage}</p>

          {/* Cards Grid */}
          <div
            className="ml-match-grid"
            style={{
              gridTemplateColumns: `repeat(${selectedDifficulty.cols}, 1fr)`,
              maxWidth: `${selectedDifficulty.maxGridWidth}px`
            }}
          >
            {cards.map((card) => {
              const isSelected = selected.includes(card.cardId);
              const isMatched = matched.includes(card.id);
              const isRevealed = isSelected || isMatched;

              return (
                <button
                  key={card.cardId}
                  className={`ml-match-card ${isRevealed ? "revealed" : ""} ${
                    isMatched ? "matched" : ""
                  }`}
                  onClick={() => selectCard(card)}
                  aria-label={isRevealed ? card.name : "Hidden photograph card, tap to turn"}
                  type="button"
                >
                  {isRevealed ? (
                    <div className="ml-card-front">
                      <div className="ml-match-img-wrapper">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="ml-match-photo"
                        />
                      </div>
                      <strong className="ml-card-name">{card.name}</strong>
                    </div>
                  ) : (
                    <div className="ml-card-back">
                      <div className="ml-card-emblem">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#527e61"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                      </div>
                      <small className="ml-card-tap-hint">Tap to flip</small>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {matchingComplete && (
            <div className="ml-completion-box">
              <h2>Wonderful! You matched them all!</h2>
              <p>Thank you for taking this peaceful time with us.</p>
              <div className="ml-completion-actions">
                <button
                  onClick={() => setupDeckForPairs(selectedDifficulty.pairs)}
                  className="ml-primary-btn"
                  type="button"
                >
                  Play Another Round
                </button>
                {selectedDifficulty.id !== "16" && (
                  <button
                    onClick={() => {
                      const nextIndex = CARD_DIFFICULTY_OPTIONS.findIndex(o => o.id === selectedDifficulty.id) + 1;
                      if (nextIndex < CARD_DIFFICULTY_OPTIONS.length) {
                        handleDifficultyChange(CARD_DIFFICULTY_OPTIONS[nextIndex]);
                      }
                    }}
                    className="ml-secondary-btn"
                    type="button"
                  >
                    Try More Cards →
                  </button>
                )}
              </div>
            </div>
          )}

          <button className="ml-secondary-btn" onClick={goHome} type="button">
            Done for Now
          </button>
        </section>
      )}
    </div>
  );
}
