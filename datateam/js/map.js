let urlParams = new URLSearchParams(window.location.search);

let style = urlParams.get('style');
var styleString = "mapbox://styles/mapbox/" + ( (style==null)? "dark-v9" : style )

// A bit of a dirty secret to see other companies that aren't listed.
let company = urlParams.get('company');
COMPANY = (company==null)? "grab" : company
if (COMPANIES.indexOf(COMPANY)<0){
  COMPANIES.push(company)
}


mapboxgl.accessToken = 'pk.eyJ1IjoiamVubmluZ3NhbmRlcnNvbiIsImEiOiIzMHZndnpvIn0.PS-j7fRK3HGU7IE8rbLT9A';

var map = new mapboxgl.Map({
    container: 'map',
    zoom: 3,
    maxZoom:16.99,
    minZoom:1,
    center: [-82.9609, 42.3089],
    style: styleString,
    hash: true
});

map.addControl(new mapboxgl.NavigationControl());


function makePath(){
  PATH = "data/"+COMPANY+"-edits-per-day-v2.json";
}

makePath();


//This kicks off everything
map.once('load',function(){

  // This is for all the companies
  COMPANIES.forEach(function(comp){
      map.addSource(comp+"-source",{
          "type":"vector",
          "url" :"mapbox://jenningsanderson."+comp+"-corp-edits-v2"
      })
  });

  // //This is for debugging locally
  // COMPANIES.forEach(function(COMPANY){
  //   map.addSource(COMPANY+"-source",{
  //     type: 'vector',
  //     tiles: [
  //       'http://localhost:9999/'+COMPANY+'.mbtiles/{z}/{x}/{y}.pbf'
  //     ]
  //   })
  // });

  var theseLayers = getAllLayers()

  LAYERS.forEach(function(layerID){
    map.addLayer(theseLayers[layerID])
  });

  document.getElementById('loading').style.display = 'none';

  //Map interaction
  ['line-features','fill-features','point-features', 'turn-restrictions'].forEach(function(layerID){
    map.on('mouseenter', layerID, function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerID, function () {
      map.getCanvas().style.cursor = '';
    });

  })

  map.on('click', 'fill-features', function (e) {
    var p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(tableBeginning(p)+
                  `<tr>
                    <th>OSM Way: </th>
                    <td><a class="link" target="_blank" href="//openstreetmap.org/way/${p.i}">${p.i}</a></td>
                  </tr>
                  <tr>
                    <th>name=</th>
                    <td>${p.n}</td>
                  </tr>
                  <tr>
                    <th>building=</th>
                    <td>${p.b}</td>
                  </tr>
                </table>`)
      .addTo(map);
  });

  map.on('click', 'line-features', function (e) {
    var p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(tableBeginning(p)+
                  `<tr>
                    <th>OSM Way: </th>
                    <td><a class="link" target="_blank" href="//openstreetmap.org/way/${p.i}">${p.i}</a></td>
                  </tr>
                  <tr>
                    <th>name=</th>
                    <td>${p.n}</td>
                  </tr>
                  <tr>
                    <th>highway=</th>
                    <td>${p.h}</td>
                  </tr>
                </table>`)
      .addTo(map);
  });

  map.on('click', 'turn-restrictions', function (e) {
    var p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(tableBeginning(p)+
                  `<tr>
                    <th>OSM Relation: </th>
                    <td><a class="link" target="_blank" href="//openstreetmap.org/relation/${p.i}">${p.i}</a></td>
                  </tr>
                </table>`)
      .addTo(map);
  });

  map.on('click', 'point-features', function (e) {
    var p = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(tableBeginning(p)+
                  `<tr>
                    <th>OSM Node: </th>
                    <td><a class="link" target="_blank" href="//openstreetmap.org/node/${p.i}">${p.i}</a></td>
                  </tr>
                  <tr>
                    <th>name=</th>
                    <td>${p.n}</td>
                  </tr>
                  <tr>
                    <th>highway=</th>
                    <td>${p.h}</td>
                  </tr>
                </table>`)
      .addTo(map);
  });

});

var timeline = new D3Timeline(function(brushEvent){
                    startDateInt = Math.floor( brushEvent[0].getTime() / 1000 )
                    endDateInt   = Math.floor( brushEvent[1].getTime() / 1000 )

                    LAYERS.forEach(function(layerID){
                      updateTimeFilter(layerID);
                    })
})

function updateTimeFilter(layerID){
  var f = map.getFilter(layerID)
  for(var i=0; i<f.length; i++){
    if(f[i][1]=="d" && f[i][0]=='>'){
      f[i][2] = startDateInt
    }else if(f[i][1]=="d" && f[i][0]=='<='){
      f[i][2] = endDateInt
    }
  }
  map.setFilter(layerID,f)
}

