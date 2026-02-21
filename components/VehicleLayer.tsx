'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { createInitialVehicles, updateVehicles, Vehicle } from '../lib/vehicleSimulation'

interface VehicleLayerProps {
  map: mapboxgl.Map | null
  emergencyLocation?: [number, number] | null
}

export default function VehicleLayer({ map, emergencyLocation }: VehicleLayerProps) {
  const vehiclesRef = useRef<Vehicle[]>(createInitialVehicles(100))
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const emergencyRef = useRef<[number, number] | null>(null)
  
  useEffect(() => {
    emergencyRef.current = emergencyLocation || null
  }, [emergencyLocation])

  useEffect(() => {
    if (!map) return

    const initializeLayer = () => {
      // Add the image to the map
      if (!map.hasImage('ems-vehicle')) {
        map.loadImage('/ems-vehicle.png', (error, image) => {
          if (error) {
            console.error('Error loading EMS vehicle icon:', error)
            return
          }
          if (image && !map.hasImage('ems-vehicle')) {
            map.addImage('ems-vehicle', image)
          }
        })
      }

      const sourceId = 'ems-vehicles'
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })

        map.addLayer({
          id: 'ems-layer-shadow',
          type: 'symbol',
          source: sourceId,
          layout: {
            'icon-image': 'ems-vehicle',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 0.08,
              12, 0.4
            ],
            'icon-allow-overlap': true,
            'icon-offset': [2, 2],
          },
          paint: {
            'icon-opacity': 0.3,
            'icon-color': '#000000',
          },
        })

        map.addLayer({
          id: 'ems-layer',
          type: 'symbol',
          source: sourceId,
          layout: {
            'icon-image': 'ems-vehicle',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 0.08,
              12, 0.4
            ],
            'icon-allow-overlap': true,
          },
        })
        
        // Add glow layer for gold highlights
        map.addLayer({
            id: 'ems-layer-glow',
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 8,
              'circle-color': '#FFD700',
              'circle-blur': 1,
              'circle-opacity': 0.3
            }
        }, 'ems-layer-shadow')
      }

      // Start simulation loop
      intervalRef.current = setInterval(() => {
        vehiclesRef.current = updateVehicles(vehiclesRef.current, emergencyRef.current)
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: vehiclesRef.current.map((v) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: v.position,
              },
              properties: {
                heading: v.heading,
                id: v.id,
              },
            })),
          })
        }
      }, 50) 
    }

    if (map.isStyleLoaded()) {
      initializeLayer()
    } else {
      map.once('style.load', initializeLayer)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [map])

  return null
}
