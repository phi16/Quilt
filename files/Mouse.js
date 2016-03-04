Base.write("Mouse",()=>{
  var m = {};
  m.x = m.y = 0;
  window.onmousemove = (e)=>{
    m.x = e.clientX;
    m.y = e.clientY;
  };
  return m;
});