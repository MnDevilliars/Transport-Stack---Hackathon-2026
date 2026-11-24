import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function TransitMap({
  stops,
  selectedOption,
  liveBuses,
  originId,
  destinationId
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routePolylines: [],
    stopMarkers: [],
    busMarkers: []
  });

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Delhi NCR
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: true
    });

    // Clean OpenStreetMap tiles with dark transit styling (Zero Watermark / 100% Free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles-dark'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polylines and Stop Markers when selectedOption or stops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old route layers
    layersRef.current.routePolylines.forEach(layer => layer.remove());
    layersRef.current.stopMarkers.forEach(layer => layer.remove());
    layersRef.current.routePolylines = [];
    layersRef.current.stopMarkers = [];

    const boundsLatLngs = [];

    if (selectedOption && selectedOption.legs) {
      selectedOption.legs.forEach(leg => {
        if (!leg.segments) return;

        leg.segments.forEach(seg => {
          const p1 = [seg.from.lat, seg.from.lng];
          const p2 = [seg.to.lat, seg.to.lng];
          boundsLatLngs.push(p1, p2);

          // Polyline with congestion color
          const polyline = L.polyline([p1, p2], {
            color: seg.congestionColor || '#3b82f6',
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
              <b style="color: #60a5fa;">Route Segment:</b> ${seg.from.name} ➔ ${seg.to.name}<br/>
              <b>Distance:</b> ${seg.distanceKm} km<br/>
              <b>Traffic Speed:</b> <span style="color: ${seg.congestionColor}; font-weight: bold;">${seg.effectiveSpeedKmh} km/h</span><br/>
              <b>Congestion:</b> ${seg.congestionLevel}<br/>
              <b>Travel Time:</b> ${Math.round(seg.totalTimeMin)} mins (${Math.round(seg.runningTimeMin)}m moving + ${Math.round(seg.dwellTimeMin)}m dwell)
            </div>
          `);

          layersRef.current.routePolylines.push(polyline);
        });

        // Add Stop Pins for this route
        if (leg.stopsSequence) {
          leg.stopsSequence.forEach((stp, idx) => {
            const isOrigin = stp.id === originId;
            const isDestination = stp.id === destinationId;

            let markerColor = '#64748b'; // default slate
            let radius = 6;

            if (isOrigin) {
              markerColor = '#10b981'; // Green
              radius = 10;
            } else if (isDestination) {
              markerColor = '#ef4444'; // Red
              radius = 10;
            } else if (stp.isMajorHub) {
              markerColor = '#f59e0b'; // Amber hub
              radius = 8;
            }

            const marker = L.circleMarker([stp.lat, stp.lng], {
              radius,
              fillColor: markerColor,
              color: '#ffffff',
              weight: isOrigin || isDestination ? 3 : 1.5,
              opacity: 1,
              fillOpacity: 0.95
            }).addTo(map);

            marker.bindPopup(`
              <div style="font-size: 12px;">
                <b style="color: ${markerColor};">${isOrigin ? '📍 Origin: ' : isDestination ? '🏁 Destination: ' : '🚏 '}${stp.name}</b><br/>
                <span style="color: #94a3b8; font-size: 11px;">Zone: ${stp.zone || 'Delhi Transit'}</span><br/>
                ${stp.interchange ? `<span style="font-size: 10px; color: #cbd5e1;">Interchange: ${stp.interchange.join(', ')}</span>` : ''}
              </div>
            `);

            layersRef.current.stopMarkers.push(marker);
          });
        }
      });

      // Fit map bounds to view the full journey
      if (boundsLatLngs.length > 0) {
        map.fitBounds(boundsLatLngs, { padding: [50, 50], maxZoom: 14 });
      }
    } else if (stops && stops.length > 0) {
      // Display all Delhi stops as subtle dots
      stops.forEach(stp => {
        const marker = L.circleMarker([stp.lat, stp.lng], {
          radius: stp.isMajorHub ? 6 : 4,
          fillColor: stp.isMajorHub ? '#3b82f6' : '#475569',
          color: '#0f172a',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-size: 12px;">
            <b>🚏 ${stp.name}</b><br/>
            <span style="color: #94a3b8; font-size: 11px;">Zone: ${stp.zone}</span>
          </div>
        `);

        layersRef.current.stopMarkers.push(marker);
      });
    }
  }, [selectedOption, stops, originId, destinationId]);

  // Update Live Buses
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old bus markers
    layersRef.current.busMarkers.forEach(layer => layer.remove());
    layersRef.current.busMarkers = [];

    if (liveBuses && liveBuses.length > 0) {
      liveBuses.forEach(bus => {
        const customIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              background: #0f172a;
              border: 1.5px solid ${bus.routeColor || '#3b82f6'};
              border-radius: 9999px;
              padding: 2px 6px;
              color: white;
              font-size: 10px;
              font-family: monospace;
              font-weight: bold;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
              white-space: nowrap;
            ">
              <span>🚌</span>
              <span style="color: ${bus.routeColor || '#60a5fa'}">${bus.routeNumber}</span>
              <span style="background: rgba(255,255,255,0.15); padding: 0 3px; border-radius: 4px; font-size: 9px;">${bus.speedKmh}k</span>
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const busMarker = L.marker([bus.currentLat, bus.currentLng], { icon: customIcon }).addTo(map);

        busMarker.bindPopup(`
          <div style="font-size: 12px; line-height: 1.4;">
            <b style="color: #60a5fa;">DTC Fleet Telemetry</b><br/>
            <b>Vehicle:</b> ${bus.vehicleId}<br/>
            <b>Route:</b> ${bus.routeNumber} (${bus.routeName})<br/>
            <b>Live GPS Speed:</b> <b style="color: #22c55e;">${bus.speedKmh} km/h</b><br/>
            <b>Next Stop:</b> ${bus.nextStop}<br/>
            <b>Crowd Level:</b> ${bus.occupancy}<br/>
            <b>Driver:</b> ${bus.driverName}
          </div>
        `);

        layersRef.current.busMarkers.push(busMarker);
      });
    }
  }, [liveBuses]);

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[720px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs space-y-1.5 shadow-xl pointer-events-none">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
          Traffic Velocity Model
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;25 km/h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 15-25 km/h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;15 km/h (Gridlock)
          </span>
        </div>
      </div>

      {/* Live Fleet Counter Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-mono text-[11px]">
          {liveBuses?.length || 0} DTC Buses Live
        </span>
      </div>
    </div>
  );
}

