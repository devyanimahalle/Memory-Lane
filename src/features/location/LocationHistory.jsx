import React, { useState } from 'react';
import { formatDistance } from './geofence';
import { getAccuracyRating } from './geolocation';

/**
 * LocationHistory.jsx - Daily Movement History & Timeline
 *
 * Responsibilities:
 * - Render chronological movement timeline with date and time
 * - Allow caregiver to click any history entry to highlight and inspect it on the map
 * - Provide a safe "Clear History" action with confirmation modal to prevent accidental data loss
 * - Completely avoid sample or fabricated GPS records
 */
export default function LocationHistory({
  history = [],
  selectedHistoryId = null,
  onSelectHistoryPoint = null,
  onClearHistory = null,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const hasHistory = Array.isArray(history) && history.length > 0;

  const handleConfirmClear = () => {
    setShowClearConfirm(false);
    onClearHistory?.();
  };

  return (
    <div className="ml-location-history-card" aria-label="Movement History Section">
      <div className="ml-history-header">
        <div>
          <h3 className="ml-history-title">Today&apos;s Movement History</h3>
          <p className="ml-history-subtitle">
            Chronological breadcrumb trail of recorded positions for today. Tap any entry to view on map.
          </p>
        </div>
        {hasHistory && !showClearConfirm && (
          <button
            type="button"
            className="ml-btn-clear-history"
            onClick={() => setShowClearConfirm(true)}
            aria-label="Clear today's location history"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Confirmation box for clearing history */}
      {showClearConfirm && (
        <div className="ml-clear-confirm-card" role="alert">
          <p className="ml-clear-confirm-text">
            Are you sure you want to clear today&apos;s movement history? This action cannot be undone.
          </p>
          <div className="ml-clear-confirm-actions">
            <button
              type="button"
              className="ml-btn-clear-danger"
              onClick={handleConfirmClear}
            >
              Yes, Clear History
            </button>
            <button
              type="button"
              className="ml-btn-clear-cancel"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!hasHistory ? (
        <div className="ml-history-empty" role="status">
          <span className="ml-history-empty-icon" aria-hidden="true">
            🧭
          </span>
          <p className="ml-history-empty-text">
            No movement recorded yet today. When GPS updates occur, positions will appear here.
          </p>
        </div>
      ) : (
        <ul className="ml-history-timeline" role="list">
          {history.map((item, index) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
            });
            const dateStr = new Date(item.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const accRating = getAccuracyRating(item.accuracy);
            const isSelected = selectedHistoryId === item.id;

            return (
              <li
                key={item.id || `${item.timestamp}-${index}`}
                className={`ml-history-item ${isSelected ? 'ml-history-item-selected' : ''}`}
                onClick={() => onSelectHistoryPoint?.(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectHistoryPoint?.(item);
                  }
                }}
                aria-label={`Recorded location at ${timeStr}. Distance from home: ${
                  item.distanceFromHome !== null ? formatDistance(item.distanceFromHome) : 'unknown'
                }. Click to view on map.`}
              >
                <div
                  className={`ml-history-dot ${isSelected ? 'ml-history-dot-selected' : ''}`}
                  aria-hidden="true"
                />
                <div className="ml-history-content">
                  <div className="ml-history-top-row">
                    <span className="ml-history-time">
                      {dateStr}, {timeStr}
                    </span>
                    {item.distanceFromHome !== null && item.distanceFromHome !== undefined && (
                      <span className="ml-history-distance-badge">
                        {formatDistance(item.distanceFromHome)} from home
                      </span>
                    )}
                  </div>
                  <div className="ml-history-details">
                    <span className="ml-history-coords">
                      {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                    </span>
                    <span className="ml-history-accuracy">
                      Accuracy: {accRating.label}
                    </span>
                  </div>
                  <div className="ml-history-tap-hint">
                    {isSelected ? '✓ Showing on map above' : 'Tap to focus on map'}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
