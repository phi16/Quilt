Base.write("System",()=>{
  var s = {};

  var dupView = null;
  dupView = (v)=>{
    v.onPress = (x,y)=>{
      Tile.putTile(Tile.makeTile(dupView),v.parent.index);
    };
    v.render = ()=>{
      var r = Math.min(v.rect.w/2,v.rect.h/2);
      Render.shadowed(5,UI.theme.shadow,()=>{
        Render.circle(v.rect.w/2,v.rect.h/2,r).stroke(4)(UI.theme.def);
      });
    };
  };
  Tile.registerTile("DupTile",dupView,()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.circle(0.5,0.5,0.3).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Field",(v)=>{
    v.store = null;
    var size = 80;
    var c = UI.create(UI.field((dx,dy,dz)=>{
      for(var i=-1;i<v.rect.h/size/dz;i++){
        Render.line(-dx/dz,(i-Math.floor(dy/size/dz))*size,(v.rect.w-dx)/dz,(i-Math.floor(dy/size/dz))*size).stroke(1/dz)(UI.theme.impact);
      }
      for(var i=-1;i<v.rect.w/size/dz;i++){
        Render.line((i-Math.floor(dx/size/dz))*size,-dy/dz,(i-Math.floor(dx/size/dz))*size,(v.rect.h-dy)/dz).stroke(1/dz)(UI.theme.impact);
      }
    },{
      onPress : (x,y)=>{
        v.store.begin(s.control.current.execute,x,y);
      },
      onHover : (x,y)=>{
        v.store.pass(x,y);
      },
      onRelease : (x,y)=>{
        v.store.end();
      }
    }));
    v.store = s.field(c,size);
    v.addChild(c);
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Control",(v)=>{
    var sc = s.control;
    var ope = UI.create(UI.inherit(UI.frame(),(v)=>{v.full = false;})).place(10,10,60,60);
    var oldName = sc.current.name, curName = sc.current.name;
    var animate = 1;
    ope.addChild(UI.create(UI.image(()=>{
      Render.rect(0,0,1,1).fill(UI.theme.front);
      var v = Math.cos(animate*Math.PI)*0.5+0.5;
      Render.translate(0,1-v,()=>{
        Render.scale(1,v,()=>{
          sc.list[oldName].draw();
        });
      })
      Render.scale(1,1-v,()=>{
        sc.list[curName].draw();
      });
      Render.line(0,1-v,1,1-v).stroke(0.03)(UI.theme.def);
      animate += 0.1;
      if(animate > 1)animate = 1;
    })).place(0,0,60,60));
    v.addChild(ope);
    var bar = UI.create(UI.image(()=>{
      Render.shadowed(3,UI.theme.shadow,()=>{
        Render.line(0,0,1,0).stroke(0.1)(UI.theme.split);
      });
    })).place(8,80,100,20);
    v.addChild(bar);
    sc.listener.on("change",()=>{
      if(!v.available)return true;
      if(curName == sc.current.name)return;
      oldName = curName;
      curName = sc.current.name;
      animate = 0;
    });
    v.layout = (w,h)=>{
      UI.defaultLayout(v)(w,h);
      bar.rect.w = w - 8*2;
    };
    for(var i=0;i<sc.name.length;i++){
      ((j)=>{
        var name = sc.name[j];
        var btn = UI.create(UI.button(()=>{
          sc.set(name);
        })).place(i*50+10,90,40,40);
        btn.addChild(UI.create(UI.image(()=>{
          sc.list[name].draw();
        })).place(0,0,40,40));
        v.addChild(btn);
      })(i);
    }
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.translate(0.5,0.5,()=>{
        Render.rotate(Math.PI/4,()=>{
          Render.rect(-0.25,-0.25,0.5,0.5).stroke(0.1)(UI.theme.def);
        });
      });
    });
  });
  Tile.registerTile("FunctionList",(v)=>{
    var scroll = UI.create(UI.scroll(500));
    var list = UI.create(UI.vertical(0));
    scroll.addChild(list);
    v.addChild(scroll);
    for(var i=0;i<10;i++){
      var row = UI.create(UI.frame());
      row.addChild(UI.create(UI.button(Base.void)).place(10,10,30,30));
      list.addChild(row);
    }
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.line(0.2,0.2+0.05,0.8,0.2+0.05).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.8-0.05,0.8,0.8-0.05).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("NoneTile",Base.void,Base.void);

  Tile.initTile();

  s.control = (()=>{
    var c = {};
    c.list = {
      Select : {
        draw : ()=>{
          Render.rect(0.3,0.3,0.4,0.4).stroke(0.1)(UI.theme.def);
        },
        execute : ()=>function*(f,v){
          var start = {x:0,y:0},current = {x:0,y:0};
          var first = true, end = false;
          v.addChild(UI.create(UI.image(()=>{
            if(!first && !end){
              Render.shadowed(4,UI.theme.frame,()=>{
                Render.rect(start.x,start.y,current.x-start.x,current.y-start.y).stroke(1/f.scale())(UI.theme.def);
              });
            }
          })).place(0,0,1,1));
          while(true){
            while(p = yield)if(!p.onPoint)break;
            if(!p)break;
            if(first){
              first = false;
              start.x = current.x = p.x;
              start.y = current.y = p.y;
            }else{
              current.x = p.x;
              current.y = p.y;
            }
          }
          end = true;
        }
      },
      Move : {
        draw : ()=>{
          Render.line(0.5,0.2,0.5,0.8).stroke(0.1)(UI.theme.def);
          Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
        },
        execute : ()=>function*(f,v){}
      },
      Operate : {
        draw : ()=>{
          Render.translate(0.5,0.5,()=>{
            Render.rotate(Math.PI/4,()=>{
              Render.rect(-0.18,-0.18,0.36,0.36).stroke(0.1)(UI.theme.def);
            });
          });
        },
        execute : ()=>function*(f,v){}
      },
      Place : {
        draw : ()=>{
          Render.circle(0.5,0.5,0.25).stroke(0.1)(UI.theme.def);
        },
        execute : ()=>function*(f,v){
          var p;
          while(p = yield)if(p.onPoint)break;
          f.place(p.x,p.y);
          c.set("Connect",p);
          f.rewriteAction(s.control.current.execute);
        }
      },
      Connect : {
        draw : ()=>{
          Render.line(0.2,0.35,0.8,0.35).stroke(0.1)(UI.theme.def);
          Render.line(0.2,0.65,0.8,0.65).stroke(0.1)(UI.theme.def);
        },
        execute : (s)=>function*(f,v){
          var size = 80;
          var curE=false, curX, curY, curR, curMX, curMY, state;
          state = 1;
          var curImage = UI.create(UI.image(()=>{
            Render.circle(curMX*size,curMY*size,curR*size*0.3).dup((d)=>{
              d.fill(UI.theme.def,0.1);
              d.stroke(2)(UI.theme.def);
            });
            curMX += (curX - curMX) / 2;
            curMY += (curY - curMY) / 2;
            curR += (state - curR) / 2;
          })).place(0,0,1,1);
          if(s){
            curE = true;
            curR = 0;
            curMX = curX = s.x;
            curMY = curY = s.y;
            v.addChild(curImage);
          }
          var p;
          while(p = yield){
            if(!p.onPoint)continue;
            if(!curE || Math.max(Math.abs(curX-p.x),Math.abs(curY-p.y)) == 1){
              if(!curE){
                curR = 0;
                curMX = p.x;
                curMY = p.y;
                v.addChild(curImage);
                if(!f.exist(p.x,p.y)){
                  f.place(p.x,p.y);
                }
              }else{
                if(!f.exist(p.x,p.y)){
                  f.place(p.x,p.y);
                }
                f.connect(curX,curY,p.x,p.y);
              }
              curE = true;
              curX = p.x;
              curY = p.y;
            }
          }
          state = 0;
          c.set("Connect");
        }
      }
    };
    c.name = ["Select","Move","Operate","Place","Connect"];
    c.current = {
      name : "Select",
      execute : c.list["Select"].execute()
    };
    c.listener = Listener();
    c.set = (n,opt)=>{
      c.current.name = n;
      c.current.execute = c.list[n].execute(opt);
      c.listener.push("change",null);
    };
    return c;
  })();
  s.field = (v,size)=>{
    var f = {};
    var map = {};
    var action = null;
    var lastE,lastX,lastY;
    var view = UI.create((v)=>{v.name="overlay";});
    var viewIx = v.children.length;
    v.addChild(view);
    function i(x){
      return Math.floor(x/size+0.5);
    }
    f.newView = ()=>{
      view = UI.create((v)=>{v.name="overlay";});
      UI.dispose(v.children[viewIx]);
      v.rewriteAt(viewIx,view);
    };
    f.begin = (inst,ux,uy)=>{
      f.newView();
      action = inst(f,view);
      if(action.next().value)action = null;
      lastE = false;
      f.pass(ux,uy);
    };
    f.pass = (ux,uy)=>{
      if(action){
        if(action.next({onPoint:false,x:ux,y:uy}).value)action = null;
        var x = i(ux), y = i(uy);
        if(Base.distance(x,y,ux/size,uy/size) < 0.4 && (!lastE || lastX!=x || lastY!=y)){
          lastE = true, lastX = x, lastY = y;
          if(action.next({onPoint:true,x:x,y:y}).value)action = null;
        }
      }
    };
    f.end = ()=>{
      if(action){
        action.next(null);
        action = null;
      }
    };
    f.rewriteAction = (inst)=>{
      f.newView();
      action = inst(f,view);
      if(action.next().value)action = null;
    };
    f.scale = ()=>{
      return v.scale();
    };
    f.exist = (x,y)=>{
      return map[[x,y]]!=null;
    }
    f.place = (x,y,func)=>{
      if(map[[x,y]] != null)return false;
      var e;
      v.addChild(e = UI.create(UI.image(()=>{
        Render.shadowed(4,UI.theme.frame,()=>{
          Render.circle(0,0,0.1).fill(UI.theme.base);
        });
        Render.circle(0,0,0.1).stroke(0.02)(UI.theme.def);
      })).place(x*size,y*size,1,1));
      map[[x,y]] = {};
      map[[x,y]].func = func;
      map[[x,y]].image = e;
      map[[x,y]].neighbor = [];
      for(var i=0;i<8;i++){
        map[[x,y]].neighbor.push(null);
      }
      return true;
    };
    f.connect = (x1,y1,x2,y2)=>{
      var xc = (x1+x2)/2;
      var yc = (y1+y2)/2;
      var di = Base.dir(x2-x1,y2-y1);
      var du = (di+4)%8;
      if(map[[x1,y1]].neighbor[di] || map[[x2,y2]].neighbor[du])return false;
      var e1,e2;
      v.addChild(e1 = UI.create(UI.image(()=>{
        Render.line(0,0,xc-x1,yc-y1).dup((d)=>{
          d.stroke(0.1)(UI.theme.def);
          d.stroke(0.07)(UI.theme.front);
        });
      })).place(x1*size,y1*size,1,1));
      v.addChild(e2 = UI.create(UI.image(()=>{
        Render.line(0,0,xc-x2,yc-y2).dup((d)=>{
          d.stroke(0.1)(UI.theme.def);
          d.stroke(0.07)(UI.theme.front);
        });
      })).place(x2*size,y2*size,1,1));
      map[[x1,y1]].neighbor[di] = {};
      map[[x2,y2]].neighbor[du] = {};
      map[[x1,y1]].neighbor[di].name = "Out";
      map[[x1,y1]].neighbor[di].type = true;
      map[[x1,y1]].neighbor[di].image = e1;
      map[[x2,y2]].neighbor[du].name = "In";
      map[[x2,y2]].neighbor[du].type = false;
      map[[x2,y2]].neighbor[du].image = e2;
      return true;
    };
    return f;
  };
  return s;
});