Base.write("Event",()=>{
  var e = {};
  var onpress = [];
  var onhover = [];
  var onrelease = [];
  e.onPress = (f)=>{
    onpress.push(f);
  }
  e.onHover = (f)=>{
    onhover.push(f);
  };
  e.onRelease = (f)=>{
    onrelease.push(f);
  }
  window.onmousedown = (e)=>{
    if(e.which==1){
      for(var i=0;i<onpress.length;i++)onpress[i](e);
    }else e.preventDefault();
  };
  window.onmousemove = (e)=>{
    for(var i=0;i<onhover.length;i++)onhover[i](e);
  };
  window.onmouseup = (e)=>{
    if(e.which==1){
      for(var i=0;i<onrelease.length;i++)onrelease[i](e);
    }else e.preventDefault();
  };
  window.oncontextmenu = (e)=>{
    return false;
  }
  return e;
});