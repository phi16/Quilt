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
  m.Cur = {
    auto : "auto",
    hResize : "col-resize",
    vResize : "row-resize",
    select : "pointer"
  };
  m.cursor = (e)=>{
    if(e==null)document.body.style.cursor = m.Cur.auto;
    document.body.style.cursor = e;
  };
  return m;
});