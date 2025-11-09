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
  zoom = 12
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState('all') // all, requests, businesses, accessibility
  const markersRef = useRef({ requests: [], businesses: [], locations: [] })

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Light theme for accessibility
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      
      // Add custom layers for different marker types
      addCustomLayers()
      
      // Add user location if available
      if (userLocation) {
        addUserLocationMarker(userLocation)
      }
    })

    return () => {
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

  const addCustomLayers = () => {
    // Add custom sources and layers for clustering
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

    // Add layers for requests
    map.current.addLayer({
      id: 'requests-clusters',
      type: 'circle',
      source: 'requests',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          30, 40,
          100, 50
        ],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
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
        'text-size': 12
      },
      paint: {
        'text-color': '#fff'
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
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8
      }
    })

    // Add layers for businesses
    map.current.addLayer({
      id: 'businesses-points',
      type: 'circle',
      source: 'businesses',
      paint: {
        'circle-color': '#8b5cf6',
        'circle-radius': 10,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8
      }
    })

    // Add layers for accessibility locations
    map.current.addLayer({
      id: 'accessibility-points',
      type: 'circle',
      source: 'accessibility',
      paint: {
        'circle-color': '#10b981',
        'circle-radius': 10,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8
      }
    })

    // Add click handlers
    map.current.on('click', 'requests-unclustered', (e) => {
      const feature = e.features[0]
      if (onRequestClick && feature.properties.requestId) {
        onRequestClick(feature.properties.requestId)
      }
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

    // Change cursor on hover
    map.current.on('mouseenter', 'requests-unclustered', () => {
      map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'requests-unclustered', () => {
      map.current.getCanvas().style.cursor = ''
    })
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
          priority: req.priority,
          category: req.category,
          status: req.status
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
    const visibility = selectedLayer === 'all' ? 'visible' : 'none'
    map.current.setLayoutProperty('requests-unclustered', 'visibility', 
      (selectedLayer === 'all' || selectedLayer === 'requests') ? 'visible' : 'none')
    map.current.setLayoutProperty('requests-clusters', 'visibility', 
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
            onClick={() => setSelectedLayer('all')}
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
            onClick={() => setSelectedLayer('requests')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Requests
          </button>
          <button
            className={`map-layer-btn ${selectedLayer === 'businesses' ? 'active' : ''}`}
            onClick={() => setSelectedLayer('businesses')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Businesses
          </button>
          <button
            className={`map-layer-btn ${selectedLayer === 'accessibility' ? 'active' : ''}`}
            onClick={() => setSelectedLayer('accessibility')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Accessibility
          </button>
        </div>
      </div>

      <div className="map-legend">
        <div className="map-legend-title">Legend</div>
        {selectedLayer === 'all' || selectedLayer === 'requests' ? (
          <>
            <div className="map-legend-item">
              <div className="map-legend-dot urgent"></div>
              <span>Urgent</span>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot high"></div>
              <span>High</span>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot medium"></div>
              <span>Medium</span>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot low"></div>
              <span>Low</span>
            </div>
          </>
        ) : null}
        {selectedLayer === 'all' || selectedLayer === 'businesses' ? (
          <div className="map-legend-item">
            <div className="map-legend-dot business"></div>
            <span>Accessible Business</span>
          </div>
        ) : null}
        {selectedLayer === 'all' || selectedLayer === 'accessibility' ? (
          <div className="map-legend-item">
            <div className="map-legend-dot accessibility"></div>
            <span>Accessibility Service</span>
          </div>
        ) : null}
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  )
}

export default InteractiveMap

