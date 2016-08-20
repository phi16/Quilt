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
    var c = UI.create(UI.field((dx,dy,dz)=>{
      var size = 80;
      for(var i=-1;i<v.rect.h/size/dz;i++){
        Render.line(-dx/dz,(i-Math.floor(dy/size/dz))*size,(v.rect.w-dx)/dz,(i-Math.floor(dy/size/dz))*size).stroke(1/dz)(UI.theme.impact);
      }
      for(var i=-1;i<v.rect.w/size/dz;i++){
        Render.line((i-Math.floor(dx/size/dz))*size,-dy/dz,(i-Math.floor(dx/size/dz))*size,(v.rect.h-dy)/dz).stroke(1/dz)(UI.theme.impact);
      }
    },{
      onPress : (x,y)=>{
        v.store.press(x,y);
      }
    }));
    v.store = s.field(c);
    v.addChild(c);
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Control",(v)=>{
    var sc = s.control;
    v.store = null;
    var ope = UI.create(UI.inherit(UI.frame(),(v)=>{v.full = false;})).place(10,10,60,60);
    var oldName = sc.current, curName = sc.current;
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
      oldName = curName;
      curName = sc.current;
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
        }
      },
      Move : {
        draw : ()=>{
          Render.line(0.5,0.2,0.5,0.8).stroke(0.1)(UI.theme.def);
          Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
        }
      },
      Operate : {
        draw : ()=>{
          Render.translate(0.5,0.5,()=>{
            Render.rotate(Math.PI/4,()=>{
              Render.rect(-0.18,-0.18,0.36,0.36).stroke(0.1)(UI.theme.def);
            });
          });
        }
      },
      Place : {
        draw : ()=>{
          Render.circle(0.5,0.5,0.25).stroke(0.1)(UI.theme.def);
        }
      },
      Connect : {
        draw : ()=>{
          Render.line(0.2,0.35,0.8,0.35).stroke(0.1)(UI.theme.def);
          Render.line(0.2,0.65,0.8,0.65).stroke(0.1)(UI.theme.def);
        }
      }
    };
    c.name = ["Select","Move","Operate","Place","Connect"];
    c.current = "Select";
    c.listener = Listener();
    c.set = (n)=>{
      c.current = n;
      c.listener.push("change",null);
    };
    return c;
  })();
  s.field = (v)=>{
    var f = {};
    var map = {};
    f.press = (ux,uy)=>{
      if(s.control.current == "Place"){
        var x = Math.floor(ux/80+0.5), y = Math.floor(uy/80+0.5);
        if(Base.distance(ux,uy,x*80,y*80) < 15){
          if(map[[x,y]] != null)return;
          map[[x,y]] = {};
          map[[x,y]].neighbor = [];
          for(var i=0;i<8;i++){
            map[[x,y]].neighbor.push({
              name : "",
              dir : 0,
              ref : null
            });
          }
          v.addChild(UI.create(UI.image(()=>{
            Render.shadowed(4,UI.theme.frame,()=>{
              Render.circle(0,0,0.1).fill(UI.theme.base);
            });
            Render.circle(0,0,0.1).stroke(0.02)(UI.theme.def);
          })).place(x*80,y*80,1,1));
          s.control.set("Connect");
        }
      }
    };
    return f;
  };
  return s;
});