
import React, { useState, useEffect, useRef } from "react";

import {
  matchingItems,
  memoryPhotos
} from "./activityData";

import FindDifference from "./games/FindDifference/FindDifference";
import PicturePuzzle from "./games/PicturePuzzle/PicturePuzzle";

import "./activities.css";
const createEventId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function ActivitiesModule({ onEngagement }) {
  const [screen, setScreen] = useState("home");

  // Matching game states
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [gameMessage, setGameMessage] = useState("");

  // Memory album states
  const [category, setCategory] = useState("All");
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const [savedCaption, setSavedCaption] = useState("");
  const [captionMessage, setCaptionMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);

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
        Math.round(
          (Date.now() - activityStart.current) / 60000
        )
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

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
    setScreen("home");
  };

  // =====================================
  // GAME 1: MATCH FAMILIAR PAIRS
  // =====================================

  const startMatching = () => {
    const shuffledCards = [...matchingItems, ...matchingItems]
      .map((item, index) => ({
        ...item,
        cardId: `${item.id}-${index}`
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setSelected([]);
    setMatched([]);

    setGameMessage(
      "Take your time. Find two matching pictures."
    );

    startActivity();
    setScreen("matching");
  };

  const selectCard = (card) => {
    if (
      selected.length >= 2 ||
      selected.includes(card.cardId) ||
      matched.includes(card.id) ||
      matched.length === matchingItems.length
    ) {
      return;
    }

    const newSelected = [...selected, card.cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const firstCard = cards.find(
        item => item.cardId === newSelected[0]
      );

      const secondCard = cards.find(
        item => item.cardId === newSelected[1]
      );

      if (firstCard.id === secondCard.id) {
        const newMatched = [...matched, firstCard.id];

        setMatched(newMatched);
        setSelected([]);

        if (newMatched.length === matchingItems.length) {
          setGameMessage(
            "Beautifully done! Thank you for playing."
          );

          if (!completionSent.current) {
            completionSent.current = true;

            emitEvent(
              "game",
              "completed",
              "Played familiar pairs"
            );
          }
        } else {
          setGameMessage(
            "Wonderful! You found a pair."
          );
        }
      } else {
        setGameMessage(
          "That's okay. Let's try another one."
        );

        mismatchTimer.current = setTimeout(() => {
          setSelected([]);
        }, 1000);
      }
    }
  };

  const matchingComplete =
    matched.length === matchingItems.length;

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

      emitEvent(
        "game",
        "completed",
        "Played Find the Difference"
      );
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

      emitEvent(
        "game",
        "completed",
        "Played Picture Puzzle"
      );
    }
  };

  // =====================================
  // MEMORY ALBUM
  // =====================================

  const categories = [
    "All",
    "Nature & Gardens",
    "Celebrations",
    "Everyday Life"
  ];

  const filteredPhotos = memoryPhotos.filter(
    item =>
      category === "All" ||
      item.category === category
  );

  const openPhoto = (item) => {
    setPhoto(item);
    setCaption("");
    setSavedCaption("");
    setCaptionMessage("");

    activityStart.current = Date.now();
    completionSent.current = false;

    setScreen("photo");

    emitEvent(
      "memory",
      "viewed",
      `Viewed ${item.title}`
    );
  };

  const playVoicePrompt = () => {
    if (!("speechSynthesis" in window)) {
      setCaptionMessage(
        "Voice prompts are not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      "Take your time. Would you like to share something about this picture?"
    );

    speech.rate = 0.85;
    speech.pitch = 1;

    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(speech);
    setSpeaking(true);

    emitEvent(
      "memory",
      "played",
      "Played sample voice prompt"
    );
  };

  const stopVoicePrompt = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  };

  const saveCaption = () => {
    if (!caption.trim()) {
      setCaptionMessage(
        "Please write something first."
      );
      return;
    }

    setSavedCaption(caption.trim());

    setCaptionMessage(
      "Your reflection has been saved for this session."
    );
  };

  const backToAlbum = () => {
    stopVoicePrompt();
    setScreen("album");
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(mismatchTimer.current);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="ml-module">

      {/* ACTIVITIES HOME */}

      {screen === "home" && (
        <section>

          <div className="ml-heading">
            <span className="ml-eyebrow">
              A LITTLE TIME FOR YOU
            </span>

            <h1>Moments of Joy 🌿</h1>

            <p>
              Enjoy a few gentle activities at your own pace.
            </p>
          </div>

          <div className="ml-welcome">
            <div>
              <span>YOUR HAPPY SPACE</span>

              <h2>Every moment is special.</h2>

              <p>
                Let's enjoy something lovely today.
              </p>
            </div>

            <span className="ml-welcome-emoji">
              🌼
            </span>
          </div>

          <h2 className="ml-section-title">
            Choose an activity
          </h2>

          <div className="ml-activity-grid">

            {/* MATCH FAMILIAR PAIRS */}

            <button
              className="ml-activity-card ml-card-green"
              onClick={startMatching}
            >
              <span className="ml-card-emoji">
                🧩
              </span>

              <span className="ml-card-label">
                ACTIVITY 01
              </span>

              <h3>Match Familiar Pairs</h3>

              <p>
                Let's find matching pictures together.
              </p>

              <span className="ml-card-action">
                Let's play →
              </span>
            </button>

            {/* FIND THE DIFFERENCE */}

            <button
              className="ml-activity-card ml-card-peach"
              onClick={startFindDifference}
            >
              <span className="ml-card-emoji">
                🔍
              </span>

              <span className="ml-card-label">
                BRAIN GAME 02
              </span>

              <h3>Find the Difference</h3>

              <p>
                Look carefully and discover what's changed.
              </p>

              <span className="ml-card-action">
                Let's play →
              </span>
            </button>

            {/* PICTURE PUZZLE */}

            <button
              className="ml-activity-card ml-card-lavender"
              onClick={startPicturePuzzle}
            >
              <span className="ml-card-emoji">
                🧩
              </span>

              <span className="ml-card-label">
                BRAIN GAME 03
              </span>

              <h3>Picture Puzzle</h3>

              <p>
                Put the picture pieces together.
              </p>

              <span className="ml-card-action">
                Let's play →
              </span>
            </button>

            {/* MEMORY ALBUM */}

            <button
              className="ml-activity-card ml-card-lavender"
              onClick={() => setScreen("album")}
            >
              <span className="ml-card-emoji">
                📸
              </span>

              <span className="ml-card-label">
                SPECIAL MOMENTS
              </span>

              <h3>Memory Album</h3>

              <p>
                Explore pictures and share your thoughts.
              </p>

              <span className="ml-card-action">
                View album →
              </span>
            </button>

          </div>

          <div className="ml-joy-note">
            <span>💚</span>

            <div>
              <strong>A little moment of joy</strong>

              <p>
                Take your time. There is no hurry.
              </p>
            </div>
          </div>

        </section>
      )}

      {/* FIND THE DIFFERENCE SCREEN */}

      {screen === "findDifference" && (
        <FindDifference
          onBack={goHome}
          onComplete={completeFindDifference}
        />
      )}

      {/* PICTURE PUZZLE SCREEN */}

      {screen === "picturePuzzle" && (
        <PicturePuzzle
          onBack={goHome}
          onComplete={completePicturePuzzle}
        />
      )}

      {/* MATCHING GAME */}

      {screen === "matching" && (
        <section>

          <button
            className="ml-back"
            onClick={goHome}
          >
            ← Back to Activities
          </button>

          <div className="ml-game-heading">

            <span className="ml-eyebrow">
              ACTIVITY 01
            </span>

            <h1>Let's Match Together! 🧩</h1>

            <p>
              Find two pictures that look the same.
            </p>

          </div>

          <div className="ml-match-grid">

            {cards.map(card => {
              const revealed =
                selected.includes(card.cardId) ||
                matched.includes(card.id);

              return (
                <button
                  key={card.cardId}
                  className={`ml-match-card ${
                    revealed ? "revealed" : ""
                  } ${
                    matched.includes(card.id)
                      ? "matched"
                      : ""
                  }`}
                  onClick={() => selectCard(card)}
                  disabled={
                    revealed ||
                    selected.length === 2 ||
                    matchingComplete
                  }
                  aria-label={
                    revealed
                      ? card.name
                      : "Hidden picture"
                  }
                >

                  {revealed ? (
                    <>
                      <span>{card.emoji}</span>
                      <small>{card.name}</small>
                    </>
                  ) : (
                    <span className="ml-hidden-card">
                      ✿
                    </span>
                  )}

                </button>
              );
            })}

          </div>

          <div className="ml-feedback">
            {gameMessage}
          </div>

          {matchingComplete && (
            <div className="ml-complete">

              <span>🌸</span>

              <h2>Beautifully done!</h2>

              <p>
                Thank you for spending this time with us.
              </p>

              <button
                onClick={startMatching}
                className="ml-primary-btn"
              >
                Play Again
              </button>

            </div>
          )}

          <button
            className="ml-secondary-btn"
            onClick={goHome}
          >
            Done for Now
          </button>

        </section>
      )}

      {/* MEMORY ALBUM */}

      {screen === "album" && (
        <section>

          <button
            className="ml-back"
            onClick={goHome}
          >
            ← Back to Activities
          </button>

          <div className="ml-game-heading">

            <span className="ml-eyebrow">
              YOUR SPECIAL COLLECTION
            </span>

            <h1>Beautiful Memories 📸</h1>

            <p>
              A little collection of familiar moments.
            </p>

          </div>

          <div className="ml-category-list">

            {categories.map(cat => (
              <button
                key={cat}
                className={
                  category === cat ? "active" : ""
                }
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}

          </div>

          <div className="ml-photo-grid">

            {filteredPhotos.map(item => (
              <button
                key={item.id}
                className="ml-photo-card"
                onClick={() => openPhoto(item)}
              >

                <div
                  className="ml-photo-placeholder"
                  style={{ background: item.color }}
                >
                  <span>{item.emoji}</span>
                  <small>Sample image</small>
                </div>

                <div className="ml-photo-info">
                  <strong>{item.title}</strong>
                  <span>{item.category}</span>
                </div>

              </button>
            ))}

          </div>

        </section>
      )}

      {/* PHOTO DETAIL */}

      {screen === "photo" && photo && (
        <section>

          <button
            className="ml-back"
            onClick={backToAlbum}
          >
            ← Back to Album
          </button>

          <div className="ml-photo-detail">

            <div
              className="ml-large-photo"
              style={{ background: photo.color }}
            >
              <span>{photo.emoji}</span>
              <small>Sample image placeholder</small>
            </div>

            <div className="ml-photo-detail-info">

              <span className="ml-eyebrow">
                {photo.category}
              </span>

              <h1>{photo.title}</h1>

              <p>{photo.caption}</p>

              <div className="ml-memory-prompt">

                <span>💭</span>

                <div>
                  <h3>Let's share a moment</h3>

                  <p>
                    Would you like to tell me about this day?
                  </p>
                </div>

              </div>

              <button
                className="ml-primary-btn"
                onClick={
                  speaking
                    ? stopVoicePrompt
                    : playVoicePrompt
                }
              >
                {speaking
                  ? "■ Stop Voice Prompt"
                  : "🔊 Play Voice Prompt"}
              </button>

              <small className="ml-demo-label">
                Demo voice prompt · Uses your browser's
                speech feature
              </small>

              <h3 className="ml-caption-title">
                Your thoughts
              </h3>

              <textarea
                className="ml-caption-input"
                placeholder="Write something you'd like to remember..."
                value={caption}
                onChange={e => {
                  setCaption(e.target.value);
                  setCaptionMessage("");
                }}
                rows={3}
              />

              <button
                className="ml-primary-btn"
                onClick={saveCaption}
              >
                Save Caption
              </button>

              {captionMessage && (
                <p className="ml-feedback">
                  {captionMessage}
                </p>
              )}

              {savedCaption && (
                <div className="ml-saved-caption">
                  <strong>Your saved reflection</strong>
                  <p>{savedCaption}</p>
                </div>
              )}

            </div>
          </div>

        </section>
      )}

    </div>
  );
}
