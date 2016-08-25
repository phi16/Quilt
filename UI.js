Base.write("UI",()=>{
  var u = {};
  /*u.theme = {
    bg : Color(1,0.95,0.8),
    frame : Color(0.6,0.3,0),
    base : Color(1,0.98,0.95),
    front : Color(1,0.93,0.83),
    button : Color(1,0.9,0.7),
    shadow : Color(0.5,0.25,0),
    notify : Color(1,0.85,0.7),
    impact : Color(1,0.8,0.7),
    split : Color(0.6,0.25,0),
    def : Color(1,0.5,0),
    sharp : Color(0.5,0,0)
  };*/
  u.theme = {
    bg : Color(0,0.1,0.1),
    frame : Color(0,1,1),
    base : Color(0,0.2,0.2),
    front : Color(0,0.23,0.28),
    button : Color(0,0.3,0.35),
    shadow : Color(0,0.5,0.5),
    notify : Color(0.1,0.35,0.46),
    impact : Color(0.2,0.4,0.48),
    split : Color(0.3,0.8,1.0),
    def : Color(0,1,0.8),
    sharp : Color(0,0.2,1),
    in : Color(0,0.8,0.6),
    out : Color(0.2,0.8,1.0)
  };
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
    v.name = "unnamed";
    v.full = true;
    v.clipped = false;
    v.shadow = false;
    v.shadowDepth = ()=>shadowDepth;
    v.hovering = false;
    v.checkRightButton = false;
    v.onHover = Base.const(false);
    v.onLeave = Base.void;
    v.onPress = Base.const(false);
    v.onRelease = Base.const(false);
    v.onWheel = Base.const(false);
    v.render = Base.void;
    v.layout = u.defaultLayout(v);
    v.rect = {x:0,y:0,w:0,h:0};
    v.shape = Render.rect(0,0,0,0);
    v.parent = null;
    v.children = [];
    v.addChild = (w)=>{
      w.parent = v;
      v.children.push(w);
    };
    v.rewriteAt = (idx,w)=>{
      w.parent = v;
      v.children[idx] = w;
    };
    v.removeAt = (idx)=>{
      v.children.splice(idx);
      return false;
    };
    v.place = (x,y,w,h)=>{
      v.rect = {x:x,y:y,w:w,h:h};
      return v;
    };
    v.available = true;
    f(v);
    return v;
  };
  u.button = (run)=>{
    return (v)=>{
      v.name = "button";
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
        if(state == 2 && run)run(v);
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
      v.name = "fullView";
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
      v.name = "frame";
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
      v.name = "image";
      v.full = false;
      v.render = ()=>{
        Render.scale(v.rect.w,v.rect.h,()=>{
          g();
        });
      }
    };
  };
  var sequencialLayout = (dir)=>(sp_,draggable_,vanish)=>{
    var sp = typeof sp_ === "undefined" ? 0 : sp_;
    var draggable = typeof draggable_ === "undefined" ? 0 : draggable_;
    // dir?Horizontal:Vertical
    return (v)=>{
      // ratio.length == v.children.length - 1
      // motRatio.length == v.children.length - 1
      var ratio = [];
      var motRatio = [];
      v.name = dir ? "horizontal" : "vertical"
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
        var ri = idx<=0?0:ratio[idx-1];
        var rx = idx==ratio.length?1:idx==-1?ratio.length==0?1:ratio[0]:ratio[idx];
        var mx = idx==ratio.length?1:idx==-1?0:motRatio[idx];
        if(idx<0)idx=0;
        ratio.splice(idx,0,(ri+rx)/2);
        motRatio.splice(idx,0,mx);
        return {noMotion : ()=>{
          ratio[idx] = motRatio[idx];
        }};
      };
      v.removeAt = (idx)=>{
        v.children.splice(idx,1);
        if(idx==0){
          ratio.shift();
          motRatio.shift();
        }else if(idx==ratio.length){
          ratio.pop();
          motRatio.pop();
        }else{
          ratio.splice(idx,1);
          motRatio.splice(idx,1);
        }
        return v.children.length == 1;
      };
      if(draggable){
        var idx = 0;
        v.grab = (i)=>{
          Mouse.drag = v;
          idx = i;
          v.hovering = true;
        };
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
          if(Mouse.drag == v){
            adjust(x,y);
            return true;
          }
          return false;
        };
        v.onLeave = (x,y)=>{
          Mouse.cursor(Mouse.Cur.auto);
          if(Mouse.drag == v){
            adjust(x,y);
            v.hovering = true;
            return true;
          }
          return false;
        };
        v.onPress = (x,y)=>{
          for(var i=0;i<ratio.length;i++){
            if(Base.in(idxRect(i))(x,y)){
              v.grab(i);
              return true;
            }
          }
          return false;
        };
        v.onRelease = (x,y)=>{
          if(Mouse.drag == v){
            if(ratio[idx]==0){
              vanish(v,0);
            }else if(idx-1>=0 && ratio[idx-1]==ratio[idx]){
              vanish(v,idx);
            }else if(idx+1<ratio.length && ratio[idx]==ratio[idx+1]){
              vanish(v,idx+1);
            }else if(ratio[idx]==1){
              vanish(v,ratio.length);
            }
            Mouse.drag = null;
            Mouse.cursor(Mouse.Cur.auto);
            return true;
          }
          return false;
        };
      }
    };
  };
  u.horizontal = sequencialLayout(true);
  u.vertical = sequencialLayout(false);
  u.field = (g,handler)=>{
    return (v)=>{
      var cx,cy;
      var mx=0,my=0,mz=0;
      var dx=0,dy=0,dz=1;
      v.name = "field";
      v.full = true;
      v.clipped = false;
      v.checkRightButton = true;
      v.onPress = (x,y)=>{
        if(Mouse.right && !Mouse.drag){
          cx = x,cy = y;
          Mouse.drag = v;
          return true;
        }else if(Mouse.left && handler && handler.onPress){
          handler.onPress((x-dx)/dz,(y-dy)/dz);
        }else return false;
      };
      v.onHover = (x,y)=>{
        if(Mouse.right && Mouse.drag == v){
          dx += x-cx;
          dy += y-cy;
          cx = x;
          cy = y;
          return true;
        }else if(Mouse.left && handler && handler.onHover){
          handler.onHover((x-dx)/dz,(y-dy)/dz);
          return true;
        }else return false;
      };
      v.onLeave = (x,y)=>{
        v.hovering = true;
        v.onHover(x,y);
      };
      v.onRelease = (x,y)=>{
        if(Mouse.right && Mouse.drag == v){
          Mouse.drag = null;
          return true;
        }else if(Mouse.left && handler && handler.onRelease){
          handler.onRelease((x-dx)/dz,(y-dy)/dz);
        }else return false;
      };
      v.onWheel = (x,y)=>{
        var p=(x-dx)/dz, q=(y-dy)/dz;
        if(Mouse.wheel > 0)dz *= Math.sqrt(2);
        else if(Mouse.wheel < 0)dz /= Math.sqrt(2);
        if(dz < 0.25)dz = 0.25;
        if(dz > 2)dz = 2;
        dx = x-dz*p, dy = y-dz*q;
      };
      v.render = (c)=>{
        mx += (dx - mx) / 2;
        my += (dy - my) / 2;
        mz += (dz - mz) / 2;
        v.shape.clip(()=>{
          Render.translate(mx,my,()=>{
            Render.scale(mz,mz,()=>{
              g(mx,my,mz);
              c();
            });
          });
        });
      };
      v.layout = (w,h)=>{
        v.rect.w = w;
        v.rect.h = h;
        v.children.forEach((c)=>{
          c.layout(1,1);
        });
        v.shape = Render.rect(0,0,w,h);
      };
      v.scale = ()=>{
        return mz;
      }
    };
  };
  u.scroll = (shx,shy,close)=>{
    var dir = shx==-1 ? true : false;
    if(close==null)close = true;
    return (v)=>{
      var scrWidth = 15;
      var mx=0,my=0;
      var dx=0,dy=0;
      v.name = "scroll";
      v.full = true;
      v.clipped = false;
      v.checkRightButton = false;
      var main = UI.create((v)=>{
        v.name = "scrollContainer";
      });
      var scroll = UI.create(UI.inherit(UI.frame(),(v)=>{
        v.name = "scrollBar";
        v.layout = (w,h)=>{
          v.rect.w = w;
          v.rect.h = h;
          v.children[0].place(0,0,scrWidth,scrWidth);
          if(dir){
            v.children[1].place(0,h-scrWidth,scrWidth,scrWidth);
            if(h < shy){
              var hei = h - scrWidth * 2;
              var scrH = h / shy * hei;
              var ratio = my / (shy - h);
              v.children[2].place(0,scrWidth + ratio * (hei - scrH),scrWidth,scrH);
            }else{
              v.children[2].place(0,0,scrWidth,h);
            }
          }else{
            v.children[1].place(w-scrWidth,0,scrWidth,scrWidth);
            if(w < shx){
              var wid = w - scrWidth * 2;
              var scrW = w / shx * wid;
              var ratio = mx / (shx - w);
              v.children[2].place(scrWidth + ratio * (wid - scrW),0,scrW,scrWidth);
            }else{
              v.children[2].place(0,0,w,scrWidth);
            }
          }
          v.children.forEach((c)=>{
            if(c.full)c.layout(w,h);
            else c.layout(c.rect.w,c.rect.h);
          });
          v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
        };
      }));
      function adjustX(diffX,baseDx){
        var w = v.rect.w;
        var wid = w - scrWidth * 2;
        var scrW = w / shx * wid;
        var pos = diffX / (wid - scrW) * (shx - w);
        dx = baseDx + pos;
        if(dx < 0)dx = 0;
        if(dx > shx-v.rect.w)dx = shx-v.rect.w;
      }
      function adjustY(diffY,baseDy){
        var h = v.rect.h;
        var hei = h - scrWidth * 2;
        var scrH = h / shy * hei;
        var pos = diffY / (hei - scrH) * (shy - h);
        dy = baseDy + pos;
        if(dy < 0)dy = 0;
        if(dy > shy-v.rect.h)dy = shy-v.rect.h;
      }
      var adjust = dir ? adjustY : adjustX;
      v.addChild(main);
      v.addChild(scroll);
      scroll.addChild(UI.create(UI.button(()=>{
        if(dir){
          dy -= 50;
          if(dy < 0)dy = 0;
        }else{
          dx -= 50;
          if(dx < 0)dx = 0;
        }
      })));
      scroll.addChild(UI.create(UI.button(()=>{
        if(dir){
          dy += 50;
          if(dy > shy-v.rect.h)dy = shy-v.rect.h;
        }else{
          dx += 50;
          if(dx > shx-v.rect.w)dx = shx-v.rect.w;
        }
      })));
      scroll.addChild(UI.create(UI.inherit(UI.button(Base.void),(v)=>{
        var onPress = v.onHover;
        var onHover = v.onHover;
        var onLeave = v.onLeave;
        var onRelease = v.onRelease;
        var baseX = 0, baseDx = dx;
        var baseY = 0, baseDy = dy;
        v.onPress = (x,y)=>{
          if(dir && v.rect.h < shy || !dir && v.rect.w < shx){
            baseX = x + v.rect.x, baseDx = dx;
            baseY = y + v.rect.y, baseDy = dy;
            Mouse.drag = v;
            v.hovering = true;
          }
          return onPress(x,y);
        };
        v.onHover = (x,y)=>{
          if(Mouse.drag == v){
            if(dir){
              adjust(y + v.rect.y - baseY, baseDy);
            }else{
              adjust(x + v.rect.x - baseX, baseDx);
            }
          }
          return onHover(x,y);
        };
        v.onLeave = (x,y)=>{
          if(Mouse.drag == v){
            if(dir){
              adjust(y + v.rect.y - baseY, baseDy);
            }else{
              adjust(x + v.rect.x - baseX, baseDx);
            }
            v.hovering = true;
            return true;
          }
          return onLeave();
        };
        v.onRelease = (x,y)=>{
          onRelease(x,y);
          if(Mouse.drag == v){
            if(dir){
              adjust(y + v.rect.y - baseY, baseDy);
            }else{
              adjust(x + v.rect.x - baseX, baseDx);
            }
            Mouse.drag = null;
            v.hovering = false;
            return true;
          }
          return false;
        };
      })));
      v.onWheel = (x,y)=>{
        var p=x-dx, q=y-dy;
        if(dir){
          if(Mouse.wheel > 0)dy -= 50;
          else if(Mouse.wheel < 0)dy += 50;
          if(dy < 0)dy = 0;
          if(dy > shy-v.rect.h)dy = shy-v.rect.h;
        }else{
          if(Mouse.wheel > 0)dx -= 50;
          else if(Mouse.wheel < 0)dx += 50;
          if(dx < 0)dx = 0;
          if(dx > shx-v.rect.w)dx = shx-v.rect.w;
        }
        return false;
      };
      v.render = ()=>{
        mx += (dx - mx) / 2;
        my += (dy - my) / 2;
      };
      v.layout = (w,h)=>{
        v.rect.w = w;
        v.rect.h = h;
        if(dir){
          if(h > shy){
            my = dy = 0;
            if(close)scrWidth += (0 - scrWidth) / 2;
          }else{
            if(dy > shy-v.rect.h && my > shy-v.rect.h)my = dy = shy-v.rect.h;
            if(close)scrWidth += (15 - scrWidth) / 2;
          }
          main.place(-mx,-my,w-scrWidth,shy);
          scroll.place(w-scrWidth,0,scrWidth,h);
        }else{
          if(w > shx){
            mx = dx = 0;
            if(close)scrWidth += (0 - scrWidth) / 2;
          }else{
            if(dx > shx-v.rect.w && mx > shx-v.rect.w)mx = dx = shx-v.rect.w;
            if(close)scrWidth += (15 - scrWidth) / 2;
          }
          main.place(-mx,-my,shx,h-scrWidth);
          scroll.place(0,h-scrWidth,w,scrWidth);
        }
        main.layout(main.rect.w,main.rect.h);
        scroll.layout(scroll.rect.w,scroll.rect.h);
        v.shape = Render.rect(0,0,w,h);
      };
      v.addChild = (w)=>{
        w.parent = main;
        main.children.push(w);
      };
      v.resize = (u)=>{
        if(dir){
          shy = u;
        }else{
          shx = u;
        }
      };
    };
  };
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
  u.root.name = "root";
  var time = 0;
  Render.add(()=>{
    Render.rect(0,0,Render.width,Render.height).fill(u.theme.bg);
    layoutView(u.root,Render.width,Render.height);
    renderView(u.root);
    time++;
  });
  u.time = ()=>{return time;};
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
      var vRes = false;
      if(Mouse.left || ins == "onHover" || ins == "onLeave" || ins == "onWheel" || v.checkRightButton){
        vRes = v[ins](p,q,procChilds);
      }
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
    Mouse.drag = null;
  });
  Event.onWheel(()=>{
    processMouse("onWheel",Mouse.x,Mouse.y,u.root);
  });
  u.showTree = ()=>{
    var ids = {};
    var str = "";
    function append(s){
      str += s + "\n";
    }
    function f(v,u){
      if(v.checked){
        append(u + "[Circular]");
        return;
      }
      if(ids[v.name]==null)ids[v.name] = 0;
      v.checked = ids[v.name]++;
      // if(v.index){
      //   append(u + v.name+ " / " + JSON.stringify(v.index));
      // }else{
        append(u + v.name + (v.available?"":" *"));
      // }
      // if(v.parent && v.parent.index){
      //   append(u + JSON.stringify(v.parent.index));
      // }
      if(v.name != "menu" && v.name != "title"){
        v.children.forEach((c)=>{
          f(c,u+"| ");
        });
      }else{
        append(u+"| ...");
      }
      delete v.checked;
    }
    f(u.root,"");
    console.log(str);
  };
  u.dispose = (v)=>{
    if(!v.available)return;
    v.available = false;
    v.children.forEach((c)=>{
      u.dispose(c);
    });
  };
  return u;
});