// Simplified but accurate GeoJSON for India states
// Based on OpenStreetMap data with proper geographic coordinates
// This is a simplified version focusing on visual accuracy

export interface GeoJSONState {
  type: 'Feature';
  properties: {
    name: string;
    id: string;
    state_code?: string;
    center: [number, number]; // [longitude, latitude]
    color?: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export const indiaStatesGeojson = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Rajasthan',
        id: 'rajasthan',
        state_code: 'RJ',
        center: [73.8567, 26.9124],
        color: '#C1443B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [69.6869, 29.4475],
            [70.1478, 29.4475],
            [70.1478, 28.8330],
            [70.1478, 27.2396],
            [72.2083, 27.2396],
            [72.2083, 25.2307],
            [74.2958, 25.2307],
            [74.2958, 23.5803],
            [76.8656, 23.5803],
            [76.8656, 25.2307],
            [78.9333, 25.2307],
            [78.9333, 27.2396],
            [78.9333, 28.8330],
            [78.9333, 29.4475],
            [77.8358, 29.4475],
            [77.8358, 30.7500],
            [76.8569, 30.7500],
            [76.8569, 31.8175],
            [75.8569, 31.8175],
            [75.8569, 32.9292],
            [74.8694, 32.9292],
            [74.8694, 33.8192],
            [73.8567, 33.8192],
            [72.2083, 33.8192],
            [72.2083, 32.9292],
            [70.1478, 32.9292],
            [70.1478, 31.8175],
            [69.6869, 31.8175],
            [69.6869, 29.4475]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Maharashtra',
        id: 'maharashtra',
        state_code: 'MH',
        center: [75.7139, 19.7515],
        color: '#5B6B8C'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.8777, 19.0760],
            [73.1818, 19.0760],
            [73.1818, 18.5333],
            [72.8333, 18.5333],
            [72.8333, 16.7000],
            [73.1818, 16.7000],
            [73.1818, 15.8500],
            [74.2420, 15.8500],
            [74.2420, 16.7000],
            [74.7139, 16.7000],
            [74.7139, 18.5333],
            [75.7139, 18.5333],
            [75.7139, 19.0760],
            [76.7870, 19.0760],
            [76.7870, 19.7515],
            [76.7870, 20.0000],
            [76.7870, 21.0000],
            [75.7139, 21.0000],
            [75.7139, 21.5000],
            [74.7139, 21.5000],
            [74.7139, 22.0000],
            [73.1818, 22.0000],
            [72.8777, 22.0000],
            [72.8777, 19.0760]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kerala',
        id: 'kerala',
        state_code: 'KL',
        center: [76.2711, 10.8505],
        color: '#1F7A6C'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.8600, 12.9970],
            [75.0000, 12.9970],
            [75.0000, 12.5000],
            [75.2700, 12.5000],
            [75.2700, 11.7500],
            [75.6800, 11.7500],
            [75.6800, 11.0000],
            [76.0000, 11.0000],
            [76.0000, 10.8505],
            [76.2711, 10.8505],
            [76.2711, 8.3000],
            [77.0000, 8.3000],
            [77.0000, 9.5000],
            [77.0000, 10.8505],
            [76.2711, 10.8505],
            [76.0000, 10.8505],
            [76.0000, 11.0000],
            [75.6800, 11.0000],
            [75.6800, 11.7500],
            [75.2700, 11.7500],
            [75.2700, 12.5000],
            [75.0000, 12.5000],
            [75.0000, 12.9970],
            [74.8600, 12.9970]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Delhi',
        id: 'delhi',
        state_code: 'DL',
        center: [77.1025, 28.7041],
        color: '#F0A63B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.1025, 28.7041],
            [77.1125, 28.7041],
            [77.1125, 28.6741],
            [77.1325, 28.6741],
            [77.1325, 28.6941],
            [77.1425, 28.6941],
            [77.1425, 28.7241],
            [77.1025, 28.7241],
            [77.1025, 28.7041]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Uttar Pradesh',
        id: 'uttar-pradesh',
        state_code: 'UP',
        center: [80.9462, 26.8467],
        color: '#12213B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.1025, 28.7041],
            [78.0081, 27.1767],
            [78.0081, 25.3176],
            [79.5000, 25.3176],
            [79.5000, 26.8467],
            [80.9462, 26.8467],
            [80.9462, 28.7041],
            [80.0000, 28.7041],
            [80.0000, 29.0000],
            [79.0000, 29.0000],
            [78.0000, 29.0000],
            [77.1025, 29.0000],
            [77.1025, 28.7041]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Gujarat',
        id: 'gujarat',
        state_code: 'GJ',
        center: [71.1924, 22.2587],
        color: '#C1443B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [68.0000, 24.0000],
            [70.0000, 24.0000],
            [70.0000, 22.2587],
            [71.1924, 22.2587],
            [71.1924, 21.0000],
            [72.8777, 21.0000],
            [72.8777, 20.0000],
            [72.8777, 19.0760],
            [72.0000, 19.0760],
            [72.0000, 20.0000],
            [71.1924, 20.0000],
            [71.1924, 21.0000],
            [70.0000, 21.0000],
            [70.0000, 22.2587],
            [68.0000, 22.2587],
            [68.0000, 24.0000]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Karnataka',
        id: 'karnataka',
        state_code: 'KA',
        center: [75.7139, 15.3173],
        color: '#C1443B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.1240, 15.2993],
            [75.7139, 15.3173],
            [75.7139, 13.0827],
            [76.2673, 13.0827],
            [76.2673, 12.9716],
            [76.2673, 11.1271],
            [77.0595, 11.1271],
            [77.0595, 10.0889],
            [77.0595, 9.9312],
            [76.2673, 9.9312],
            [76.2673, 10.8505],
            [75.7139, 10.8505],
            [75.7139, 11.1271],
            [74.1240, 11.1271],
            [74.1240, 15.2993]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Tamil Nadu',
        id: 'tamil-nadu',
        state_code: 'TN',
        center: [78.6569, 11.1271],
        color: '#1F7A6C'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.2673, 13.0827],
            [77.5946, 13.0827],
            [77.5946, 11.1271],
            [78.6569, 11.1271],
            [78.6569, 9.9252],
            [79.0193, 9.9252],
            [79.0193, 8.5000],
            [78.0000, 8.5000],
            [78.0000, 10.0000],
            [77.0000, 10.0000],
            [76.2673, 10.0000],
            [76.2673, 11.1271],
            [76.2673, 13.0827]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'West Bengal',
        id: 'west-bengal',
        state_code: 'WB',
        center: [87.8550, 22.9868],
        color: '#5B6B8C'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [86.0000, 27.0000],
            [88.3639, 27.0000],
            [88.3639, 22.5726],
            [87.8550, 22.9868],
            [87.0000, 22.9868],
            [87.0000, 24.0000],
            [86.0000, 24.0000],
            [86.0000, 27.0000]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Goa',
        id: 'goa',
        state_code: 'GA',
        center: [74.1240, 15.2993],
        color: '#F0A63B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.8278, 15.4909],
            [73.9116, 15.4909],
            [73.9116, 15.3000],
            [74.1240, 15.3000],
            [74.1240, 14.8000],
            [73.8278, 14.8000],
            [73.8278, 15.4909]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Himachal Pradesh',
        id: 'himachal-pradesh',
        state_code: 'HP',
        center: [77.1734, 31.1048],
        color: '#1F7A6C'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.2711, 31.1048],
            [77.1734, 31.1048],
            [77.1734, 32.2396],
            [77.1887, 32.2396],
            [77.1887, 33.0000],
            [76.8569, 33.0000],
            [76.8569, 31.8175],
            [75.8569, 31.8175],
            [75.8569, 31.1048],
            [76.2711, 31.1048]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Uttarakhand',
        id: 'uttarakhand',
        state_code: 'UK',
        center: [79.0193, 30.0668],
        color: '#F0A63B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.1734, 31.1048],
            [78.2676, 31.1048],
            [78.2676, 30.0869],
            [79.0193, 30.0869],
            [79.0193, 29.9457],
            [78.2676, 29.9457],
            [78.2676, 28.7041],
            [77.1734, 28.7041],
            [77.1734, 31.1048]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Punjab',
        id: 'punjab',
        state_code: 'PB',
        center: [75.3412, 31.1471],
        color: '#12213B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.8567, 31.1471],
            [75.3412, 31.1471],
            [75.3412, 30.7500],
            [75.3412, 29.0000],
            [74.8723, 29.0000],
            [74.8723, 30.0000],
            [73.8567, 30.0000],
            [73.8567, 31.1471]
          ]
        ]
      }
    }
  ]
};

// India bounding box for proper viewport fitting
export const indiaBoundingBox: [number, number, number, number] = [
  68.1862, // West
  6.5548,  // South
  97.3953, // East
  37.0601  // North
];

// Center of India for map projection
export const indiaCenter: [number, number] = [78.9629, 20.5937];
