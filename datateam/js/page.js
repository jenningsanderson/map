// document.getElementById('help').addEventListener('click',function(e){
//   document.getElementById('sidebar').style.display="none";
//   document.getElementById('main').className = "col col--12"
//   document.getElementById('show-help').style.display="block";
//   window.dispatchEvent(new Event('resize'));
// })

// document.getElementById('show-help').addEventListener('click',function(e){
//   document.getElementById('sidebar').style.display="block";
//   document.getElementById('main').className = "col col--10"
//   this.style.display = 'none';
//   window.dispatchEvent(new Event('resize'));
// })


//Register all the triggers
document.getElementById('dataset-picker').addEventListener('change',function(e){
  var dataset = e.target.value;
  if (COMPANY != dataset){
    COMPANY=dataset
    reloadAll();
  }
})

document.getElementById('year-picker').addEventListener('change',reloadTimeline)

document.getElementById('intensity-variable-picker').addEventListener('change',changeIntensity)

// document.getElementById('step').addEventListener('click',timeline.stepBrush);
//
// document.getElementById('Play').addEventListener('click',function(){
//   var btn = this;
//   if (playing){
//     window.clearInterval(animation);
//     btn.innerHTML = "Play"
//     playing=false;
//   }else{
//     var outOfBounds;
//     animation = setInterval(function(){
//       outOfBounds = timeline.stepBrush()
//       if(outOfBounds){
//         window.clearInterval(animation)
//         playing = false
//         btn.innerHTML = "Play"
//       }
//     },1000);
//     playing=true;
//     this.innerHTML = "Stop";
//   }
// });
