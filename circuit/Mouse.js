Base.write("Mouse",()=>{
  var m = {};
  m.x = m.y = 0;
  m.pressing = false;
  m.left = m.right = m.center = false;
  m.drag = null;
  m.wheel = 0;
  Event.onHover((e)=>{
    m.left = m.right = false;
    if(e.which==1)m.left = true;
    if(e.which==2)m.center = true;
    if(e.which==3)m.right = true;
    m.x = e.clientX;
    m.y = e.clientY;
  });
  Event.onPress((e)=>{
    m.left = m.right = false;
    if(e.which==1)m.left = true;
    if(e.which==2)m.center = true;
    if(e.which==3)m.right = true;
    m.pressing = true;
  });
  Event.onRelease((e)=>{
    m.left = m.right = false;
    if(e.which==1)m.left = true;
    if(e.which==2)m.center = true;
    if(e.which==3)m.right = true;
    m.pressing = false;
  });
  Event.onWheel((e)=>{
    m.wheel = e.wheelDelta;
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