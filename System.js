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
        var i = Math.floor(x/80+0.5), j = Math.floor(y/80+0.5);
        if(Base.distance(x,y,i*80,j*80) < 15){
          c.addChild(UI.create(UI.image(()=>{
            Render.shadowed(4,UI.theme.frame,()=>{
              Render.circle(0,0,0.1).fill(UI.theme.base);
            });
            Render.circle(0,0,0.1).stroke(0.02)(UI.theme.def);
          })).place(i*80,j*80,1,1));
        }
      }
    }));
    v.addChild(c);
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Control",(v)=>{
    for(var i=0;i<3;i++){
      var btn = UI.create(UI.button(()=>{
        console.log("nya~");
      })).place(i*70+10,10,60,60);
      btn.addChild(UI.create(UI.image(()=>{
        Render.circle(0,0,10).fill(UI.theme.def);
      })));
      v.addChild(btn);
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
  // Generator based mechanism
  return s;
});