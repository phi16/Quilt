var Base = (()=>{
  var b = {};
  var a = {};
  var i = 0;
  b.write = (n,c)=>{
    a[n] = c;
    i++;
    return a[i-1];
  };
  window.onload = ()=>{
    var loadSeq = [
      "Color",
      "Event",
      "Mouse",
      "Render",
      "UI",
      "Tile"
    ];
    loadSeq.forEach(function(n){
      window[n] = a[n]();
    });
  };
  b.void = ()=>{}
  b.id = (v)=>{return v;};
  b.const = (v)=>{return ()=>{return v;};};
  b.morph = (x,y)=>{return x+(y-x)/4.0;};
  return b;
})();