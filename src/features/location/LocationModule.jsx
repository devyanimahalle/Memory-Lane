import React, { useState, useEffect } from 'react';
import './location.css';
import LocationMap from './LocationMap';
import LocationHistory from './LocationHistory';
import { GPS_STATUS, formatLastUpdated, getAccuracyRating, isLocationStale } from './geolocation';
import {
  calculateHaversineDistance,
  formatDistance,
  evaluateSafeZone,
  RADIUS_PRESETS,
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
import { clearSharedHistory, useSharedLocation } from './locationShare';

/**
 * LocationModule.jsx - Caregiver view of the shared location (browser-local prototype)
 *
 * The PATIENT experience starts and stops location sharing after explicit consent (see
 * locationShare.js and the patient's "Location sharing" card). This dashboard only displays what was
 * shared in this same browser: current position, distance from home, safe-zone status, GPS accuracy,
 * movement history and safe-zone alerts. The caregiver's own device is never tracked, and nothing is
 * sent to another device or browser. The caregiver configures home, radius presets or a custom radius.
 */
export default function LocationModule() {
  // Shared location written by the patient's device (same browser): read only here.
  const shared = useSharedLocation();
  const isTrackingEnabled = shared.sharing;
  const gpsStatus = shared.status;
  const gpsError = shared.error;
  const currentPosition = shared.position;
  const history = shared.history;
  const [nowTick, setNowTick] = useState(() => Date.now());
  const isStale = Boolean(currentPosition?.timestamp) && isLocationStale(currentPosition.timestamp, nowTick);

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

  // Caregiver contact configuration (no hardcoding)
  const [caregiverContact, setCaregiverContact] = useState(() => loadCaregiverContact() || { name: '', phone: '', relationship: '' });
  const [contactSavedNotice, setContactSavedNotice] = useState(false);

  // Active safe-zone breach & alert history (synced from localStorage)
  const [activeBreach, setActiveBreach] = useState(() => loadActiveBreach());
  const [alertHistory, setAlertHistory] = useState(() => loadAlertHistory());

  // Map selection
  const [selectedHistoryPoint, setSelectedHistoryPoint] = useState(null);

  // Refresh the clock, active breach and alert history every second (written by the patient device).
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
      setActiveBreach(loadActiveBreach());
      setAlertHistory(loadAlertHistory());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
  // Uses the patient's latest shared position as home. Never set automatically.
  const handleUseCurrentAsHome = () => {
    if (!currentPosition) return;
    const newHome = {
      lat: currentPosition.lat,
      lng: currentPosition.lng,
      address: 'Patient\'s last shared position',
    };
    saveHome(newHome);
    setHomeLocation(newHome);
    setIsSettingHomeFromMap(false);
  };

  // Caregiver Action: Set Home from Map Click
  const handleSetHomeFromMap = (coords) => {
    saveHome(coords);
    setHomeLocation(coords);
    setIsSettingHomeFromMap(false);
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
    clearSharedHistory();
    setSelectedHistoryPoint(null);
  };

  // Helper status badge renderer
  const renderStatusBadge = () => {
    if (!isTrackingEnabled) {
      return (
        <span className="ml-status-pill-gps ml-status-idle">
          Sharing is off
        </span>
      );
    }
    if (gpsStatus === GPS_STATUS.ACTIVE) {
      if (isStale) {
        return (
          <span className="ml-status-pill-gps ml-status-requesting" title="No GPS update in past 60s">
            Signal delayed
          </span>
        );
      }
      return (
        <span className="ml-status-pill-gps ml-status-active">
          <span className="ml-status-dot-active" aria-hidden="true" />
          Sharing live
        </span>
      );
    }
    if (gpsStatus === GPS_STATUS.REQUESTING) {
      return (
        <span className="ml-status-pill-gps ml-status-requesting">
          Acquiring GPS...
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
          GPS unavailable
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
    <div className="ml-location-module" role="region" aria-label="Patient location (this browser)">
      {/* Header */}
      <header className="ml-location-header">
        <div className="ml-location-header-top">
          <h2 className="ml-location-title">Patient location (this browser)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {renderStatusBadge()}
          </div>
        </div>
        <p className="ml-location-subtitle">
          What the patient chose to share in this browser: position, safe reference radius and movement trail.
        </p>
      </header>

      {/* Prototype disclosure and consent status */}
      <div className="ml-transparency-card" role="note">
        <p className="ml-transparency-text">
          <strong>Prototype notice:</strong> location sharing is started and stopped by the patient, on the
          patient's screen, only after they say yes. This page shows what was shared in this same browser.
          Your own device is not tracked, and nothing is sent to another device or browser.
          {!isTrackingEnabled && ' Sharing is currently off, so no position is shown.'}
        </p>
      </div>

      {/* Active Safe-Zone Breach Alert Banner (Requirements 4, 5, 6) */}
      {activeBreach && activeBreach.active && (
        <div className="ml-caregiver-breach-alert" role="alert">
          <div className="ml-caregiver-breach-header">
            <h4 className="ml-caregiver-breach-title">
              Patient outside the safe zone
            </h4>
            <span className="ml-caregiver-breach-badge">
              Recorded {activeBreach.alertCount} time(s)
            </span>
          </div>
          <p className="ml-caregiver-breach-body">
            Patient has exited the designated safe radius ({formatDistance(safeRadius)}).
            This is recorded here in this browser only; no message was sent to anyone.
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
        <div className="ml-transparency-card" style={{ borderColor: 'var(--color-attention)', background: 'var(--color-attention-soft)', color: 'var(--color-attention-ink)' }}>
          
          <p className="ml-transparency-text">
            <strong>Location status:</strong> {gpsError}
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
              ? `Recorded in this browser (#${activeBreach.alertCount})`
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
          style={{ borderColor: 'var(--color-attention)', background: 'var(--color-attention-soft)', color: 'var(--color-attention-ink)', marginBottom: 0 }}
          role="alert"
        >
          
          <p className="ml-transparency-text">
            <strong>Safe location not configured.</strong> Safe-zone checks will not run
            until a home base is set. Click the map or use the patient's latest position below to configure one.
          </p>
        </div>
      )}

      {/* Caregiver Settings & Safe Zone Controls */}
      <section className="ml-settings-card" aria-label="Caregiver Controls">
        <h3 className="ml-settings-title">Configure Patient Safe Location &amp; Radius</h3>

        {/* ── Home Base Status & Map/GPS Actions ── */}
        <div className="ml-settings-group">
          <label className="ml-settings-label">
            Current Home Base:{' '}
            <span style={{ fontWeight: 400, color: homeLocation ? 'var(--color-accent)' : 'var(--ml-grey)' }}>
              {homeLocation
                ? `${homeLocation.address ? homeLocation.address.substring(0, 60) + (homeLocation.address.length > 60 ? '…' : '') : 'Saved'} (${homeLocation.lat.toFixed(4)}, ${homeLocation.lng.toFixed(4)})`
                : 'Not configured'}
            </span>
          </label>

          <div className="ml-actions-row">
            <button
              type="button"
              className={`ml-btn-action ml-btn-secondary ${isSettingHomeFromMap ? 'ml-radius-btn-active' : ''}`}
              onClick={() => setIsSettingHomeFromMap((prev) => !prev)}
            >
              {isSettingHomeFromMap ? 'Cancel map selection' : 'Click map to set home'}
            </button>

            <button
              type="button"
              className="ml-btn-action ml-btn-secondary"
              onClick={handleUseCurrentAsHome}
              disabled={!currentPosition}
              title={!currentPosition ? 'Waiting for the patient to share a position' : 'Use the patient\'s latest shared position as home base'}
            >
              Use patient's latest position
            </button>

          </div>
        </div>

        {/* ── Safe Zone Radius ── */}
        <div className="ml-settings-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="ml-settings-label" style={{ margin: 0 }}>
              Safe Zone Radius: <span style={{ color: 'var(--ml-turquoise-dk)', fontWeight: 800 }}>{formatDistance(safeRadius)}</span>
            </label>
            <span style={{ fontSize: '13px', color: 'var(--ml-grey)' }}>
              Recorded here when the patient leaves the zone
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
              Caregiver contact:
            </label>
            {contactSavedNotice && (
              <span style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 700 }}>
                Contact saved
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ml-grey)', margin: '4px 0 10px' }}>
            Contact details are saved in this browser only. No message is sent.
          </p>

          <form onSubmit={handleSaveContact} className="ml-contact-form-grid">
            <input
              type="text"
              placeholder="Caregiver name"
              value={caregiverContact.name}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, name: e.target.value }))}
              className="ml-contact-input"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={caregiverContact.phone}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, phone: e.target.value }))}
              className="ml-contact-input"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={caregiverContact.relationship || ''}
              onChange={(e) => setCaregiverContact((prev) => ({ ...prev, relationship: e.target.value }))}
              className="ml-contact-input"
            />
            <button
              type="submit"
              className="ml-btn-action ml-btn-primary"
              style={{ padding: '10px 18px', fontSize: '14px', justifyContent: 'center' }}
            >
              Save contact
            </button>
          </form>
        </div>
      </section>

      {/* Breach Alert History (Requirement 6) */}
      <section className="ml-alert-history-card" aria-label="Breach Alert History">
        <div className="ml-alert-history-header">
          <h3 className="ml-alert-history-title">Safe-zone history (recorded in this browser)</h3>
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
            Nothing recorded. No time outside the safe zone has been seen.
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
                    {alert.type === 'initial_breach' && 'Left the safe zone'}
                    {alert.type === 'repeat_breach' && `Still outside (#${alert.alertCount || 2})`}
                    {alert.type === 'resolved' && 'Back inside the safe zone'}
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

      {/* Architecture disclosure */}
      <div className="ml-architecture-notice" role="contentinfo">
        <strong>Browser-local simulation:</strong> the patient's screen and this page share one browser's
        storage. There is no cross-device or cross-browser tracking, and no real notification is sent. A real
        service would need the patient's phone to send its location to a server and the caregiver's phone to
        read it from there, with the same consent. The map loads its tiles from OpenStreetMap.
      </div>
    </div>
  );
}
