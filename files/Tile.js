Base.write("Tile",()=>{
  var t = {};
  var C = {
    bg : Color(1,1,0.8),
    frame : Color(1,0.5,0),
    def : Color(1,1,0.9),
    brown : Color(0.6,0.3,0)
  };
  var space = 10;
  var tiling = {type:0};
  function foldTiles(f,g,e,x,y,w,h){
    if(e.type==0){
      f(e,x,y,w,h);
    }else if(e.type==1){
      var allW = w - e.ratio.length * space;
      var px = x;
      var gu = g(e);
      for(var i=0;i<e.tiles.length;i++){
        var px2;
        if(i!=e.tiles.length-1)px2 = x + e.ratio[i] * allW + i * space;
        else px2 = x+w;
        if(gu(i,px,y,px2-px,h))foldTiles(f,g,e.tiles[i],px,y,px2-px,h);
        px = px2 + space;
      }
    }else if(e.type==2){
      var allH = h - e.ratio.length * space;
      var py = y;
      var gu = g(e);
      for(var i=0;i<e.tiles.length;i++){
        var py2;
        if(i!=e.tiles.length-1)py2 = y + e.ratio[i] * allH + i * space;
        else py2 = y+h;
        if(gu(i,x,py,w,py2-py))foldTiles(f,g,e.tiles[i],x,py,w,py2-py);
        py = py2 + space;
      }
    }
  }
  function defaultFold(f,g){
    foldTiles(f,g,tiling,space,space,Window.width-2*space,Window.height-2*space);
  }
  var onMouse;
  Event.onClick(()=>{
    onMouse=null;
    defaultFold((e,x,y,w,h)=>{
      if(e.onClick)e.onClick();
      {
        var i = Math.random() < 0.5 ? 1 : 2;
        e.type = i;
        e.tiles = [{type:0},{type:0}];
        e.ratio = [Math.random()<0.5?1:0];
        e.toRatio = [0.5];
      }
      onMouse = e;
    },(e)=>(i,x,y,w,h)=>{
      return Mouse.in(x,y,w,h);
    });
  });
  Event.onHover(()=>{
    onMouse=null;
    defaultFold((e,x,y,w,h)=>{
      if(e.onHover)e.onHover();
      onMouse = e;
    },(e)=>(i,x,y,w,h)=>{
      return Mouse.in(x,y,w,h);
    });
  })
  Screen.add(()=>{
    Render.rect(0,0,Window.width,Window.height).fill(C.bg);
    defaultFold((e,x,y,w,h)=>{
      if(e.color==null)e.color=0;
      if(e==onMouse)e.color += (1-e.color)/4.0;
      else e.color += (0-e.color)/4.0;
      Render.rect(x-space/4,y+space/2,w+space*2/4,h).fill(C.frame,0.5);
      Render.rect(x,y,w,h).fill(Color.mix(C.def,C.frame,e.color/8));
      Render.rect(x,y,w,h).stroke(2)(Color.mix(C.frame,C.brown,e.color/4));
    },(e)=>{
      for(var i=0;i<e.ratio.length;i++){
        e.ratio[i] += (e.toRatio[i] - e.ratio[i]) / 4.0;
      }
      return ()=>true;
    });
  });
  return t;
});