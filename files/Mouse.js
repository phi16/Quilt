Base.write("Mouse",()=>{
  var m = {};
  m.x = m.y = 0;
  Event.onHover((e)=>{
    m.x = e.clientX;
    m.y = e.clientY;
  });
  m.in = (x,y,w,h)=>{
    return x<Mouse.x && Mouse.x<x+w && y<Mouse.y && Mouse.y<y+h;
  }
  return m;
});