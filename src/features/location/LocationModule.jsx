import React, { useState, useEffect, useRef } from 'react';
import './location.css';
import LocationMap from './LocationMap';
import LocationHistory from './LocationHistory';
import {
  startLocationTracking,
  GPS_STATUS,
  formatLastUpdated,
  getAccuracyRating,
  checkPermissionStatus,
  isLocationStale,
} from './geolocation';
import {
  calculateHaversineDistance,
  formatDistance,
  evaluateSafeZone,
  RADIUS_PRESETS,
  DEFAULT_RADIUS_METERS,
  loadSavedHome,
  saveHome,
  loadSavedRadius,
  saveRadius,
} from './geofence';
import {
  loadActiveBreach,
  loadAlertHistory,
  clearAlertHistory,
  formatTimeOutside,
  loadCaregiverContact,
  saveCaregiverContact,
} from './safetyMonitor';

const STORAGE_KEY_HISTORY = 'memory_lane_location_history_today';

/**
 * Loads today's location history from localStorage
 */
function loadStoredHistory() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves location history to localStorage
 */
function persistHistory(historyItems) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyItems));
  } catch (e) {}
}

/**
 * LocationModule.jsx - Main Caregiver GPS Location Dashboard
 *
 * Implements:
 * - Transparent patient permission request & live hardware GPS tracking
 * - Real-time Haversine distance calculations from caregiver-configured Home
 * - Safe radius visual reference (100m, 200m, 500m, 1km, + custom input)
 * - Clear inside/outside status badges (ZERO automatic alarms/notifications)
 * - Chronological movement history with map inspection
 * - Active patient safety event status display (when triggered after 2 min continuous breach)
 * - Configurable caregiver emergency contact info (never hardcoded)
 * - Complete localStorage persistence for Home, Radius, Contact, and History across refreshes
 * - High accessibility, elderly-friendly large text, and responsive layout
 */
