Base.write("Window",()=>{
  var w = {};
  w.width = 0;
  w.height = 0;

  var f;
  w.onResize = (e)=>{f = e;};
  function resize(){
    w.width = document.getElementById("canvas").width = document.getElementById("container").clientWidth;
    w.height = document.getElementById("canvas").height = document.getElementById("container").clientHeight;
    if(f)f();
  }
  resize();
  window.onresize = resize;
  return w;
});