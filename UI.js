Base.write("UI",()=>{
  var u = {};
  u.theme = {
    bg : Color(1,1,0.9),
    frame : Color(0.6,0.3,0),
    base : Color(1,0.97,0.8),
    front : Color(1,0.93,0.73),
    button : Color(1,0.9,0.7),
    shadow : Color(0.5,0.25,0),
    notify : Color(1,0.85,0.7),
    impact : Color(1,0.8,0.7),
    def : Color(1,0.5,0)
  };
  /*u.theme = {
    bg : Color(0,0.1,0.1),
    frame : Color(0,1,1),
    base : Color(0,0.2,0.2),
    button : Color(0,0.3,0.3),
    shadow : Color(0,0.5,0.5),
    notify : Color(0.1,0.35,0.35),
    impact : Color(0.2,0.4,0.4),
    def : Color(0,1,0.8)
  };*/
  var shadowDepth = 5;
  /**** View
  - full :: Bool
  - shadow :: Bool
  - clipped :: Bool
  - hovering :: Bool
  - onHover :: (Float,Float) -> Bool
  - onLeave :: (Float,Float) -> ()
  - onPress :: (Float,Float) -> Bool
  - onRelease :: (Float,Float) -> Bool
  - render :: (() -> ()) -> ()
  - layout :: (Float,Float) -> ()
  - rect :: (Float,Float,Float,Float)
  - parent :: View
  - children :: [View]
  - addChild :: View -> ()
  ****/
  u.defaultLayout = (v,f)=>(w,h)=>{
    v.rect.w = w;
    v.rect.h = h;
    v.children.forEach((c)=>{
      if(c.full)c.layout(w,h);
      else c.layout(c.rect.w,c.rect.h);
    });
    v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
    if(typeof f !== "undefined")f(w,h);
  };
  u.create = (f)=>{
    var v = {};
    f(v);
    v.full = v.full==null ? true : v.full;
    v.clipped = v.clipped==null ? false : v.clipped;
    v.shadow = v.shadow==null ? false : v.shadow;
    v.shadowDepth = v.shadowDepth==null ? ()=>shadowDepth : v.shadowDepth;
    v.hovering = false;
    v.onHover = v.onHover==null ? Base.const(false) : v.onHover;
    v.onLeave = v.onLeave==null ? Base.void : v.onLeave;
    v.onPress = v.onPress==null ? Base.const(false) : v.onPress;
    v.onRelease = v.onRelease==null ? Base.const(false) : v.onRelease;
    v.render = v.render==null ? Base.void : v.render;
    v.layout = v.layout==null ? u.defaultLayout(v) : v.layout;
    v.rect = v.rect==null ? {x:0,y:0,w:0,h:0} : v.rect;
    v.shape = Render.rect(0,0,0,0);
    v.parent = null;
    v.children = v.children==null ? [] : v.children;
    v.addChild = v.addChild==null ? (w)=>{
      w.parent = v;
      v.children.push(w);
    } : v.addChild;
    v.rewriteAt = v.rewriteAt==null ? (idx,w)=>{
      w.parent = v;
      v.children[idx] = w;
    } : v.rewriteAt;
    v.place = (x,y,w,h)=>{
      v.rect = {x:x,y:y,w:w,h:h};
      return v;
    };
    return v;
  };
  u.button = (run)=>{
    return (v)=>{
      v.full = false;
      v.shadow = true;
      v.clipped = true;
      var state = 0; // Default, Hover, Press, Untouch
      v.onHover = (x,y)=>{
        Mouse.cursor(Mouse.Cur.select);
        if(Mouse.pressing)state = 2;
        else state = 1;
        return true;
      };
      v.onLeave = ()=>{
        Mouse.cursor(Mouse.Cur.auto);
        if(Mouse.pressing)state = 3;
        else state = 0;
      };
      v.onPress = (x,y)=>{
        state = 2;
        return true;
      };
      v.onRelease = (x,y)=>{
        if(state == 2)run();
        state = 0;
        return true;
      };
      v.render = ()=>{
        v.shape.dup((d)=>{
          if(state==0 || state==3)d.fill(u.theme.button);
          else if(state==1)d.fill(u.theme.notify);
          else if(state==2)d.fill(u.theme.impact);
          d.stroke(2)(u.theme.frame);
        });
      };
      v.layout = (w,h)=>{
        v.children.forEach((c)=>{
          c.layout(c.rect.w,c.rect.h);
        });
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
    };
  };
  u.fullView = (l,r,t,b)=>{
    var li,ti,wi,hi;
    if(typeof r === "undefined"){
      li = ti = l;
      wi = hi = 2*l;
    }else{ // 4 args required
      li = l, ti = t;
      wi = l+r, hi = t+b;
    }
    return (v)=>{
      v.layout = (w,h)=>{
        v.rect.x = li;
        v.rect.y = ti;
        v.rect.w = w-wi;
        v.rect.h = h-hi;
        v.children.forEach((c)=>{
          if(c.full){
            c.rect.x = 0;
            c.rect.y = 0;
            c.layout(w-wi,h-hi);
          }
        });
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
    };
  };
  u.frame = ()=>{
    return (v)=>{
      v.shadow = true;
      v.clipped = true;
      v.render = (c)=>{
        v.shape.dup((d)=>{
          d.fill(u.theme.base);
          c();
          d.stroke(2)(u.theme.frame);
        });
      };
    };
  };
  u.image = (g)=>{
    return (v)=>{
      v.full = false;
      v.render = ()=>{
        Render.scale(v.rect.w,v.rect.h,()=>{
          g();
        });
      }
    };
  };
  var sequencialLayout = (dir)=>(sp_,draggable_)=>{
    var sp = typeof sp_ === "undefined" ? 0 : sp_;
    var draggable = typeof draggable_ === "undefined" ? 0 : draggable_;
    // dir?Horizontal:Vertical
    return u.create((v)=>{
      // ratio.length == v.children.length - 1
      // motRatio.length == v.children.length - 1
      var ratio = [];
      var motRatio = [];
      v.layout = (w,h)=>{
        v.rect.w = w;
        v.rect.h = h;
        if(v.children.length==0)return;
        for(var i=0;i<ratio.length;i++){
          motRatio[i] = Base.morph(motRatio[i],ratio[i]);
        }
        if(dir){
          var allW = w - (v.children.length-1)*sp;
          for(var i=0;i<v.children.length;i++){
            var c = v.children[i];
            var bi = i==0?0:motRatio[i-1];
            var bx = i==v.children.length-1?1:motRatio[i];
            c.rect.x = bi*allW + i*sp;
            c.rect.y = 0;
            c.layout(allW*(bx-bi),h);
          }
        }else{
          var allH = h - (v.children.length-1)*sp;
          for(var i=0;i<v.children.length;i++){
            var c = v.children[i];
            var bi = i==0?0:motRatio[i-1];
            var bx = i==v.children.length-1?1:motRatio[i];
            c.rect.x = 0;
            c.rect.y = bi*allH + i*sp;
            c.layout(w,allH*(bx-bi));
          }
        }
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
      v.addChild = (w)=>{
        w.parent = v;
        var r = v.children.length;
        v.children.push(w);
        r /= v.children.length;
        if(v.children.length<=1)return;
        ratio = ratio.map((a)=>r*a);
        ratio.push(r);
        motRatio.push(1);
      };
      v.insertAt = (idx,w)=>{
        w.parent = v;
        v.children.splice(idx+1,0,w);
        var ri = idx==0?0:ratio[idx-1];
        var rx = idx==ratio.length?1:ratio[idx];
        var mx = idx==ratio.length?1:motRatio[idx];
        ratio.splice(idx,0,(ri+rx)/2);
        motRatio.splice(idx,0,mx);
      };
      if(draggable){
        var drag = false;
        var idx = 0;
        function idxRect(i){
          var bi = motRatio[i];
          if(dir){
            var allW = v.rect.w - (v.children.length-1)*sp;
            var xi = bi*allW + i*sp;
            return {x:xi,y:0,w:sp,h:v.rect.h};
          }else{
            var allH = v.rect.h - (v.children.length-1)*sp;
            var yi = bi*allH + i*sp;
            return {x:0,y:yi,w:v.rect.w,h:sp};
          }
        }
        function adjust(x,y){
          var b;
          if(dir){
            var allW = v.rect.w - (v.children.length-1)*sp;
            b = ((x-sp/2)-idx*sp)/allW;
          }else{
            var allH = v.rect.h - (v.children.length-1)*sp;
            b = ((y-sp/2)-idx*sp)/allH;
          }
          var bi = idx==0?0:ratio[idx-1];
          var bx = idx==ratio.length-1?1:ratio[idx+1];
          b = Math.min(Math.max(b,bi),bx);
          ratio[idx] = motRatio[idx] = b;
        }
        v.onHover = (x,y,c)=>{
          Mouse.cursor(Mouse.Cur.auto);
          for(var i=0;i<ratio.length;i++){
            if(Base.in(idxRect(i))(x,y)){
              if(dir)Mouse.cursor(Mouse.Cur.hResize);
              else Mouse.cursor(Mouse.Cur.vResize);
            }
          }
          if(drag){
            adjust(x,y);
            return true;
          }
          return false;
        };
        v.onLeave = (x,y)=>{
          Mouse.cursor(Mouse.Cur.auto);
          if(drag){
            adjust(x,y);
            v.hovering = true;
            return true;
          }
          return false;
        };
        v.onPress = (x,y)=>{
          for(var i=0;i<ratio.length;i++){
            if(Base.in(idxRect(i))(x,y)){
              drag = true;
              idx = i;
              return true;
            }
          }
          return false;
        };
        v.onRelease = (x,y)=>{
          if(drag){
            drag = false;
            return true;
          }
          return false;
        };
      }
    });
  };
  u.horizontal = sequencialLayout(true);
  u.vertical = sequencialLayout(false);
  u.inherit = (b,f)=>{
    return (v)=>{
      b(v);
      f(v);
    };
  };

  function layoutView(v,w,h){
    v.layout(w,h);
  }
  function renderView(v){
    if(v.rect.w<0 || v.rect.h<0)return;
    Render.translate(v.rect.x,v.rect.y,()=>{
      if(v.shadow){
        Render.shadowed(v.shadowDepth(),u.theme.shadow,()=>{
          v.shape.fill(u.theme.shadow);
        });
      }
      var procChilds = false;
      var f = ()=>{
        if(procChilds)return;
        procChilds = true;
        function proc(){
          v.children.forEach(function(w){
            renderView(w);
          });
        }
        if(v.clipped){
          v.shape.clip(()=>{
            proc();
          });
        }else{
          proc();
        }
      }
      v.render(f);
      if(!procChilds)f();
    });
  }

  u.root = u.create(Base.void);
  Render.add(()=>{
    Render.rect(0,0,Render.width,Render.height).fill(u.theme.bg);
    layoutView(u.root,Render.width,Render.height);
    renderView(u.root);
  });
  function processMouse(ins,x,y,v){
    var p = x-v.rect.x;
    var q = y-v.rect.y;
    if(ins!="onLeave" && Base.in(v.rect)(x,y) && v.shape.on(p,q)){
      var pChilds = false;
      var once = false;
      var procChilds = ()=>{
        if(once)return false;
        once = true;
        for(var i=v.children.length-1;i>-1;i--){
          if(processMouse(ins,p,q,v.children[i])){
            pChilds = true;
            break;
          }
        }
        return pChilds;
      };
      var vRes = v[ins](p,q,procChilds);
      v.hovering = true;
      if(!vRes && !once)procChilds();
      return vRes || pChilds;
    }else{
      if(ins=="onHover" || ins=="onLeave" || ins=="onRelease"){
        if(v.hovering){
          v.hovering = false;
          if(ins!="onRelease")v.onLeave(p,q);
          else v.onRelease(p,q);
        }
        v.children.forEach((c)=>{
          if(ins!="onRelease")processMouse("onLeave",p,q,c);
          else processMouse("onRelease",p,q,c);
        });
      }
      return false;
    }
  }
  Event.onHover(()=>{
    processMouse("onHover",Mouse.x,Mouse.y,u.root);
  });
  Event.onPress(()=>{
    processMouse("onPress",Mouse.x,Mouse.y,u.root);
  });
  Event.onRelease(()=>{
    processMouse("onRelease",Mouse.x,Mouse.y,u.root);
  });
  return u;
});