Base.write("Mouse",()=>{
  var m = {};
  m.x = m.y = 0;
  m.pressing = false;
  Event.onHover((e)=>{
    m.x = e.clientX;
    m.y = e.clientY;
  });
  Event.onPress(()=>{
    m.pressing = true;
  });
  Event.onRelease(()=>{
    m.pressing = false;
  });
  m.in = (x,y,w,h)=>{
    return x<Mouse.x && Mouse.x<x+w && y<Mouse.y && Mouse.y<y+h;
  }
  return m;
});