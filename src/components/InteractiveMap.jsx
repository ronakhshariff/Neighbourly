import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './InteractiveMap.css'

// Mapbox access token - should be in env variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

mapboxgl.accessToken = MAPBOX_TOKEN

function InteractiveMap({ 
  requests = [], 
  accessibleBusinesses = [], 
  specialNeedsLocations = [],
  onRequestClick,
  userLocation = null,
  center = [-114.0719, 51.0447], // Calgary default
  zoom = 12,
  selectedLayer = 'all', // Controlled from parent
  onLayerChange, // Callback for layer changes
  showAccessibleRoads = true, // Controlled from parent
  onAccessibleRoadsToggle // Callback for roads toggle
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const markersRef = useRef({ requests: [], businesses: [], locations: [] })

  // Define functions before they're used
  const addAccessibleRoadsLayer = () => {
    if (!map.current) return

    // Add accessible roads as GeoJSON source
    const accessibleRoadsData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [-114.0719, 51.0447],
              [-114.0700, 51.0450],
              [-114.0680, 51.0455],
              [-114.0660, 51.0460]
            ]
          },
          properties: {
            name: 'Accessible Route - Downtown Core',
            type: 'accessible',
            features: ['Wheelchair accessible', 'Elevated sidewalks', 'Ramp access']
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [-114.0800, 51.0500],
              [-114.0750, 51.0480],
              [-114.0700, 51.0460]
            ]
          },
          properties: {
            name: 'Accessible Route - Transit Corridor',
            type: 'accessible',
            features: ['Transit accessible', 'Low-floor buses', 'Accessible stations']
          }
        }
      ]
    }

    const accessibleAreasData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-114.075, 51.040],
              [-114.065, 51.040],
              [-114.065, 51.050],
              [-114.075, 51.050],
              [-114.075, 51.040]
            ]]
          },
          properties: {
            name: 'Accessible Zone - City Center',
            type: 'accessible-zone',
            description: 'Fully accessible area with ramps, elevators, and accessible facilities'
          }
        }
      ]
    }

    try {
      map.current.addSource('accessible-roads', {
        type: 'geojson',
        data: accessibleRoadsData
      })

      map.current.addSource('accessible-areas', {
        type: 'geojson',
        data: accessibleAreasData
      })

      map.current.addLayer({
        id: 'accessible-roads',
        type: 'line',
        source: 'accessible-roads',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 4,
          'line-opacity': 0.7,
          'line-dasharray': [2, 2]
        }
      })

      map.current.addLayer({
        id: 'accessible-areas',
        type: 'fill',
        source: 'accessible-areas',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.15
        }
      })

      map.current.addLayer({
        id: 'accessible-areas-outline',
        type: 'line',
        source: 'accessible-areas',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-opacity': 0.5
        }
      })

      map.current.on('mouseenter', 'accessible-roads', () => {
        map.current.getCanvas().style.cursor = 'pointer'
        map.current.setPaintProperty('accessible-roads', 'line-width', 6)
      })

      map.current.on('mouseleave', 'accessible-roads', () => {
        map.current.getCanvas().style.cursor = ''
        map.current.setPaintProperty('accessible-roads', 'line-width', 4)
      })
    } catch (err) {
      console.error('Error adding accessible roads layer:', err)
    }
  }

  const addCustomLayers = () => {
    if (!map.current) return

    try {
      map.current.addSource('requests', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })

      map.current.addSource('businesses', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      map.current.addSource('accessibility', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      map.current.addLayer({
        id: 'requests-clusters',
        type: 'circle',
        source: 'requests',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6',
            5, '#8b5cf6',
            10, '#ec4899',
            20, '#f59e0b'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            25,
            5, 30,
            10, 40,
            20, 50
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.9
        }
      })

      map.current.addLayer({
        id: 'requests-cluster-count',
        type: 'symbol',
        source: 'requests',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      })

      map.current.addLayer({
        id: 'requests-unclustered',
        type: 'circle',
        source: 'requests',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'priority'],
            'Urgent', '#ef4444',
            'High', '#f59e0b',
            'Medium', '#3b82f6',
            'Low', '#10b981',
            '#6b7280'
          ],
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      })

      map.current.addLayer({
        id: 'businesses-points',
        type: 'circle',
        source: 'businesses',
        paint: {
          'circle-color': '#8b5cf6',
          'circle-radius': 12,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      })

      map.current.addLayer({
        id: 'accessibility-points',
        type: 'circle',
        source: 'accessibility',
        paint: {
          'circle-color': '#10b981',
          'circle-radius': 12,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      })

      map.current.on('click', 'requests-unclustered', (e) => {
        const feature = e.features[0]
        const coordinates = feature.geometry.coordinates.slice()
        
        const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="map-popup-content">
              <h3 class="map-popup-title">${feature.properties.title || 'Help Request'}</h3>
              <div class="map-popup-details">
                <span class="map-popup-priority ${feature.properties.priority?.toLowerCase()}">${feature.properties.priority || 'Medium'}</span>
                <span class="map-popup-category">${feature.properties.category || 'General'}</span>
              </div>
              <p class="map-popup-status">Status: ${feature.properties.status || 'Open'}</p>
            </div>
          `)
          .addTo(map.current)

        if (onRequestClick && feature.properties.requestId) {
          onRequestClick(feature.properties.requestId)
        }
      })

      map.current.on('click', 'businesses-points', (e) => {
        const feature = e.features[0]
        const coordinates = feature.geometry.coordinates.slice()
        
        const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="map-popup-content">
              <h3 class="map-popup-title">${feature.properties.name || 'Business'}</h3>
              <p class="map-popup-type">${feature.properties.type || 'Accessible Business'}</p>
              <div class="map-popup-features">
                ${(feature.properties.accessibilityFeatures || []).map(f => 
                  `<span class="map-popup-feature">${f}</span>`
                ).join('')}
              </div>
            </div>
          `)
          .addTo(map.current)
      })

      map.current.on('click', 'accessibility-points', (e) => {
        const feature = e.features[0]
        const coordinates = feature.geometry.coordinates.slice()
        
        const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="map-popup-content">
              <h3 class="map-popup-title">${feature.properties.name || 'Accessibility Service'}</h3>
              <p class="map-popup-type">${feature.properties.type || 'Service'}</p>
              <div class="map-popup-features">
                ${(feature.properties.services || []).map(s => 
                  `<span class="map-popup-feature">${s}</span>`
                ).join('')}
              </div>
            </div>
          `)
          .addTo(map.current)
      })

      map.current.on('click', 'requests-clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['requests-clusters']
        })
        const clusterId = features[0].properties.cluster_id
        map.current.getSource('requests').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          })
        })
      })

      map.current.on('mouseenter', 'requests-unclustered', () => {
        map.current.getCanvas().style.cursor = 'pointer'
        map.current.setPaintProperty('requests-unclustered', 'circle-radius', 14)
      })
      map.current.on('mouseleave', 'requests-unclustered', () => {
        map.current.getCanvas().style.cursor = ''
        map.current.setPaintProperty('requests-unclustered', 'circle-radius', 10)
      })

      map.current.on('mouseenter', 'businesses-points', () => {
        map.current.getCanvas().style.cursor = 'pointer'
        map.current.setPaintProperty('businesses-points', 'circle-radius', 16)
      })
      map.current.on('mouseleave', 'businesses-points', () => {
        map.current.getCanvas().style.cursor = ''
        map.current.setPaintProperty('businesses-points', 'circle-radius', 12)
      })

      map.current.on('mouseenter', 'accessibility-points', () => {
        map.current.getCanvas().style.cursor = 'pointer'
        map.current.setPaintProperty('accessibility-points', 'circle-radius', 16)
      })
      map.current.on('mouseleave', 'accessibility-points', () => {
        map.current.getCanvas().style.cursor = ''
        map.current.setPaintProperty('accessibility-points', 'circle-radius', 12)
      })
    } catch (err) {
      console.error('Error adding custom layers:', err)
    }
  }

  const addUserLocationMarker = (location) => {
    if (!map.current) return

    const el = document.createElement('div')
    el.className = 'user-location-marker'
    el.innerHTML = `
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    `

    new mapboxgl.Marker(el)
      .setLngLat([location.lng, location.lat])
      .addTo(map.current)
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Small delay to ensure container is rendered
    const initTimer = setTimeout(() => {
      if (!mapContainer.current || map.current) return

      // Check if Mapbox token is available
      console.log('Mapbox token:', MAPBOX_TOKEN ? 'Present' : 'Missing')
      if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('your-mapbox-token') || MAPBOX_TOKEN === 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw') {
        const errorMsg = 'Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your .env file'
        console.error(errorMsg)
        setMapError(errorMsg)
        return
      }

      // Ensure container has dimensions
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect()
        console.log('Map container dimensions:', rect.width, 'x', rect.height)
        if (rect.width === 0 || rect.height === 0) {
          // Retry after a short delay
          setTimeout(() => {
            const retryRect = mapContainer.current?.getBoundingClientRect()
            if (!retryRect || retryRect.width === 0 || retryRect.height === 0) {
              const errorMsg = 'Map container has no dimensions'
              console.error(errorMsg)
              setMapError(errorMsg)
            }
          }, 500)
          return
        }
      }

      try {
      // Initialize map with beautiful style
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Beautiful streets style
        center: center,
        zoom: zoom,
        pitch: 0, // Start with no pitch to avoid issues
        bearing: 0,
        antialias: true
      })

      // Add error handler
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError(e.error?.message || 'Map failed to load')
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      map.current.on('load', () => {
        setMapLoaded(true)
        
        // Add accessible roads layer
        try {
          addAccessibleRoadsLayer()
        } catch (err) {
          console.error('Error adding accessible roads:', err)
        }
        
        // Add custom layers for different marker types
        try {
          addCustomLayers()
        } catch (err) {
          console.error('Error adding custom layers:', err)
        }
        
        // Add user location if available
        if (userLocation) {
          try {
            addUserLocationMarker(userLocation)
          } catch (err) {
            console.error('Error adding user location:', err)
          }
        }
      })
      } catch (error) {
        console.error('Error initializing map:', error)
        setMapError(error.message || 'Failed to initialize map')
      }
    }, 100)

    return () => {
      clearTimeout(initTimer)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded) return
    
    // Update markers when data changes
    updateMarkers()
  }, [requests, accessibleBusinesses, specialNeedsLocations, mapLoaded, selectedLayer])

  useEffect(() => {
    if (!map.current || !mapLoaded) return
    
    // Toggle accessible roads visibility
    if (map.current.getLayer('accessible-roads')) {
      map.current.setLayoutProperty(
        'accessible-roads',
        'visibility',
        showAccessibleRoads ? 'visible' : 'none'
      )
    }
  }, [showAccessibleRoads, mapLoaded])

  const updateMarkers = () => {
    if (!map.current || !mapLoaded) return

    // Update requests source
    const requestFeatures = requests
      .filter(req => {
        if (selectedLayer === 'all' || selectedLayer === 'requests') {
          return req.coordinates || (req.latitude && req.longitude)
        }
        return false
      })
      .map(req => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: req.coordinates 
            ? [req.coordinates.lng, req.coordinates.lat]
            : [req.longitude, req.latitude]
        },
        properties: {
          requestId: req.id,
          title: req.title,
          priority: req.priority || req.urgency || 'Medium',
          category: req.category,
          status: req.status,
          timestamp: Date.now()
        }
      }))

    map.current.getSource('requests').setData({
      type: 'FeatureCollection',
      features: requestFeatures
    })

    // Update businesses source
    const businessFeatures = accessibleBusinesses
      .filter(biz => {
        if (selectedLayer === 'all' || selectedLayer === 'businesses') {
          return biz.coordinates || (biz.latitude && biz.longitude)
        }
        return false
      })
      .map(biz => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: biz.coordinates 
            ? [biz.coordinates.lng, biz.coordinates.lat]
            : [biz.longitude, biz.latitude]
        },
        properties: {
          businessId: biz.id,
          name: biz.name,
          type: biz.type,
          accessibilityFeatures: biz.accessibilityFeatures || []
        }
      }))

    map.current.getSource('businesses').setData({
      type: 'FeatureCollection',
      features: businessFeatures
    })

    // Update accessibility locations source
    const accessibilityFeatures = specialNeedsLocations
      .filter(loc => {
        if (selectedLayer === 'all' || selectedLayer === 'accessibility') {
          return loc.coordinates || (loc.latitude && loc.longitude)
        }
        return false
      })
      .map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: loc.coordinates 
            ? [loc.coordinates.lng, loc.coordinates.lat]
            : [loc.longitude, loc.latitude]
        },
        properties: {
          locationId: loc.id,
          name: loc.name,
          type: loc.type,
          services: loc.services || []
        }
      }))

    map.current.getSource('accessibility').setData({
      type: 'FeatureCollection',
      features: accessibilityFeatures
    })

    // Update layer visibility based on selected layer
    map.current.setLayoutProperty('requests-unclustered', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'requests') ? 'visible' : 'none')
    map.current.setLayoutProperty('requests-clusters', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'requests') ? 'visible' : 'none')
    map.current.setLayoutProperty('requests-cluster-count', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'requests') ? 'visible' : 'none')
    map.current.setLayoutProperty('businesses-points', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'businesses') ? 'visible' : 'none')
    map.current.setLayoutProperty('accessibility-points', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'accessibility') ? 'visible' : 'none')
  }

  return (
    <div className="interactive-map-container">
      <div className="map-controls">
        <div className="map-layer-toggle">
          <button
            className={`map-layer-btn ${selectedLayer === 'all' ? 'active' : ''}`}
            onClick={() => onLayerChange && onLayerChange('all')}
            title="Show all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            All
          </button>
          <button
            className={`map-layer-btn ${selectedLayer === 'requests' ? 'active' : ''}`}
            onClick={() => onLayerChange && onLayerChange('requests')}
            title="Help Requests"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Requests
          </button>
          <button
            className={`map-layer-btn ${selectedLayer === 'businesses' ? 'active' : ''}`}
            onClick={() => onLayerChange && onLayerChange('businesses')}
            title="Accessible Businesses"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Businesses
          </button>
          <button
            className={`map-layer-btn ${selectedLayer === 'accessibility' ? 'active' : ''}`}
            onClick={() => onLayerChange && onLayerChange('accessibility')}
            title="Accessibility Services"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Services
          </button>
        </div>
        
        <div className="map-roads-toggle">
          <button
            className={`map-toggle-btn ${showAccessibleRoads ? 'active' : ''}`}
            onClick={() => onAccessibleRoadsToggle && onAccessibleRoadsToggle(!showAccessibleRoads)}
            title="Toggle Accessible Roads"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            Accessible Roads
          </button>
        </div>
      </div>

      {mapError ? (
        <div className="map-error-container">
          <div className="map-error-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>Map Error</h3>
            <p>{mapError}</p>
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              Check the browser console for more details
            </p>
          </div>
        </div>
      ) : !mapLoaded ? (
        <div className="map-loading-container">
          <div className="map-loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      ) : null}
      <div ref={mapContainer} className="map-container" style={{ display: mapError ? 'none' : 'block' }} />
    </div>
  )
}

export default InteractiveMap
