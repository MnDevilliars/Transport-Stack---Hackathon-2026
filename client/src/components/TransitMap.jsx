import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function TransitMap({
  stops,
  selectedOption,
  liveBuses,
  originId,
  destinationId,
  mobileTab = 'planner'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const boundsRef = useRef([]);
  const layersRef = useRef({
    routeHaloPolylines: [],
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

    // Clean, crisp OpenStreetMap tiles with aggressive buffer preloading
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      keepBuffer: 8,
      updateWhenIdle: false,
      updateWhenZooming: false
    }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger initial size check
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ResizeObserver to handle container size / tab visibility changes automatically
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Whenever mobileTab or window size changes, invalidate size and re-fit bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();
    const t1 = setTimeout(() => {
      map.invalidateSize();
      if (boundsRef.current && boundsRef.current.length > 0) {
        map.fitBounds(boundsRef.current, { padding: [40, 40], maxZoom: 14 });
      }
    }, 100);

    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mobileTab]);

  // Update Route Polylines and Stop Markers when selectedOption or stops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old route layers
    layersRef.current.routeHaloPolylines.forEach(layer => layer.remove());
    layersRef.current.routePolylines.forEach(layer => layer.remove());
    layersRef.current.stopMarkers.forEach(layer => layer.remove());
    layersRef.current.routeHaloPolylines = [];
    layersRef.current.routePolylines = [];
    layersRef.current.stopMarkers = [];

    const boundsLatLngs = [];

    if (selectedOption && selectedOption.legs) {
      selectedOption.legs.forEach(leg => {
        // If high-resolution road-snapped coordinates are available from OSRM, render them!
        if (leg.roadCoordinates && leg.roadCoordinates.length > 1) {
          leg.roadCoordinates.forEach(pt => boundsLatLngs.push(pt));

          // 1. Thick Outer White Halo along actual road curves (Weight 15)
          const halo = L.polyline(leg.roadCoordinates, {
            color: '#ffffff',
            weight: 15,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          layersRef.current.routeHaloPolylines.push(halo);

          // 2. Thick Core Route Line hugging the asphalt road curves (Weight 9)
          const polyline = L.polyline(leg.roadCoordinates, {
            color: leg.routeColor || '#10b981',
            weight: 9,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; padding: 4px;">
              <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px;">🚌 Actual Delhi Road Route</div>
              <div style="color: #334155; font-weight: 600;">${leg.routeName}</div>
              <div style="margin-top: 6px; font-size: 11px; color: #64748b;">
                Following real Delhi arterial street network & flyovers.
              </div>
            </div>
          `);

          layersRef.current.routePolylines.push(polyline);
        } else if (leg.segments) {
          // Fallback if road coordinates not generated
          leg.segments.forEach(seg => {
            const p1 = [seg.from.lat, seg.from.lng];
            const p2 = [seg.to.lat, seg.to.lng];
            boundsLatLngs.push(p1, p2);

            const halo = L.polyline([p1, p2], {
              color: '#ffffff',
              weight: 14,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            layersRef.current.routeHaloPolylines.push(halo);

            const polyline = L.polyline([p1, p2], {
              color: seg.congestionColor || '#10b981',
              weight: 9,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            layersRef.current.routePolylines.push(polyline);
          });
        }

        // Add Prominent Stops (Origin, Destination, Intermediate)
        if (leg.stopsSequence) {
          leg.stopsSequence.forEach((stp, idx) => {
            const isOrigin = stp.id === originId;
            const isDestination = stp.id === destinationId;

            if (isOrigin) {
              // Prominent "My Location" Beacon Pin
              const originIcon = L.divIcon({
                className: 'origin-marker',
                html: `
                  <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                    <div style="
                      position: absolute;
                      width: 36px;
                      height: 36px;
                      border-radius: 50%;
                      background: rgba(59, 130, 246, 0.3);
                      animation: ripple 2s infinite ease-out;
                    "></div>
                    <div style="
                      background: #2563eb;
                      color: white;
                      font-weight: 800;
                      font-size: 11px;
                      padding: 4px 10px;
                      border-radius: 20px;
                      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.5);
                      border: 2px solid white;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      white-space: nowrap;
                    ">
                      <span>📍 My Location</span>
                    </div>
                  </div>
                `,
                iconSize: [110, 32],
                iconAnchor: [55, 16]
              });

              const marker = L.marker([stp.lat, stp.lng], { icon: originIcon }).addTo(map);
              marker.bindPopup(`<b>📍 My Boarding Location:</b><br/>${stp.name}`);
              layersRef.current.stopMarkers.push(marker);
            } else if (isDestination) {
              // Prominent "Destination" Pin
              const destIcon = L.divIcon({
                className: 'dest-marker',
                html: `
                  <div style="
                    background: #f97316;
                    color: white;
                    font-weight: 800;
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
                    border: 2px solid white;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                  ">
                    <span>🏁 Destination: ${stp.name.split(' ')[0]}</span>
                  </div>
                `,
                iconSize: [140, 32],
                iconAnchor: [70, 16]
              });

              const marker = L.marker([stp.lat, stp.lng], { icon: destIcon }).addTo(map);
              marker.bindPopup(`<b>🏁 Destination:</b><br/>${stp.name}`);
              layersRef.current.stopMarkers.push(marker);
            } else {
              // Clean Intermediate Stop Pin
              const marker = L.circleMarker([stp.lat, stp.lng], {
                radius: stp.isMajorHub ? 7 : 5,
                fillColor: '#ffffff',
                color: '#0f172a',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 1
              }).addTo(map);

              marker.bindPopup(`
                <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
                  🚏 ${stp.name}
                  ${stp.interchange ? `<div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">Lines: ${stp.interchange.join(', ')}</div>` : ''}
                </div>
              `);

              layersRef.current.stopMarkers.push(marker);
            }
          });
        }
      });

      // Fit map bounds to view the full journey
      boundsRef.current = boundsLatLngs;
      if (boundsLatLngs.length > 0) {
        map.fitBounds(boundsLatLngs, { padding: [60, 60], maxZoom: 14 });
      }
    } else if (stops && stops.length > 0) {
      // Display all Delhi stops
      stops.forEach(stp => {
        const marker = L.circleMarker([stp.lat, stp.lng], {
          radius: stp.isMajorHub ? 6 : 4,
          fillColor: stp.isMajorHub ? '#10b981' : '#94a3b8',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-size: 12px; font-weight: bold;">
            🚏 ${stp.name}<br/>
            <span style="color: #64748b; font-size: 11px; font-weight: normal;">Zone: ${stp.zone}</span>
          </div>
        `);

        layersRef.current.stopMarkers.push(marker);
      });
    }
  }, [selectedOption, stops, originId, destinationId]);

  // Update Live Buses with Proper SVG Bus Icons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old bus markers
    layersRef.current.busMarkers.forEach(layer => layer.remove());
    layersRef.current.busMarkers = [];

    if (liveBuses && liveBuses.length > 0) {
      liveBuses.forEach(bus => {
        const busColor = bus.routeColor || '#10b981';

        // Proper SVG Bus Icon inside a modern floating card (Matching Image 2 Reference)
        const customIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              background: #ffffff;
              border: 2px solid ${busColor};
              border-radius: 9999px;
              padding: 3px 8px 3px 6px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
              cursor: pointer;
              white-space: nowrap;
              gap: 5px;
            ">
              <!-- SVG Bus Icon -->
              <div style="
                background: ${busColor};
                color: white;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6v6"/>
                  <path d="M15 6v6"/>
                  <path d="M2 12h19.6"/>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.4-1.2-.8-1.5-.7-.5-1.7-.5-2.2-.5H4c-.5 0-1.5 0-2.2.5-.4.3-.8.9-.8 1.5 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>
              </div>

              <!-- Route Number -->
              <span style="
                font-family: monospace;
                font-size: 11px;
                font-weight: 800;
                color: #0f172a;
              ">
                ${bus.routeNumber}
              </span>

              <!-- Live Speed Badge -->
              <span style="
                background: #ecfdf5;
                color: #047857;
                border: 1px solid #a7f3d0;
                border-radius: 6px;
                padding: 1px 4px;
                font-size: 9px;
                font-weight: 700;
                font-family: monospace;
              ">
                ${bus.speedKmh}k
              </span>
            </div>
          `,
          iconSize: [88, 30],
          iconAnchor: [44, 15]
        });

        const busMarker = L.marker([bus.currentLat, bus.currentLng], { icon: customIcon }).addTo(map);

        busMarker.bindPopup(`
          <div style="font-size: 12px; line-height: 1.5; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: ${busColor}; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-family: monospace;">
                ${bus.routeNumber}
              </span>
              <b style="color: #0f172a;">${bus.vehicleId}</b>
            </div>
            <div style="color: #475569; font-size: 11px;"><b>Route:</b> ${bus.routeName}</div>
            <div style="color: #047857; font-weight: bold; margin-top: 4px;">⚡ GPS Speed: ${bus.speedKmh} km/h</div>
            <div style="color: #475569; font-size: 11px;"><b>Next Stop:</b> ${bus.nextStop}</div>
            <div style="color: #475569; font-size: 11px;"><b>Occupancy:</b> ${bus.occupancy}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 4px;">Driver: ${bus.driverName}</div>
          </div>
        `);

        layersRef.current.busMarkers.push(busMarker);
      });
    }
  }, [liveBuses]);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[720px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Map Legend Overlay (Clean White Card matching Image 2) */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-xs space-y-1.5 sm:space-y-2 shadow-lg pointer-events-none max-w-[calc(100%-24px)]">
        <span className="font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 block">
          Track Congestion Speed
        </span>
        <div className="flex items-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-slate-700 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-sm" /> &gt;25 km/h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 shadow-sm" /> 15-25 km/h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-sm" /> &lt;15 km/h (Gridlock)
          </span>
        </div>
      </div>

      {/* Live Fleet Counter Overlay */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs flex items-center gap-2 shadow-md">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-700 font-extrabold text-[10px] sm:text-xs">
          {liveBuses?.length || 0} DTC Buses Live
        </span>
      </div>
    </div>
  );
}
