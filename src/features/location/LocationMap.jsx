import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * LocationMap.jsx - Interactive OpenStreetMap using Leaflet
 *
 * Responsibilities:
 * - Render patient current live location marker with pulsing turquoise ring
 * - Render selected historical point marker with distinct deep navy styling
 * - Render caregiver-configured home location marker
 * - Render configurable circular safe-zone boundary
 * - Render movement trail polyline connecting chronological breadcrumb points
 * - Allow caregiver to click the map to select or change the home location
 * - Map zoom controls and instant recentering actions (Patient, Home, Selected History, View Both)
 * - Gracefully handle missing/denied GPS without rendering fake patient markers
 */
export default function LocationMap({
  patientLocation,
  homeLocation,
  radiusMeters,
  history = [],
  selectedHistoryPoint = null,
  onClearSelectedHistory = null,
  onSetHomeFromMap,
  isSettingHome = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const patientAccuracyCircleRef = useRef(null);
  const homeMarkerRef = useRef(null);
  const safeZoneCircleRef = useRef(null);
  const trailPolylineRef = useRef(null);
  const historyMarkerRef = useRef(null);
  const hasInitiallyCenteredRef = useRef(false);

  // 1. Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on patient if present, or home if present, or default fallback coordinate
    const initialLat = patientLocation?.lat || homeLocation?.lat || 12.9716;
    const initialLng = patientLocation?.lng || homeLocation?.lng || 77.5946;
    const initialZoom = patientLocation || homeLocation ? 16 : 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap standard tile layer (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Center map smoothly on the very first live patient coordinate received
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !patientLocation) return;

    if (!hasInitiallyCenteredRef.current) {
      hasInitiallyCenteredRef.current = true;
      map.setView([patientLocation.lat, patientLocation.lng], 16, { animate: true });
    }
  }, [patientLocation]);

  // 3. Handle caregiver click to set/adjust home
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isSettingHome && onSetHomeFromMap) {
        onSetHomeFromMap({
          lat: Number(e.latlng.lat),
          lng: Number(e.latlng.lng),
          address: 'Selected on Map',
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isSettingHome, onSetHomeFromMap]);

  // 4. Update Patient Location Marker & Accuracy Ring
  // If GPS is unavailable/denied, patientLocation is null, and no fake marker is shown.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!patientLocation) {
      if (patientMarkerRef.current) {
        patientMarkerRef.current.remove();
        patientMarkerRef.current = null;
      }
      if (patientAccuracyCircleRef.current) {
        patientAccuracyCircleRef.current.remove();
        patientAccuracyCircleRef.current = null;
      }
      return;
    }

    const patientLatLng = [patientLocation.lat, patientLocation.lng];

    // High-contrast turquoise pulsing live patient pin
    const patientIcon = L.divIcon({
      className: 'ml-map-patient-pin',
      html: `
        <div class="ml-patient-marker-outer" role="img" aria-label="Patient Live Location Pin">
          <div class="ml-patient-marker-pulse"></div>
          <div class="ml-patient-marker-core"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const popupContent = `
      <div style="font-family: inherit; font-size: 13px; color: #101D2D;">
        <strong style="color: #08B9A5;">📍 Patient Live Location</strong><br/>
        <span>Lat: ${patientLocation.lat.toFixed(5)}</span><br/>
        <span>Lng: ${patientLocation.lng.toFixed(5)}</span><br/>
        ${patientLocation.accuracy ? `<span style="color: #667579;">Accuracy: ±${Math.round(patientLocation.accuracy)}m</span>` : ''}
      </div>
    `;

    if (!patientMarkerRef.current) {
      patientMarkerRef.current = L.marker(patientLatLng, {
        icon: patientIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(popupContent);
    } else {
      patientMarkerRef.current.setLatLng(patientLatLng);
      patientMarkerRef.current.setPopupContent(popupContent);
    }

    // Accuracy Circle around patient
    if (patientLocation.accuracy && patientLocation.accuracy > 0) {
      if (!patientAccuracyCircleRef.current) {
        patientAccuracyCircleRef.current = L.circle(patientLatLng, {
          radius: patientLocation.accuracy,
          color: '#08B9A5',
          fillColor: '#08B9A5',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 6',
        }).addTo(map);
      } else {
        patientAccuracyCircleRef.current.setLatLng(patientLatLng);
        patientAccuracyCircleRef.current.setRadius(patientLocation.accuracy);
      }
    }
  }, [patientLocation]);

  // 5. Update Selected Historical Point Marker & View
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedHistoryPoint) {
      if (historyMarkerRef.current) {
        historyMarkerRef.current.remove();
        historyMarkerRef.current = null;
      }
      return;
    }

    const historyLatLng = [selectedHistoryPoint.lat, selectedHistoryPoint.lng];

    const historyIcon = L.divIcon({
      className: 'ml-map-history-pin',
      html: `
        <div class="ml-history-marker-core" role="img" aria-label="Historical Location Pin">
          <span>🕒</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const timeStr = new Date(selectedHistoryPoint.timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    const historyPopup = `
      <div style="font-family: inherit; font-size: 13px; color: #101D2D;">
        <strong style="color: #101D2D;">🕒 Past Location (${timeStr})</strong><br/>
        <span>Lat: ${selectedHistoryPoint.lat.toFixed(5)}</span><br/>
        <span>Lng: ${selectedHistoryPoint.lng.toFixed(5)}</span><br/>
        ${selectedHistoryPoint.distanceFromHome !== null ? `<span style="color: #0A6A5E;">Distance from Home: ${selectedHistoryPoint.distanceFromHome}m</span><br/>` : ''}
        <span style="color: #667579;">Accuracy: ±${Math.round(selectedHistoryPoint.accuracy || 0)}m</span>
      </div>
    `;

    if (!historyMarkerRef.current) {
      historyMarkerRef.current = L.marker(historyLatLng, {
        icon: historyIcon,
        zIndexOffset: 1200,
      })
        .addTo(map)
        .bindPopup(historyPopup);
    } else {
      historyMarkerRef.current.setLatLng(historyLatLng);
      historyMarkerRef.current.setPopupContent(historyPopup);
    }

    // Pan smoothly to the selected historical point
    map.setView(historyLatLng, 17, { animate: true });
    historyMarkerRef.current.openPopup();
  }, [selectedHistoryPoint]);

  // 6. Update Home Location Marker & Safe Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!homeLocation) {
      if (homeMarkerRef.current) {
        homeMarkerRef.current.remove();
        homeMarkerRef.current = null;
      }
      if (safeZoneCircleRef.current) {
        safeZoneCircleRef.current.remove();
        safeZoneCircleRef.current = null;
      }
      return;
    }

    const homeLatLng = [homeLocation.lat, homeLocation.lng];

    // Home Icon
    const homeIcon = L.divIcon({
      className: 'ml-map-home-pin',
      html: `
        <div class="ml-home-marker-core" role="img" aria-label="Home Base Pin">
          <span class="ml-home-marker-icon">🏠</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const homePopup = `
      <div style="font-family: inherit; font-size: 13px; color: #101D2D;">
        <strong style="color: #101D2D;">🏠 Configured Home Base</strong><br/>
        <span>${homeLocation.address || 'Saved Home'}</span><br/>
        <span style="color: #667579;">Safe Radius: ${radiusMeters || 200}m</span>
      </div>
    `;

    if (!homeMarkerRef.current) {
      homeMarkerRef.current = L.marker(homeLatLng, {
        icon: homeIcon,
        zIndexOffset: 900,
      })
        .addTo(map)
        .bindPopup(homePopup);
    } else {
      homeMarkerRef.current.setLatLng(homeLatLng);
      homeMarkerRef.current.setPopupContent(homePopup);
    }

    // Safe Radius Boundary Circle (Visual reference only - zero alarms)
    const radius = radiusMeters || 200;
    if (!safeZoneCircleRef.current) {
      safeZoneCircleRef.current = L.circle(homeLatLng, {
        radius,
        color: '#101D2D',
        fillColor: '#D0F2EC',
        fillOpacity: 0.28,
        weight: 2,
        dashArray: '5, 8',
      }).addTo(map);
    } else {
      safeZoneCircleRef.current.setLatLng(homeLatLng);
      safeZoneCircleRef.current.setRadius(radius);
    }
  }, [homeLocation, radiusMeters]);

  // 7. Update Movement Trail Polyline from history
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!history || history.length < 2) {
      if (trailPolylineRef.current) {
        trailPolylineRef.current.remove();
        trailPolylineRef.current = null;
      }
      return;
    }

    // History is stored most-recent first; reverse for natural chronological polyline
    const chronological = [...history].reverse();
    const latLngs = chronological.map((pt) => [pt.lat, pt.lng]);

    if (!trailPolylineRef.current) {
      trailPolylineRef.current = L.polyline(latLngs, {
        color: '#08B9A5',
        weight: 3.5,
        opacity: 0.65,
        dashArray: '4, 8',
        lineCap: 'round',
      }).addTo(map);
    } else {
      trailPolylineRef.current.setLatLngs(latLngs);
    }
  }, [history]);

  // Helper action: Recenter on Patient
  const handleCenterPatient = () => {
    if (mapInstanceRef.current && patientLocation) {
      mapInstanceRef.current.setView([patientLocation.lat, patientLocation.lng], 16, {
        animate: true,
      });
    }
  };

  // Helper action: Recenter on Home
  const handleCenterHome = () => {
    if (mapInstanceRef.current && homeLocation) {
      mapInstanceRef.current.setView([homeLocation.lat, homeLocation.lng], 16, {
        animate: true,
      });
    }
  };

  // Helper action: Fit bounds to see both Patient and Home
  const handleFitBoth = () => {
    if (mapInstanceRef.current && patientLocation && homeLocation) {
      const bounds = L.latLngBounds([
        [patientLocation.lat, patientLocation.lng],
        [homeLocation.lat, homeLocation.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  return (
    <div className="ml-map-wrapper">
      <div
        ref={mapContainerRef}
        className={`ml-map-canvas ${isSettingHome ? 'ml-map-canvas-selecting' : ''}`}
        aria-label="Interactive patient location map"
      />

      {/* Quick Recentering Actions Toolbar */}
      <div className="ml-map-quick-actions" role="toolbar" aria-label="Map Navigation Actions">
        {patientLocation && (
          <button
            type="button"
            className="ml-map-action-btn"
            onClick={handleCenterPatient}
            title="Center map on patient's current location"
          >
            🎯 Recenter Patient
          </button>
        )}
        {homeLocation && (
          <button
            type="button"
            className="ml-map-action-btn"
            onClick={handleCenterHome}
            title="Center map on home base"
          >
            🏠 Center Home
          </button>
        )}
        {patientLocation && homeLocation && (
          <button
            type="button"
            className="ml-map-action-btn"
            onClick={handleFitBoth}
            title="Fit both patient and home in view"
          >
            📐 View Both
          </button>
        )}
      </div>

      {/* Interactive Map-Click Prompt for Caregivers */}
      {isSettingHome && (
        <div className="ml-map-instruction-banner" role="status">
          <span>👆 Click anywhere on the map to set that spot as the Home base.</span>
        </div>
      )}

      {/* Selected Historical Location Floating Banner */}
      {selectedHistoryPoint && (
        <div className="ml-map-selected-history-banner" role="status">
          <span>
            🕒 Viewing recorded point from{' '}
            {new Date(selectedHistoryPoint.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          {onClearSelectedHistory && (
            <button
              type="button"
              className="ml-btn-dismiss-history-pin"
              onClick={onClearSelectedHistory}
              aria-label="Return to live map view"
            >
              ✕ Close
            </button>
          )}
        </div>
      )}

      {/* Empty State Banner if GPS is waiting or unavailable */}
      {!patientLocation && (
        <div className="ml-map-overlay-notice">
          <span>📍 Waiting for live GPS coordinates...</span>
        </div>
      )}
    </div>
  );
}