export default function LocationModule() {
  // Live GPS state
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.IDLE);
  const [gpsError, setGpsError] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Caregiver Geofence state (restored from localStorage)
  const [homeLocation, setHomeLocation] = useState(() => loadSavedHome());
  const [safeRadius, setSafeRadius] = useState(() => loadSavedRadius());
  const [isSettingHomeFromMap, setIsSettingHomeFromMap] = useState(false);
  const [isCustomRadiusActive, setIsCustomRadiusActive] = useState(() => {
    const saved = loadSavedRadius();
    return !RADIUS_PRESETS.some((p) => p.value === saved);
  });
  const [customRadiusInput, setCustomRadiusInput] = useState(() => {
    const saved = loadSavedRadius();
    return RADIUS_PRESETS.some((p) => p.value === saved) ? '300' : String(saved);
  });

  // Address search state (Nominatim geocoding - free, no API key required)
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Caregiver contact configuration (no hardcoding)
  const [caregiverContact, setCaregiverContact] = useState(() => loadCaregiverContact() || { name: '', phone: '', relationship: '' });
  const [contactSavedNotice, setContactSavedNotice] = useState(false);

  // Active safe-zone breach & alert history (synced from localStorage)
  const [activeBreach, setActiveBreach] = useState(() => loadActiveBreach());
  const [alertHistory, setAlertHistory] = useState(() => loadAlertHistory());
  const [nowTick, setNowTick] = useState(Date.now());

  // Daily movement history & map selection
  const [history, setHistory] = useState(() => loadStoredHistory());
  const [selectedHistoryPoint, setSelectedHistoryPoint] = useState(null);

  // Ref to track last recorded point for distance-based deduplication
  const lastRecordedPointRef = useRef(history && history.length > 0 ? history[0] : null);

  // 1. Initial permission check (if supported)
  useEffect(() => {
    checkPermissionStatus().then((state) => {
      if (state === 'denied') {
        setGpsStatus(GPS_STATUS.PERMISSION_DENIED);
        setGpsError('Location permission was previously denied. Enable location in your browser address bar.');
      }
    });
  }, []);

  // 2. Subscribe to live browser GPS using navigator.geolocation.watchPosition()
  useEffect(() => {
    if (!isTrackingEnabled) {
      setGpsStatus(GPS_STATUS.IDLE);
      return;
    }

    const stopWatcher = startLocationTracking({
      onPosition: (pos) => {
        setCurrentPosition(pos);
        setGpsError(null);
        setIsStale(false);

        // Record history point if patient moved > 15 meters or after initial fix
        const currentHome = homeLocation;
        const distanceFromHome = currentHome
          ? calculateHaversineDistance(
              pos.lat,
              pos.lng,
              currentHome.lat,
              currentHome.lng
            )
          : null;

        const lastPt = lastRecordedPointRef.current;
        let shouldRecord = false;

        if (!lastPt) {
          shouldRecord = true;
        } else {
          const moveDist = calculateHaversineDistance(
            lastPt.lat,
            lastPt.lng,
            pos.lat,
            pos.lng
          );
          // Only record if moved at least 15m or more than 5 minutes elapsed
          const elapsedMs = (pos.timestamp || Date.now()) - lastPt.timestamp;
          if (moveDist >= 15 || elapsedMs > 300000) {
            shouldRecord = true;
          }
        }

        if (shouldRecord) {
          const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            lat: pos.lat,
            lng: pos.lng,
            accuracy: pos.accuracy,
            timestamp: pos.timestamp || Date.now(),
            distanceFromHome,
          };

          lastRecordedPointRef.current = newEntry;
          setHistory((prev) => {
            const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50 points
            persistHistory(updated);
            return updated;
          });
        }
      },
      onError: (err) => {
        setGpsError(err.message);
      },
      onStatusChange: (status) => {
        setGpsStatus(status);
      },
    });

    // Cleanup GPS watcher on unmount or toggle
    return () => {
      stopWatcher();
    };
  }, [isTrackingEnabled, homeLocation]);

  // 3. Stale data detection & active breach sync timer (every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
      if (currentPosition?.timestamp) {
        setIsStale(isLocationStale(currentPosition.timestamp));
      }
      setActiveBreach(loadActiveBreach());
      setAlertHistory(loadAlertHistory());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPosition]);

  // Caregiver Action: Save caregiver contact details
  const handleSaveContact = (e) => {
    e?.preventDefault();
    saveCaregiverContact(caregiverContact);
    setContactSavedNotice(true);
    setTimeout(() => setContactSavedNotice(false), 3000);
  };

  // Caregiver Action: Clear breach alert history
  const handleClearAlertHistory = () => {
    clearAlertHistory();
    setAlertHistory([]);
  };

  // Distance from home calculation using Haversine formula
  const distanceFromHome =
    currentPosition && homeLocation
      ? calculateHaversineDistance(
          currentPosition.lat,
          currentPosition.lng,
          homeLocation.lat,
          homeLocation.lng
        )
      : null;

  // Safe zone evaluation: if GPS is unavailable, show 'Location unavailable' instead of marking patient safe!
  const isGpsUnavailable =
    gpsStatus === GPS_STATUS.PERMISSION_DENIED ||
    gpsStatus === GPS_STATUS.POSITION_UNAVAILABLE ||
    gpsStatus === GPS_STATUS.TIMEOUT ||
    !currentPosition;

  const safeZone = evaluateSafeZone(distanceFromHome, safeRadius, isGpsUnavailable);
  const accuracyRating = getAccuracyRating(currentPosition?.accuracy);

  // Caregiver Action: Set Current Location as Home
  // NOTE: This sets the CAREGIVER's current GPS as the home reference for the patient.
  // Do NOT auto-set. The caregiver must explicitly click this button.
  const handleUseCurrentAsHome = () => {
    if (!currentPosition) return;
    const newHome = {
      lat: currentPosition.lat,
      lng: currentPosition.lng,
      address: 'Current GPS Position',
    };
    saveHome(newHome);
    setHomeLocation(newHome);
    setIsSettingHomeFromMap(false);
    setAddressResults([]);
    setAddressQuery('');
  };

  // Caregiver Action: Set Home from Map Click
  const handleSetHomeFromMap = (coords) => {
    saveHome(coords);
    setHomeLocation(coords);
    setIsSettingHomeFromMap(false);
  };

  // Caregiver Action: Set Home from address search result
  const handleSelectAddressResult = (result) => {
    const newHome = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    saveHome(newHome);
    setHomeLocation(newHome);
    setAddressResults([]);
    setAddressQuery(result.display_name);
    setIsSettingHomeFromMap(false);
  };

  // Caregiver Action: Search for address using Nominatim (OpenStreetMap free geocoder)
  const handleSearchAddress = async (e) => {
    e?.preventDefault();
    const query = addressQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setSearchError(null);
    setAddressResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MemoryLaneCaregiverApp/1.0' },
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      if (!data.length) {
        setSearchError('No results found. Try a more specific address.');
      } else {
        setAddressResults(data);
      }
    } catch (err) {
      setSearchError(`Search error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Caregiver Action: Change Radius to preset
  const handleSelectRadius = (meters) => {
    setIsCustomRadiusActive(false);
    saveRadius(meters);
    setSafeRadius(meters);
  };

  // Caregiver Action: Apply custom radius
  const handleApplyCustomRadius = (e) => {
    e?.preventDefault();
    const parsed = parseInt(customRadiusInput, 10);
    if (!isNaN(parsed) && parsed >= 25 && parsed <= 10000) {
      saveRadius(parsed);
      setSafeRadius(parsed);
      setIsCustomRadiusActive(true);
    }
  };

  // Caregiver Action: Select a historical point to inspect on map
  const handleSelectHistoryPoint = (point) => {
    setSelectedHistoryPoint(point);
  };

  // Caregiver Action: Clear selected historical inspection
  const handleClearSelectedHistory = () => {
    setSelectedHistoryPoint(null);
  };

  // Caregiver Action: Clear History
  const handleClearHistory = () => {
    persistHistory([]);
    setHistory([]);
    setSelectedHistoryPoint(null);
    lastRecordedPointRef.current = null;
  };

  // Caregiver Action: Open in Google Maps for directions
  const handleOpenDirections = () => {
    if (!currentPosition) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentPosition.lat},${currentPosition.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper status badge renderer
  const renderStatusBadge = () => {
    if (!isTrackingEnabled) {
      return (
        <span className="ml-status-pill-gps ml-status-idle">
          ⏸️ Tracking Paused
        </span>
      );
    }
    if (gpsStatus === GPS_STATUS.ACTIVE) {
      if (isStale) {
        return (
          <span className="ml-status-pill-gps ml-status-requesting" title="No GPS update in past 60s">
            ⏳ Signal Delayed
          </span>
        );
      }
      return (
        <span className="ml-status-pill-gps ml-status-active">
          <span className="ml-status-dot-active" aria-hidden="true" />
          Live GPS Active
        </span>
      );
    }
    if (gpsStatus === GPS_STATUS.REQUESTING) {
      return (
        <span className="ml-status-pill-gps ml-status-requesting">
          ⏳ Acquiring GPS...
        </span>
      );
    }
    if (
      gpsStatus === GPS_STATUS.PERMISSION_DENIED ||
      gpsStatus === GPS_STATUS.POSITION_UNAVAILABLE ||
      gpsStatus === GPS_STATUS.TIMEOUT
    ) {
      return (
        <span className="ml-status-pill-gps ml-status-error">
          ⚠️ GPS Unavailable
        </span>
      );
    }
    return (
      <span className="ml-status-pill-gps ml-status-idle">
        GPS Inactive
      </span>
    );
  };

  return (
    <div className="ml-location-module" role="main" aria-label="Caregiver GPS Location Dashboard">
      {/* Header */}
      <header className="ml-location-header">
        <div className="ml-location-header-top">
          <h2 className="ml-location-title">Caregiver GPS Location</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {renderStatusBadge()}
            <button
              type="button"
              className="ml-btn-action ml-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={() => setIsTrackingEnabled((prev) => !prev)}
            >
              {isTrackingEnabled ? 'Pause Tracking' : 'Resume Tracking'}
            </button>
          </div>
        </div>
        <p className="ml-location-subtitle">
          Real-time patient location monitoring, safe reference radius, and daily movement trail.
        </p>
      </header>

      {/* Patient Transparency & Consent Card */}
      <div className="ml-transparency-card" role="note">
        <span className="ml-transparency-icon" aria-hidden="true">
          🛡️
        </span>
        <p className="ml-transparency-text">
          <strong>Privacy & Safety Notice:</strong> Location tracking operates with transparent patient permission
          on this device. Location updates are visible only to authorized family caregivers to ensure gentle safety.
        </p>
      </div>

      {/* Active Safe-Zone Breach Alert Banner (Requirements 4, 5, 6) */}
      {activeBreach && activeBreach.active && (
        <div className="ml-caregiver-breach-alert" role="alert">
          <div className="ml-caregiver-breach-header">
            <h4 className="ml-caregiver-breach-title">
              <span>⚠️</span> Patient Outside Safe Zone
            </h4>
            <span className="ml-caregiver-breach-badge">
              Alert #{activeBreach.alertCount} (Repeats every 2 mins)
            </span>
          </div>
          <p className="ml-caregiver-breach-body">
            Patient has exited the designated safe radius ({formatDistance(safeRadius)}).
            Immediate alert was dispatched. Repeat alerts continue every 2 minutes while outside.
          </p>
          <div className="ml-caregiver-breach-metrics">
            <span><strong>Distance from Home:</strong> {formatDistance(distanceFromHome || activeBreach.currentDistance)}</span>
            <span><strong>Time Outside:</strong> {formatTimeOutside(nowTick - activeBreach.breachStartedAt)}</span>
            <span><strong>Started:</strong> {new Date(activeBreach.breachStartedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        </div>
      )}

      {/* Error alert if permission denied or unavailable */}
      {gpsError && (
        <div className="ml-transparency-card" style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
          <span className="ml-transparency-icon" aria-hidden="true">⚠️</span>
          <p className="ml-transparency-text">
            <strong>GPS Status:</strong> {gpsError}
          </p>
        </div>
      )}

      {/* Overview Grid */}
      <div className="ml-overview-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Card 1: Safe Zone Status */}
        <div className="ml-overview-card">
          <div className="ml-overview-label">Safety Zone Status</div>
          <p className={`ml-overview-value ${
            isGpsUnavailable
              ? 'ml-badge-unavailable'
              : safeZone.isInside
              ? 'ml-badge-safe'
              : 'ml-badge-outside'
          }`}>
            {!homeLocation
              ? 'Set Home Base Below'
              : isGpsUnavailable
              ? 'Location unavailable'
              : safeZone.label}
          </p>
          <div className="ml-overview-footnote">
            {!homeLocation
              ? 'Configure home location to activate'
              : isGpsUnavailable
              ? 'GPS signal lost; cannot confirm patient is safe'
              : `Safe radius: ${formatDistance(safeRadius)}`}
          </div>
        </div>

        {/* Card 2: Distance from Home */}
        <div className="ml-overview-card">
          <div className="ml-overview-label">Distance from Home</div>
          <p className="ml-overview-value">
            {!homeLocation
              ? 'Home not set'
              : !currentPosition
              ? 'Waiting for GPS'
              : formatDistance(distanceFromHome)}
          </p>
          <div className="ml-overview-footnote">
            {homeLocation && currentPosition
              ? `${Math.round(distanceFromHome)} meters straight-line (Haversine)`
              : homeLocation
              ? 'Waiting for live coordinates'
              : 'Choose a home base below'}
          </div>
        </div>

        {/* Card 3: Time Outside / Breach Status (Requirement 6) */}
        <div className="ml-overview-card">
          <div className="ml-overview-label">Time Outside Zone</div>
          <p className={`ml-overview-value ${activeBreach?.active ? 'ml-badge-outside' : 'ml-badge-safe'}`}>
            {activeBreach?.active
              ? formatTimeOutside(nowTick - activeBreach.breachStartedAt)
              : 'Inside Safe Zone'}
          </p>
          <div className="ml-overview-footnote">
            {activeBreach?.active
              ? `Alerts repeat every 2m (Alert #${activeBreach.alertCount})`
              : 'No active safe-zone breach'}
          </div>
        </div>

        {/* Card 4: Signal Quality & Last Update */}
        <div className="ml-overview-card">
          <div className="ml-overview-label">GPS Accuracy</div>
          <p className="ml-overview-value">
            {currentPosition ? accuracyRating.label : 'No signal yet'}
          </p>
          <div className="ml-overview-footnote">
            Updated: {currentPosition ? formatLastUpdated(currentPosition.timestamp) : 'Never'}
            {isStale && ' (Delayed)'}
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map (Synchronized with safeRadius & historical selection) */}
      <section className="ml-map-section" aria-label="Interactive Map">
        <LocationMap
          patientLocation={currentPosition}
          homeLocation={homeLocation}
          radiusMeters={safeRadius}
          history={history}
          selectedHistoryPoint={selectedHistoryPoint}
          onClearSelectedHistory={handleClearSelectedHistory}
          isSettingHome={isSettingHomeFromMap}
          onSetHomeFromMap={handleSetHomeFromMap}
        />
      </section>

      {/* No Home Configured Warning */}
      {!homeLocation && (
        <div
          className="ml-transparency-card"
          style={{ borderColor: '#F59E0B', background: '#FFFBEB', color: '#92400E', marginBottom: 0 }}
          role="alert"
        >
          <span className="ml-transparency-icon" aria-hidden="true">⚠️</span>
          <p className="ml-transparency-text">
            <strong>Safe location not configured.</strong> The patient safety message will not activate
            until a home base is set. Use the address search or map below to configure one.
          </p>
        </div>
      )}

      {/* Caregiver Settings & Safe Zone Controls */}
      <section className="ml-settings-card" aria-label="Caregiver Controls">
        <h3 className="ml-settings-title">Configure Patient Safe Location &amp; Radius</h3>

        {/* ── Address Search ── */}
        <div className="ml-settings-group">
          <label className="ml-settings-label" htmlFor="ml-address-search">
            Search Address / Location
          </label>
          <p style={{ fontSize: '13px', color: 'var(--ml-grey)', margin: '0 0 8px' }}>
            Type a street address, landmark, or city to set as the patient's designated safe location.
          </p>
          <form onSubmit={handleSearchAddress} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              id="ml-address-search"
              type="text"
              className="ml-contact-input"
              style={{ flex: '1 1 240px', minWidth: '200px' }}
              placeholder="e.g. 42 Elm Street, Springfield..."
              value={addressQuery}
              onChange={(e) => { setAddressQuery(e.target.value); setAddressResults([]); }}
              aria-label="Search for a home address"
              autoComplete="off"
            />
            <button
              type="submit"
              className="ml-btn-action ml-btn-primary"
              disabled={isSearching || !addressQuery.trim()}
              style={{ padding: '10px 16px', fontSize: '14px' }}
            >
              {isSearching ? '🔍 Searching…' : '🔍 Search'}
            </button>
          </form>

          {/* Search error */}
          {searchError && (
            <p style={{ color: '#991B1B', fontSize: '13px', marginTop: '6px' }}>{searchError}</p>
          )}

          {/* Search results dropdown */}
          {addressResults.length > 0 && (
            <ul
              style={{
                listStyle: 'none', margin: '6px 0 0', padding: 0,
                border: '1px solid var(--ml-border-light)', borderRadius: '8px',
                background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                maxHeight: '220px', overflowY: 'auto',
              }}
              role="listbox"
              aria-label="Address search results"
            >
              {addressResults.map((result) => (
                <li key={result.place_id}>
                  <button
                    type="button"
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', color: '#101D2D',
                      borderBottom: '1px solid var(--ml-border-light)',
                      lineHeight: '1.4',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    onClick={() => handleSelectAddressResult(result)}
                    role="option"
                    aria-label={`Set home to ${result.display_name}`}
                  >
                    📍 {result.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Home Base Status & Map/GPS Actions ── */}
        <div className="ml-settings-group">
          <label className="ml-settings-label">
            Current Home Base:{' '}
            <span style={{ fontWeight: 400, color: homeLocation ? '#0A6A5E' : 'var(--ml-grey)' }}>
              {homeLocation
                ? `${homeLocation.address ? homeLocation.address.substring(0, 60) + (homeLocation.address.length > 60 ? '…' : '') : 'Saved'} (${homeLocation.lat.toFixed(4)}, ${homeLocation.lng.toFixed(4)})`
                : '⚠️ Not configured — patient safety message is inactive'}
            </span>
          </label>

          <div className="ml-actions-row">
            <button
              type="button"
              className={`ml-btn-action ml-btn-secondary ${isSettingHomeFromMap ? 'ml-radius-btn-active' : ''}`}
              onClick={() => setIsSettingHomeFromMap((prev) => !prev)}
            >
              {isSettingHomeFromMap ? '✕ Cancel Map Selection' : '🗺️ Click Map to Set Home'}
            </button>

            <button
              type="button"
              className="ml-btn-action ml-btn-secondary"
              onClick={handleUseCurrentAsHome}
              disabled={!currentPosition}
              title={!currentPosition ? 'Waiting for GPS fix' : 'Use the current live GPS position as home base'}
            >
              📍 Use Current GPS
            </button>

            {currentPosition && (
              <button
                type="button"
                className="ml-btn-action ml-btn-secondary"
                onClick={handleOpenDirections}
              >
                🧭 Directions
              </button>
            )}
          </div>
        </div>

        {/* ── Safe Zone Radius ── */}
        <div className="ml-settings-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="ml-settings-label" style={{ margin: 0 }}>
              Safe Zone Radius: <span style={{ color: 'var(--ml-turquoise-dk)', fontWeight: 800 }}>{formatDistance(safeRadius)}</span>
            </label>
            <span style={{ fontSize: '13px', color: 'var(--ml-grey)' }}>
              Immediate alert on safe-zone exit • repeats every 2m
            </span>
          </div>

          <div className="ml-radius-selector" role="group" aria-label="Safe Radius Options">
            {RADIUS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`ml-radius-btn ${!isCustomRadiusActive && safeRadius === preset.value ? 'ml-radius-btn-active' : ''}`}
                onClick={() => handleSelectRadius(preset.value)}
              >
                {preset.label}
              </button>
            ))}

            {/* Custom Radius Form */}
            <form onSubmit={handleApplyCustomRadius} className="ml-custom-radius-form">
              <input
                type="number"
                min="25"
                max="10000"
                step="25"
                value={customRadiusInput}
                onChange={(e) => setCustomRadiusInput(e.target.value)}
                placeholder="meters"
                className={`ml-custom-radius-input ${isCustomRadiusActive ? 'ml-custom-radius-input-active' : ''}`}
                aria-label="Custom radius in meters"
              />
              <button
                type="submit"
                className={`ml-radius-btn ${isCustomRadiusActive ? 'ml-radius-btn-active' : ''}`}
              >
                Custom (m)
              </button>
            </form>
          </div>
        </div>

        {/* Family Caregiver Emergency Contact Form (Not hardcoded) */}
        <div className="ml-settings-group" style={{ borderTop: '1px solid var(--ml-border-light)', paddingTop: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="ml-settings-label" style={{ margin: 0 }}>
              Family Caregiver Emergency Contact:
            </label>
            {contactSavedNotice && (
              <span style={{ color: '#0A6A5E', fontSize: '13px', fontWeight: 700 }}>
                ✓ Contact Saved
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ml-grey)', margin: '4px 0 10px' }}>
            Emergency contact details stored for safe-zone alerts and immediate dispatch.
          </p>

          <form onSubmit={handleSaveContact} className="ml-contact-form-grid">
            <input
              type="text"
              placeholder="Caregiver Name (e.g. Sarah)"
              value={caregiverContact.name}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, name: e.target.value }))}
              className="ml-contact-input"
            />
            <input
              type="tel"
              placeholder="Phone Number (e.g. +1 555-0199)"
              value={caregiverContact.phone}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, phone: e.target.value }))}
              className="ml-contact-input"
            />
            <input
              type="text"
              placeholder="Relationship (e.g. Daughter)"
              value={caregiverContact.relationship || ''}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, relationship: e.target.value }))}
              className="ml-contact-input"
            />
            <button
              type="submit"
              className="ml-btn-action ml-btn-primary"
              style={{ padding: '10px 18px', fontSize: '14px', justifyContent: 'center' }}
            >
              💾 Save Contact Info
            </button>
          </form>
        </div>
      </section>

      {/* Breach Alert History (Requirement 6) */}
      <section className="ml-alert-history-card" aria-label="Breach Alert History">
        <div className="ml-alert-history-header">
          <h3 className="ml-alert-history-title">Safe Zone Breach &amp; Alert History</h3>
          {alertHistory && alertHistory.length > 0 && (
            <button
              type="button"
              onClick={handleClearAlertHistory}
              className="ml-btn-action ml-btn-secondary"
              style={{ fontSize: '13px', padding: '6px 14px' }}
            >
              Clear History
            </button>
          )}
        </div>
        {!alertHistory || alertHistory.length === 0 ? (
          <p style={{ color: 'var(--ml-grey)', fontSize: '14px', margin: 0 }}>
            No safe-zone breach alerts recorded. Patient has remained safely within radius.
          </p>
        ) : (
          <div className="ml-alert-history-list">
            {alertHistory.map((alert) => (
              <div
                key={alert.id}
                className={`ml-alert-item ml-alert-item-${alert.type === 'initial_breach' ? 'initial' : alert.type === 'repeat_breach' ? 'repeat' : 'resolved'}`}
              >
                <div className="ml-alert-item-info">
                  <div className="ml-alert-item-title">
                    {alert.type === 'initial_breach' && '🚨 Safe-Zone Exit Alert'}
                    {alert.type === 'repeat_breach' && `⚠️ Continuous Breach Alert #${alert.alertCount || 2}`}
                    {alert.type === 'resolved' && '✅ Patient Returned Inside Safe Zone'}
                  </div>
                  <p className="ml-alert-item-desc">
                    {alert.message || (
                      alert.type === 'resolved'
                        ? `Returned within ${alert.radiusMeters}m safe zone (was outside for ${formatTimeOutside(alert.totalBreachDurationMs)}).`
                        : `${formatDistance(alert.distanceMeters)} from home (${alert.radiusMeters}m limit) • Outside for ${formatTimeOutside(alert.timeOutsideMs)}`
                    )}
                  </p>
                </div>
                <div className="ml-alert-item-time">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Movement History Timeline */}
      <LocationHistory
        history={history}
        selectedHistoryId={selectedHistoryPoint?.id}
        onSelectHistoryPoint={handleSelectHistoryPoint}
        onClearHistory={handleClearHistory}
      />

      {/* Architecture Disclosure Card */}
      <div className="ml-architecture-notice" role="contentinfo">
        <strong>Cross-Device Monitoring Notice (Prototype Disclosure):</strong>
        In this local prototype, GPS readings and caregiver settings are stored in this browser session.
        For production remote caregiver monitoring across separate devices, the patient&apos;s mobile device
        securely posts GPS telemetry to a cloud database, and the caregiver&apos;s phone subscribes to real-time updates.
      </div>
    </div>
  );
}