function updateUserFilters(){
  var idx;
  if (selectedUsers.length){
    FEATURE_LAYERS.forEach(function(layerID){
      var f = map.getFilter(layerID)
      for(var i=0; i<f.length; i++){
        if(f[i][1]=="u" && f[i][0]=='in'){
          idx=i;
        }
      }

      if(idx<0){
        f.push( ["in","u"].concat(selectedUsers) )
      }else{
        f[i] = ["in","u"].concat(selectedUsers)
      }
      map.setFilter(layerID,f)
    })
  }else{
    //removing a suer...
    FEATURE_LAYERS.forEach(function(layerID){
      var f = map.getFilter(layerID)
      var idx;
      for(var i=0; i<f.length; i++){
        if(f[i][1]=="u" && f[i][0]=='in'){
          idx=i
        }
      }
      if(idx){
        f.splice(idx,1);
      }
      map.setFilter(layerID,f)
    })
  }
}

function reloadTimeline(){

  document.getElementById('loading').style.display = 'block';

  var timelineCounts = [];
  var params = {};
  var year = document.getElementById('year-picker').value
  if (year==='All'){
    params = {}
  }else{
    year = Number(year)
    params.minDate = new Date(year,0,1),
    params.maxDate = new Date(year,11,31)
  }

  d3.json(PATH, function(error, data) {
    if (error) {
      throw error;
    }

    // console.warn(data)

    data.data.forEach(function(record){
      d = new Date(record.date)

      if (params.maxDate && params.minDate){
        if ( (d <= params.maxDate) && (d>= params.minDate) ) {
          timelineCounts.push({date: d, count: record.e})
        }
      }else{
        timelineCounts.push({date: d, count: record.e})
      }
    })

    if (timelineCounts.length){
      params.maxDate = params.maxDate || d3.max(timelineCounts, function(d) { return d.date; });
      params.minDate = params.minDate || d3.min(timelineCounts, function(d) { return d.date; });

      timeline.createD3Timeline({
        docID: "timeline-svg",
        data:  timelineCounts
      })

      if(map.loaded()){
        timeline.fireBrushEvent( [params.minDate, params.maxDate] )
      }

      document.getElementById('loading').style.display = 'none';
    }else{
      alert("No edits for this year, please choose another year")
      document.getElementById('loading').style.display = 'none';
    }

  })
}

//Run the page!
reloadTimeline();

function filterForUser(userName){
  var idx = selectedUsers.indexOf(userName);

  if(idx<0){
    selectedUsers.push(userName)
    console.log("filtering for only user: " + userName)
    updateUserFilters()
  }else{
    selectedUsers.splice(idx,1)
    console.log("removing user: "+userName)
    updateUserFilters()
  }
}

function reloadAll(){
  document.getElementById('loading').style.display = 'block';
  makePath();
  reloadTimeline();

  var newLayers = getAllLayers()

  LAYERS.forEach(function(layerID){
    map.removeLayer(layerID)
    map.addLayer(newLayers[layerID])
  })

  var event = new Event('change');
  document.getElementById('intensity-variable-picker').dispatchEvent(event);

}

function changeIntensity(e){
  var intensityVar = e.target.value

  HEATMAP_LAYERS.forEach(function(layerID){
    var f = map.getFilter(layerID)
    var idx;
    for(var i=0; i<f.length; i++){
      if( (f[i][1]=="b") || (f[i][1]=="km") || (f[i][1]=="e") ){
        idx=i;
      }
    }

    if(idx){
      f[idx] = ['>',intensityVar,0]
    }else{
      f.push( ['>',intensityVar,0] )
    }
    map.setFilter(layerID,f)
  })

  map.setPaintProperty('heatmap-tiny',"heatmap-weight",[
              "interpolate",
              ["linear"],
              ["get", intensityVar],
              1, 0.1,
              10000, 1])
  map.setPaintProperty('heatmap-small',"heatmap-weight",[
              "interpolate",
              ["linear"],
              ["get", intensityVar],
              1, 0.1,
              1000, 1])
  map.setPaintProperty('heatmap-medium',"heatmap-weight",[
              "interpolate",
              ["linear"],
              ["get", intensityVar],
              1, 0.1,
              100, 1])
  map.setPaintProperty('heatmap-large',"heatmap-weight",[
              "interpolate",
              ["linear"],
              ["get", intensityVar],
              1, 0.1,
              10, 3])

}

/*

TODO: We a dropdown menu that can fire these off will be great...


*/
