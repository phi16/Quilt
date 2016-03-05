Base.write("Event",()=>{
  var e = {};
  var onclicks = [];
  var onhovers = [];
  e.onClick = (f)=>{
    onclicks.push(f);
  };
  e.onHover = (f)=>{
    onhovers.push(f);
  };
  window.onclick = (e)=>{
    for(var i=0;i<onclicks.length;i++)onclicks[i](e);
  };
  window.onmousemove = (e)=>{
    for(var i=0;i<onhovers.length;i++)onhovers[i](e);
  };
  return e;
});