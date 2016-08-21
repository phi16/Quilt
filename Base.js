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
      "Listener",
      "Render",
      "UI",
      "Tile",
      "System"
    ];
    loadSeq.forEach(function(n){
      window[n] = a[n]();
    });
  };
  b.void = ()=>{}
  b.id = (v)=>{return v;};
  b.const = (v)=>{return ()=>{return v;};};
  b.morph = (x,y)=>{return x+(y-x)/4.0;};
  b.in = (x_,y_,w_,h_)=>{
    var x,y,w,h;
    if(typeof y_ === "undefined"){
      x = x_.x, y = x_.y, w = x_.w, h = x_.h;
    }else{
      x = x_, y = y_, w = w_, h = h_;
    }
    return (p,q)=>{
      return x<=p && p<=x+w && y<=q && q<=y+h;
    };
  };
  b.clone = (a)=>a.concat([]);
  b.with = (v,f)=>f(v);
  b.distance = (x1,y1,x2,y2)=>{
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
  };
  b.equals = (x,y)=>{
    return Math.abs(x,y) < 0.0001;
  };
  b.dir = (x,y)=>{
    // Counter Clockwise
    if(x==1){
      if(y==0)return 0;
      if(y==1)return 1;
      if(y==-1)return 7;
    }
    if(x==0){
      if(y==-1)return 2;
      if(y==1)return 6;
    }
    if(x==-1){
      if(y==-1)return 3;
      if(y==0)return 4;
      if(y==1)return 5;
    }
    return -1;
  };
  Math.PHI = (1 + Math.sqrt(5)) / 2;
  return b;
})();