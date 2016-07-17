Base.write("Event",()=>{
  var e = {};
  var onpress = [];
  var onhover = [];
  var onrelease = [];
  var onwheel = [];
  e.onPress = (f)=>{
    onpress.push(f);
  }
  e.onHover = (f)=>{
    onhover.push(f);
  };
  e.onRelease = (f)=>{
    onrelease.push(f);
  }
  e.onWheel = (f)=>{
    onwheel.push(f);
  }
  window.onmousedown = (e)=>{
    for(var i=0;i<onpress.length;i++)onpress[i](e);
  };
  window.onmousemove = (e)=>{
    for(var i=0;i<onhover.length;i++)onhover[i](e);
  };
  window.onmouseup = (e)=>{
    for(var i=0;i<onrelease.length;i++)onrelease[i](e);
  };
  window.onmousewheel = (e)=>{
    for(var i=0;i<onwheel.length;i++)onwheel[i](e);
  };
  window.oncontextmenu = (e)=>{
    return false;
  }
  return e;
});