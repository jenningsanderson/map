var COMPANIES = ['mapbox','telenav','facebook','microsoft','kaart','apple','devseed','grab','amazon','uber','digitalegypt','lightcyphers'];

// COMPANIES = ['mapbox','grab','amazon','telenav'];

var COMPANY = "grab";

var FEATURE_LAYERS  = ["line-features","fill-features","point-features","turn-restrictions"]
var HEATMAP_LAYERS  = ["heatmap-tiny","heatmap-small","heatmap-medium","heatmap-large"]
var LAYERS  = HEATMAP_LAYERS.concat(FEATURE_LAYERS)

var animation, playing;

var startDateInt = 0;
var endDateInt   = 2546475325; //2050

var selectedUsers = [];

// The rest of these are mapboxgl styles for the heatmap
var tinyScaleHeatmapPaintStyle = {
    // Increase the heatmap weight based on frequency and property magnitude
    "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", 'e'],
        1, 0.1,
        10000, 2
    ],

    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
    "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(33,102,172,0)",
        0.2, "rgb(103,169,207)",
        0.4, "rgb(209,229,240)",
        0.6, "rgb(253,219,199)",
        0.8, "rgb(239,138,98)",
        1, "rgb(178,24,43)"
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        1, 2,
        3, 4
    ],
    "heatmap-opacity": 1
}

var smallScaleHeatmapPaintStyle =   {
    // Increase the heatmap weight based on frequency and property magnitude
    "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", 'e'],
        1, 0.1,
        1000, 1
    ],
    //Increase the heatmap color weight weight by zoom level
    //heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 1,
        5, 1.5
    ],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
    "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(33,102,172,0)",
        0.2, "rgb(103,169,207)",
        0.4, "rgb(209,229,240)",
        0.6, "rgb(253,219,199)",
        0.8, "rgb(239,138,98)",
        1, "rgb(178,24,43)"
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 4,
        5, 8
    ],
    "heatmap-opacity": 0.9
}

var mediumScaleHeatmapPaintStyle = {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", 'e'],
            1, 0.1,
            100, 1
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 1,
            8, 1.5
        ],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)"
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 3,
            8, 8
        ],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": 0.9
    }

var largeScaleHeatmapPaintStyle = {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", 'e'],
            1, 0.1,
            10, 3
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": 1,
        //[
        //     "interpolate",
        //     ["linear"],
        //     ["zoom"],
        //     8, 1,
        //     12, 1
        // ],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)"
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 4,
            12, 50
        ],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 1,
            12, 0.5
        ],
    }

var pointFeaturesPaintStyle = {
  'circle-color':'yellow',
  'circle-opacity':0.8,
  'circle-radius':[
    'interpolate',
    ['linear'],
    ['zoom'],
    12, 1,
    17, 6
  ]
}

var fillFeaturesPaintStyle = {
  'fill-color':'lightblue',
  'fill-opacity':0.75
}

var lineFeaturesPaintStyle = {
  'line-color':'green',
  'line-opacity':0.9,
  'line-width':[
    'interpolate',
    ['exponential',2],
    ['zoom'],
    12, 1,
    17, 7
  ]
}

var trFeaturesPaintStyle = {
  'circle-color':'salmon',
  'circle-radius':[
    'interpolate',
    ['linear'],
    ['zoom'],
    12, 2,
    17, 7
  ]
}

function getAllLayers(){
  return {
    "heatmap-large" :  {
      "id": "heatmap-large",
      "type": "heatmap",
      'source': COMPANY+'-source',
      'source-layer':'dailyPointSummaries',
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt]
      ],
      "minzoom": 8,
      "maxzoom": 12,
      "paint": largeScaleHeatmapPaintStyle
    },

    "heatmap-medium" : {
      "id": "heatmap-medium",
      "type": "heatmap",
      'source': COMPANY+'-source',
      'source-layer':'z10',
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt]
      ],
      "minzoom": 5,
      "maxzoom": 8,
      "paint": mediumScaleHeatmapPaintStyle
    },

    "heatmap-small" : {
      "id": "heatmap-small",
      "type": "heatmap",
      'source': COMPANY+'-source',
      'source-layer':'z8',
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt]
      ],
      "minzoom": 3,
      "maxzoom": 5,
      "paint": smallScaleHeatmapPaintStyle
    },

    "heatmap-tiny" : {
      "id": "heatmap-tiny",
      "type": "heatmap",
      'source': COMPANY+'-source',
      'source-layer':'z5',
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt]
      ],
      "minzoom": 1,
      "maxzoom": 3,
      "paint": tinyScaleHeatmapPaintStyle
    },

    "line-features" : {
      "id": "line-features",
      "type": "line",
      'source': COMPANY+'-source',
      'source-layer':'objects',
      "minzoom": 12,
      "maxzoom": 17,
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt],
        ['==','$type','LineString']
      ],
      "layout":{
        'line-cap':"round"
      },
      "paint": lineFeaturesPaintStyle
    },

    "fill-features" : {
      "id": "fill-features",
      "type": "fill",
      'source': COMPANY+'-source',
      'source-layer':'objects',
      "minzoom": 12,
      "maxzoom": 17,
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt],
        ['==','$type','Polygon']
      ],
      "paint":fillFeaturesPaintStyle
    },

    "point-features" : {
      "id": "point-features",
      "type": "circle",
      'source': COMPANY+'-source',
      'source-layer':'objects',
      "minzoom": 12,
      "maxzoom": 17,
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt],
        ['==','$type','Point'],
        ['!has','r']
      ],
      "paint": pointFeaturesPaintStyle,
    },

    "turn-restrictions" : {
      "id": "turn-restrictions",
      "type": "circle",
      'source': COMPANY+'-source',
      'source-layer':'objects',
      "minzoom": 12,
      "maxzoom": 17,
      'filter':['all',
        ['>','t',startDateInt],
        ['<=','t',endDateInt],
        ['==','$type','Point'],
        ['has','r']
      ],
      "paint": trFeaturesPaintStyle,
    }
  }
}

function tableBeginning(p){
  return `<table>
  <tr>
    <th>User</th>
    <td><a class="link" target="_blank" href="//openstreetmap.org/user/${p.h}">${p.h}</a>
    <span class="ml6 btn btn--s cursor-pointer" onclick="filterForUser('${p.h}')">filter</span></td>
  </tr>
  <tr>
    <th>Team</th>
    <td>${p.c}</td>
  </tr>
  <tr>
    <th>Changeset</th>
    <td><a class="link" target="_blank" href="//openstreetmap.org/changeset/${p['@c']}">${p['@c']}</a></td>
  </tr>
  <tr>
    <th>Date</th>
    <td>${new Date(p.t*1000).toLocaleString('en-US', { timeZone: 'UTC' })}
  </td>
  <tr>
    <th>Object Version </th>
    <td>${p.v}</td>
  </tr>`
}
