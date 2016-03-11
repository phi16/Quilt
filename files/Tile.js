Base.write("Tile",()=>{
  var t = {};
  var C = {
    bg : Color(1,1,0.8),
    frame : Color(1,0.5,0),
    def : Color(1,1,0.9),
    brown : Color(0.6,0.3,0)
  };
  var space = 10;
  var tiling;
  function foldTiles(f,g,s,a,e,x,y,w,h){
    if(e.type==0){
      f(e,a,x,y,w,h);
    }else if(e.type==1){
      var allW = w - e.ratio.length * space;
      var px = x;
      var gu = g(e);
      for(var i=0;i<e.tiles.length;i++){
        var px2;
        if(i!=e.tiles.length-1){
          px2 = x + e.ratio[i] * allW + i * space;
          s(e,i,px2,y,space,h,x,y,w,h);
        }
        else px2 = x+w;
        a.push(i);
        if(gu(i,a,px,y,px2-px,h))foldTiles(f,g,s,a,e.tiles[i],px,y,px2-px,h);
        a.pop();
        px = px2 + space;
      }
    }else if(e.type==2){
      var allH = h - e.ratio.length * space;
      var py = y;
      var gu = g(e);
      for(var i=0;i<e.tiles.length;i++){
        var py2;
        if(i!=e.tiles.length-1){
          py2 = y + e.ratio[i] * allH + i * space;
          s(e,i,x,py2,w,space,x,y,w,h);
        }
        else py2 = y+h;
        a.push(i);
        if(gu(i,a,x,py,w,py2-py))foldTiles(f,g,s,a,e.tiles[i],x,py,w,py2-py);
        a.pop();
        py = py2 + space;
      }
    }
  }
  function defaultFold(f,g,sp){
    var s = ()=>{};
    if(sp!=null)s = sp;
    foldTiles(f,g,s,[],tiling,space,space,Render.width-2*space,Render.height-2*space);
  }
  var onMouse=null;
  var onDrag=null,dragIndex=0,dragRange=[],dragArea=[];
  Event.onPress(()=>{
    onMouse=null;
    defaultFold((e,a,x,y,w,h)=>{
      e.onPress(Mouse.x-(x+w/2),Mouse.y-(y+h/2),a);
      if(Mouse.in(x,y,w,h))onMouse = e;
    },(e)=>(i,a,x,y,w,h)=>{
      return Mouse.in(x,y,w,h);
    },(e,i,x,y,w,h,ex,ey,ew,eh)=>{
      if(Mouse.in(x,y,w,h)){
        onDrag = e;
        dragIndex = i;
        dragRange = [];
        dragArea = [];
        var fi = i>0, la = i+1<e.ratio.length;
        if(fi)dragRange.push(e.ratio[i-1]);
        else dragRange.push(0);
        if(la)dragRange.push(e.ratio[i+1]);
        else dragRange.push(1);
        if(e.type==1){
          var allW = ew - e.ratio.length * space;
          if(fi)dragArea.push(ex + e.ratio[i-1] * allW + (i+0.5) * space);
          else dragArea.push(ex);
          if(la)dragArea.push(ex + e.ratio[i+1] * allW + (i+0.5) * space);
          else dragArea.push(ex+ew);
        }else if(e.type==2){
          var allH = eh - e.ratio.length * space;
          if(fi)dragArea.push(ey + e.ratio[i-1] * allH + (i+0.5) * space);
          else dragArea.push(ey);
          if(la)dragArea.push(ey + e.ratio[i+1] * allH + (i+0.5) * space);
          else dragArea.push(ey+eh);
        }
      }
    });
  });
  Event.onHover(()=>{
    if(onDrag==null){
      Mouse.cursor();
      if(!Mouse.pressing)onMouse = null;
      defaultFold((e,a,x,y,w,h)=>{
        e.onHover(Mouse.x-(x+w/2),Mouse.y-(y+h/2),a);
        if(Mouse.pressing){
          if(Mouse.in(x,y,w,h) && onMouse!=e)onMouse = null;
        }else{
          if(Mouse.in(x,y,w,h))onMouse = e;
        }
      },(e)=>(i,a,x,y,w,h)=>{
        return Mouse.in(x,y,w,h);
      },(e,i,x,y,w,h,ex,ey,ew,eh)=>{
        if(Mouse.in(x,y,w,h)){
          if(e.type==1)Mouse.cursor(Mouse.Cur.hResize);
          else if(e.type==2)Mouse.cursor(Mouse.Cur.vResize);
        }
      });
    }else{
      if(onDrag.type==1){
        var mx = (Mouse.x-dragArea[0]) / (dragArea[1]-dragArea[0]);
        mx = Math.min(Math.max(mx,0),1);
        var r = dragRange[0]*(1-mx) + dragRange[1]*mx;
        onDrag.toRatio[dragIndex] = onDrag.ratio[dragIndex] = r;
      }else{
        var my = (Mouse.y-dragArea[0]) / (dragArea[1]-dragArea[0]);
        my = Math.min(Math.max(my,0),1);
        var r = dragRange[0]*(1-my) + dragRange[1]*my;
        onDrag.toRatio[dragIndex] = onDrag.ratio[dragIndex] = r;
      }
    }
  });
  Event.onRelease(()=>{
    defaultFold((e,a,x,y,w,h)=>{
      e.onRelease(Mouse.x-(x+w/2),Mouse.y-(y+h/2),a);
      if(onMouse==e)e.onClick(Mouse.x-(x+w/2),Mouse.y-(y+h/2),a);
      if(Mouse.in(x,y,w,h))onMouse = e;
    },(e)=>(i,a,x,y,w,h)=>{
      return Mouse.in(x,y,w,h);
    });
    onDrag = onMouse = null;
  });
  function unifyTiling(e){
    var tiles = e.tiles;
    var ratio = e.ratio;
    var toRatio = e.toRatio;
    e.tiles = [];
    e.ratio = [];
    e.toRatio = [];
    for(var i=0;i<tiles.length;i++){
      if(tiles[i].type==e.type){
        for(var j=0;j<tiles[i].tiles.length;j++){
          e.tiles.push(tiles[i].tiles[j]);
        }
        var r1 = i==0?0:ratio[i-1];
        var r2 = i>ratio.length-1?1:ratio[i];
        var t1 = i==0?0:toRatio[i-1];
        var t2 = i>toRatio.length-1?1:toRatio[i];
        for(var j=0;j<tiles[i].ratio.length;j++){
          var r = tiles[i].ratio[j];
          var t = tiles[i].toRatio[j];
          e.ratio.push(r1*(1-r)+r2*r);
          e.toRatio.push(t1*(1-t)+t2*t);
        }
        if(i!=tiles.length-1){
          e.ratio.push(ratio[i]);
          e.toRatio.push(toRatio[i]);
        }
      }else{
        e.tiles.push(tiles[i]);
        if(i!=tiles.length-1){
          e.ratio.push(ratio[i]);
          e.toRatio.push(toRatio[i]);
        }
      }
    }
  }
  t.makeTile = (obj)=>{ //can be used as clone
    var u = {};
    u.type = 0;
    u.parent = null;
    u.onPress = obj.onPress==null?(x,y,a)=>{}:obj.onPress;
    u.onHover = obj.onHover==null?(x,y,a)=>{}:obj.onHover;
    u.onRelease = obj.onRelease==null?(x,y,a)=>{}:obj.onRelease;
    u.onClick = obj.onClick==null?(x,y,a)=>{}:obj.onClick;
    u.render = obj.render==null?(w,h)=>{}:obj.render;
    return u;
  };
  t.putTile = (obj,idx)=>{
    var par = null;
    defaultFold((e,a,x,y,w,h)=>{
      var o = t.makeTile(e);
      if(w>h)e.type = 1;
      else e.type = 2;
      e.parent = par;
      e.tiles = [o,obj];
      e.ratio = [1];
      e.toRatio = [0.5];
      o.parent = obj.parent = e;
      if(par)unifyTiling(par);
    },(e)=>(i,a,x,y,w,h)=>{
      var b = idx[a.length-1]==i;
      if(b)par = e;
      return b;
    });
  };
  var poyo;
  poyo = {
    onClick : (x,y,a)=>{
      t.putTile(t.makeTile(poyo),a);
    },
    render : (w,h)=>{
      Render.circle(w<h?w/2:h/2).fill(1,0.5,0);
    }
  };
  t.dump = ()=>{console.log(tiling)};
  tiling = t.makeTile(poyo);
  Render.add(()=>{
    Render.rect(0,0,Render.width,Render.height).fill(C.bg);
    defaultFold((e,a,x,y,w,h)=>{
      if(e.color==null)e.color=0;
      if(e==onMouse)e.color += (1-e.color)/4.0;
      else e.color += (0-e.color)/4.0;
      Render.rect(x-space/4,y+space/2,w+space*2/4,h).fill(C.frame,0.5);
      Render.rect(x,y,w,h).fill(Color.mix(C.def,C.frame,e.color/8));
      Render.rect(x,y,w,h).stroke(2)(Color.mix(C.frame,C.brown,e.color/4));
      Render.rect(x,y,w,h).clip(()=>{
        Render.translate(x+w/2,y+h/2,()=>{
          e.render(w,h);
        });
      });
    },(e)=>{
      for(var i=0;i<e.ratio.length;i++){
        e.ratio[i] += (e.toRatio[i] - e.ratio[i]) / 4.0;
      }
      return ()=>true;
    });
  });
  return t;
});