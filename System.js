Base.write("System",()=>{
  var s = {};

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
      Render.meld([
        Render.circle(0.5,0.5,0.2),
        Render.line(0.3,0.5,0.1,0.5),
        Render.line(0.7,0.5,0.9,0.5),
        Render.line(0.5,0.3,0.5,0.1),
        Render.line(0.5,0.7,0.5,0.9)
      ]).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Control",(v)=>{
    var sc = s.control;
    var ope = UI.create(UI.inherit(UI.frame(),(v)=>{v.full = false;})).place(10,10,60,60);
    var oldName = sc.current.display, curName = sc.current.display;
    var oldMode = sc.current.name, curMode = sc.current.name;
    var animate = 1;
    ope.addChild(UI.create(UI.image(()=>{
      Render.rect(0,0,1,1).fill(UI.theme.front);
      var v = Math.cos(animate*Math.PI)*0.5+0.5;
      Render.translate(0,1-v,()=>{
        Render.scale(1,v,()=>{
          Render.shadowed(4,UI.theme.shadow,()=>{
            sc.list[oldMode].draw();
          });
        });
      })
      Render.scale(1,1-v,()=>{
        Render.shadowed(4,UI.theme.shadow,()=>{
          sc.list[curMode].draw();
        });
      });
      Render.line(0,1-v,1,1-v).stroke(0.03)(UI.theme.def);
      animate += 0.1;
      if(animate > 1)animate = 1;
    })).place(0,0,60,60));
    v.addChild(ope);
    v.addChild(UI.create(UI.image(()=>{
      var v = Math.cos(animate*Math.PI)*0.5+0.5;
      Render.translate(0,(1-v)*50,()=>{
        Render.scale(1,v,()=>{
          Render.shadowed(4,UI.theme.shadow,()=>{
            Render.text(oldName,50,0,50).left.fill(UI.theme.def);
          });
        });
      });
      Render.scale(1,1-v,()=>{
        Render.shadowed(4,UI.theme.shadow,()=>{
          Render.text(curName,50,0,50).left.fill(UI.theme.def);
        });
      });
    })).place(80,10,1,1));
    var bar = UI.create(UI.image(()=>{
      Render.shadowed(3,UI.theme.shadow,()=>{
        Render.line(0,0,1,0).stroke(0.1)(UI.theme.split);
      });
    })).place(8,80,100,20);
    v.addChild(bar);
    sc.listener.on("change",()=>{
      if(!v.available)return true;
      if(curName == sc.current.display)return;
      oldName = curName;
      curName = sc.current.display;
      oldMode = curMode;
      curMode = sc.current.name;
      animate = 0;
    });
    v.layout = (w,h)=>{
      UI.defaultLayout(v)(w,h);
      bar.rect.w = w - 8*2;
    };
    var pos = 0;
    for(var i=0;i<sc.name.length;i++){
      ((j)=>{
        var name = sc.name[j];
        if(!sc.list[name].noButton){
          var btn = UI.create(UI.button(()=>{
            sc.set(name);
          })).place(pos*50+10,90,40,40);
          btn.addChild(UI.create(UI.image(()=>{
            Render.shadowed(4,UI.theme.shadow,()=>{
              sc.list[name].draw();
            });
          })).place(0,0,40,40));
          v.addChild(btn);
          pos++;
        }
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
  Tile.registerTile("Function",(v)=>{
    var names = Object.keys(s.func.list);
    var scroll = UI.create(UI.scroll(names.length*50));
    var list = UI.create(UI.vertical(0));
    scroll.addChild(list);
    v.addChild(scroll);
    names.forEach((n)=>{
      var row = UI.create(UI.frame());
      var btn = UI.create(UI.button(()=>{
        s.control.set("Place",n);
      })).place(10,10,30,30);
      var f = s.func.list[n];
      btn.addChild(UI.create(UI.image(()=>{
        Render.translate(15,15,()=>{
          Render.scale(15,15,()=>{
            f.icon();
          });
        });
      })).place(0,0,1,1));
      row.addChild(btn);
      {
        var text = Render.text(n,40,0,30);
        var i = "", o = "";
        f.arity.forEach((s)=>{i += s + "   ";});
        f.coarity.forEach((s)=>{o += s + "   ";});
        var iText = Render.text(i,20,text.size+10,13);
        var oText = Render.text(o,20,text.size+10,32);
        row.addChild(UI.create(UI.image(()=>{
          text.left.fill(UI.theme.def);
          iText.left.fill(UI.theme.in);
          oText.left.fill(UI.theme.out);
        })).place(50,10,1,1));
      }
      list.addChild(row);
    });
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.line(0.2,0.2+0.05,0.8,0.2+0.05).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.8-0.05,0.8,0.8-0.05).stroke(0.1)(UI.theme.def);
    });
  });

  Tile.initTile();

  s.func = (()=>{
    var f = {};
    function make(ari,coari,icf,drf,spf){
      if(drf==null || drf===true){
        drf = (r,shadowSize)=>{
          Render.shadowed(4/shadowSize,UI.theme.frame,()=>{
            Render.circle(0,0,0.2).fill(UI.theme.base);
          });
          Render.circle(0,0,0.2).stroke(0.02)(UI.theme.def);
          Render.scale(0.2,0.2,()=>{
            Render.shadowed(2/shadowSize,UI.theme.sharp,()=>{
              icf();
            });
          });
        }
      }
      if(spf==null){
        spf = drf;
      }
      return {
        arity : ari,
        coarity : coari,
        draw : (r,shadowSize)=>{
          if(true || r.valid()){
            spf(r,shadowSize);
          }else{
            drf(r,shadowSize);
          }
        },
        icon : ()=>{
          Render.shadowed(2,UI.theme.sharp,()=>{
            icf();
          });
        }
      };
    }
    f.list = {
      Id : make(["In"],["Out"],()=>{
        Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(UI.theme.def);
        Render.line(0,-0.6,0,0.6).stroke(0.2)(UI.theme.def);
        Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(UI.theme.def);
      }),
      Lambda : make(["X","Y"],["F"],()=>{
        Render.meld([
          Render.line(0,0,-0.4,0.7),
          Render.line(-0.4,-0.7,0.4,0.7)
        ]).stroke(0.2)(UI.theme.def);
      }),
      Apply : make(["F","X"],["Y"],()=>{
        Render.circle(0,0,0.4).stroke(0.2)(UI.theme.def);
      }),
      Duplicate : make(["In"],["Out","Out"],()=>{
        Render.scale(0.7,0.7,()=>{
          Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(UI.theme.def);
        });
      }),
      Discard : make(["In"],[],()=>{
        Render.line(0,0.2,0,-0.7).stroke(0.2)(UI.theme.def);
        Render.line(0,0.5,0,0.7).stroke(0.2)(UI.theme.def);
      }),
      Swap : make(["In1","In2"],["Out1","Out2"],()=>{
        Render.meld([
          Render.line(-0.5,-0.5,0.5,0.5),
          Render.line(-0.5,0.5,0.5,-0.5)
        ]).stroke(0.2)(UI.theme.def);
      }),
      In : make([],["Out"],()=>{
        Render.cycle([0,-0.5,-0.5,0,0,0.5,0.5,0]).stroke(0.2)(UI.theme.def);
      }),
      Out : make(["In"],[],()=>{
        Render.rect(-0.4,-0.4,0.8,0.8).stroke(0.2)(UI.theme.def);
      })
    };
    return f;
  })();

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
        noButton : true,
        draw : ()=>{
          Render.meld([
            Render.line(0.5,0.2,0.5,0.8),
            Render.line(0.2,0.5,0.8,0.5)
          ]).stroke(0.1)(UI.theme.def);
        },
        execute : ()=>function*(f,v){}
      },
      Operate : {
        noButton : true,
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
        noButton : true,
        draw : ()=>{
          Render.circle(0.5,0.5,0.25).stroke(0.1)(UI.theme.def);
        },
        naming : (e)=>{return "Place : " + e;},
        execute : (e)=>function*(f,v){
          if(!e)return;
          var p;
          while(p = yield)if(p.onPoint)break;
          if(!p)return;
          f.place(p.x,p.y,e);
          c.set("Connect",p);
          f.rewriteAction(s.control.current.execute);
        }
      },
      Connect : {
        draw : ()=>{
          Render.line(0.2,0.37,0.8,0.37).stroke(0.1)(UI.theme.def);
          Render.line(0.2,0.63,0.8,0.63).stroke(0.1)(UI.theme.def);
        },
        execute : (u)=>function*(f,v){
          var size = 80;
          var curE=false, curX, curY, curR, curMX, curMY, state;
          state = 1;
          var curImage = UI.create(UI.image(()=>{
            if(curR>0.01){
              Render.circle(curMX*size,curMY*size,curR*size*0.3).dup((d)=>{
                d.fill(UI.theme.def,0.1);
                d.stroke(2)(UI.theme.def);
              });
            }
            curMX += (curX - curMX) / 2;
            curMY += (curY - curMY) / 2;
            curR += (state - curR) / 2;
          })).place(0,0,1,1);
          if(u){
            curE = true;
            curR = 0;
            curMX = curX = u.x;
            curMY = curY = u.y;
            v.addChild(curImage);
          }
          var p;
          while(p = yield){
            if(!p.onPoint)continue;
            if(!curE || Math.max(Math.abs(curX-p.x),Math.abs(curY-p.y)) == 1){
              if(!curE){
                curR = 0;
                curMX = curX = p.x;
                curMY = curY = p.y;
                v.addChild(curImage);
              }else{
                if(!f.exist(curX,curY)){
                  f.place(curX,curY,"Id");
                }
                if(!f.exist(p.x,p.y)){
                  f.place(p.x,p.y,"Id");
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
      display : "Select",
      execute : c.list["Select"].execute()
    };
    c.listener = Listener();
    c.set = (n,opt)=>{
      c.current.name = n;
      if(c.list[n].naming){
        c.current.display = c.list[n].naming(opt);
      }else{
        c.current.display = n;
      }
      c.current.execute = c.list[n].execute(opt);
      c.listener.push("change",null);
    };
    return c;
  })();
  s.field = (v,size)=>{
    var shadowSize = size/75.0;
    var f = {};
    var map = {};
    var action = null;
    var lastE,lastX,lastY; 
    function allDraw(f){
      Render.scale(size,size,()=>{
        for(var i in map){
          var p = i.split(",").map((v)=>parseInt(v));
          Render.translate(p[0],p[1],()=>{
            f(p[0],p[1],map[i]);
          });
        }
      });
    }
    v.addChild(UI.create(UI.inherit(UI.image(()=>{
      Render.shadowed(2/shadowSize,UI.theme.frame,()=>{
        allDraw((x,y,r)=>{
          if(r.name === "Id"){
            Render.circle(0,0,0.05).fill(UI.theme.def);
          }
          r.neighbor.forEach((e,i)=>{
            if(e){
              var p = Base.fromDir(i);
              Render.line(0,0,p.x,p.y).stroke(0.1)(UI.theme.def);
            }
          });
        });
      });
    }),(v)=>{v.name="layer0";})).place(0,0,1,1));
    v.addChild(UI.create(UI.inherit(UI.image(()=>{
      allDraw((x,y,r)=>{
        if(r.name === "Id"){
          Render.circle(0,0,0.035).fill(UI.theme.button);
        }
        r.neighbor.forEach((e,i)=>{
          if(e){
            if(e.type){
              var p = Base.fromDir(i);
              Render.line(0,0,p.x,p.y).stroke(0.07)(UI.theme.button);
            }
          }
        })
      });
    }),(v)=>{v.name="layer1";})).place(0,0,1,1));
    v.addChild(UI.create(UI.inherit(UI.image(()=>{
      allDraw((x,y,r)=>{
        r.neighbor.forEach((e,i)=>{
          if(e){
            if(e.type){
              var p = Base.fromDir(i);
              var t = UI.time()%80/80;
              var sz = 0.03;
              Render.shadowed(4,UI.theme.shadow,()=>{
                Render.translate(t*p.x,t*p.y,()=>{
                  Render.rotate(-i*Math.PI*2/8,()=>{
                    Render.rect(-sz,-sz,sz*2,sz*2).fill(UI.theme.def);
                  });
                });
              });
            }
          }
        })
      });
    }),(v)=>{v.name="layer2";})).place(0,0,1,1));
    v.addChild(UI.create(UI.inherit(UI.image(()=>{
      allDraw((x,y,r)=>{
        r.func.draw(r,shadowSize);
      });
    }),(v)=>{v.name="layer3";})).place(0,0,1,1));
    var overlay = UI.create((v)=>{v.name="overlay";});
    var overlayIx = v.children.length;
    v.addChild(overlay);
    function i(x){
      return Math.floor(x/size+0.5);
    }
    f.newView = ()=>{
      overlay = UI.create((v)=>{v.name="overlay";});
      UI.dispose(v.children[overlayIx]);
      v.rewriteAt(overlayIx,overlay);
    };
    f.begin = (inst,ux,uy)=>{
      f.newView();
      action = inst(f,overlay);
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
      action = inst(f,overlay);
      if(action.next().value)action = null;
    };
    f.scale = ()=>{
      return v.scale();
    };
    f.exist = (x,y)=>{
      return map[[x,y]]!=null;
    }
    f.at = (x,y)=>{
      if(!f.exist(x,y))return null;
      return map[[x,y]].name;
    }
    f.place = (x,y,name)=>{
      if(!map[[x,y]]){
        map[[x,y]] = {};
      }
      map[[x,y]].name = name;
      map[[x,y]].func = s.func.list[name];
      if(!map[[x,y]].neighbor){
        map[[x,y]].neighbor = [];
        for(var i=0;i<8;i++){
          map[[x,y]].neighbor.push(null);
        }
      }
      return true;
    };
    f.connect = (x1,y1,x2,y2)=>{
      var xc = (x1+x2)/2;
      var yc = (y1+y2)/2;
      var di = Base.dir(x2-x1,y2-y1);
      var du = (di+4)%8;
      if(map[[x1,y1]].neighbor[di] || map[[x2,y2]].neighbor[du]){
        map[[x1,y1]].neighbor[di] = null;
        map[[x2,y2]].neighbor[du] = null;
      }
      map[[x1,y1]].neighbor[di] = {};
      map[[x1,y1]].neighbor[di].name = "Out";
      map[[x1,y1]].neighbor[di].type = true;
      map[[x2,y2]].neighbor[du] = {};
      map[[x2,y2]].neighbor[du].name = "In";
      map[[x2,y2]].neighbor[du].type = false;
      return true;
    };
    return f;
  };
  return s;
});