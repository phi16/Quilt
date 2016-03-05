Base.write("Screen",()=>{
  var s = {};
  var a = [];
  s.add = (f)=>{
    a.push(f);
  };
  Render.loop(()=>{
    for(var i=0;i<a.length;i++)a[i]();
  });
  return s;
});