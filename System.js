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
    c.forceMotion();
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
    var oldCtrl = sc.current, curCtrl = sc.current;
    var animate = 1;
    ope.addChild(UI.create(UI.image(()=>{
      Render.rect(0,0,1,1).fill(UI.theme.front);
      var v = Math.cos(animate*Math.PI)*0.5+0.5;
      Render.translate(0,1-v,()=>{
        Render.scale(1,v,()=>{
          Render.shadowed(4,UI.theme.shadow,()=>{
            oldCtrl.draw(UI.theme.def);
          });
        });
      });
      Render.scale(1,1-v,()=>{
        Render.shadowed(4,UI.theme.shadow,()=>{
          curCtrl.draw(UI.theme.def);
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
          var txt = Render.text(oldCtrl.display,50,0,50);
          Render.shadowed(4,UI.theme.shadow,()=>{
            txt.left.fill(UI.theme.def);
          });
          oldCtrl.description.forEach((e,i)=>{
            Render.text(e,20,txt.size+20,50+i*20).left.fill(UI.theme.def);
          });
        });
      });
      Render.scale(1,1-v,()=>{
        var txt = Render.text(curCtrl.display,50,0,50);
        Render.shadowed(4,UI.theme.shadow,()=>{
          txt.left.fill(UI.theme.def);
        });
        curCtrl.description.forEach((e,i)=>{
          Render.text(e,20,txt.size+20,50+i*20).left.fill(UI.theme.def);
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
      if(curCtrl.display == sc.current.display)return;
      oldCtrl = curCtrl;
      curCtrl = sc.current;
      animate = 0;
    });
    v.layout = (w,h)=>{
      UI.defaultLayout(v)(w,h);
      bar.rect.w = w - 8*2;
    };
    var scr = UI.create(UI.scroll(1000,-1,false)).place(0,90,1,1);
    var scrLayout = scr.layout;
    scr.layout = (w,h)=>{
      scrLayout(w,95);
    };
    v.addChild(scr);
    var pos = 0;
    var available = {};
    var buttonss = [];
    Object.keys(sc.name).forEach((g)=>{
      var ns = sc.name[g];
      var cnt = 0;
      var plate = UI.create(UI.image(()=>{
        Render.text(g,30,0,0).left.fill(sc.available[g] ? UI.theme.def : UI.theme.split);
      })).place(pos*50+10,70,1,1);
      var buttons = [];
      for(var i=0;i<ns.length;i++){
        ((j)=>{
          var name = ns[j];
          if(sc.list[name]){
            var btn = UI.create(UI.button(()=>{
              if(sc.available[g])sc.set(name);
            })).place(pos*50+10,0,40,40);
            btn.addChild(UI.create(UI.image(()=>{
              Render.shadowed(4,UI.theme.shadow,()=>{
                sc.list[name].draw(sc.available[g] ? UI.theme.def : UI.theme.split);
              });
            })).place(0,0,40,40));
            btn.enable = sc.available[g];
            scr.addChild(btn);
            buttons.push({button:btn,category:g});
            pos++;
            cnt++;
          }
        })(i);
      }
      if(cnt>0)scr.addChild(plate), pos += 0.2;
      buttonss.push(buttons);
    });
    sc.listener.on("visiblity",()=>{
      if(!v.available)return true;
      var ix = 0;
      buttonss.forEach((bs)=>{
        bs.forEach((b)=>{
          b.button.enable = sc.available[b.category];
        });
      });
    });
    scr.resize(pos*50);
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.translate(0.5,0.5,()=>{
        Render.rotate(Math.PI/4,()=>{
          Render.meld([
            Render.rect(-0.25,-0.25,0.5,0.5),
            Render.polygon([0,0.25,0,0,-0.25,0])
          ]).stroke(0.1)(UI.theme.def);
        });
      });
    });
  });
  Tile.registerTile("Function",(v)=>{
    var cats = Object.keys(s.func.category);
    var names = Object.keys(s.func.list);
    var ratAll = names.length*50 + cats.length*30;
    var scroll = UI.create(UI.scroll(-1,ratAll));
    var list = UI.create(UI.vertical(0));
    scroll.addChild(list);
    v.addChild(scroll);
    var ratPos = 0;
    var ratArr = [];
    Object.keys(s.func.category).forEach((cat)=>{
      list.addChild(UI.create((v)=>{
        v.name = "categoryBar";
        v.addChild(UI.create(UI.image(()=>{
          Render.rect(0,0,v.rect.w,v.rect.h).fill(UI.theme.button,0.1);
          Render.text(cat,20,5,26).left.fill(UI.theme.frame);
        })).place(0,0,1,1));
      }));
      ratPos += 30, ratArr.push(ratPos);
      s.func.category[cat].forEach((n)=>{
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
          var text;
          var i = "", o = "";
          f.arity.forEach((s)=>{i += s + "  ";});
          f.coarity.forEach((s)=>{o += s + "  ";});
          var iText;
          var oText;
          row.addChild(UI.create(UI.image(()=>{
            if(!text || text.size==0)text = Render.text(n,40,0,30);
            if(!iText || iText.size==0)iText = Render.text(i,20,text.size+10,13);
            if(!oText || oText.size==0)oText = Render.text(o,20,text.size+10,32);
            text.left.fill(UI.theme.def);
            iText.left.fill(UI.theme.in);
            oText.left.fill(UI.theme.out);
          })).place(50,10,1,1));
        }
        list.addChild(row);
        ratPos += 50, ratArr.push(ratPos);
      });
    });
    ratArr.pop();
    list.setRatio(ratArr.map((r)=>r/ratAll));
    list.forceMotion();
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.line(0.2,0.2+0.05,0.8,0.2+0.05).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.8-0.05,0.8,0.8-0.05).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Execute",(v)=>{
    var e = null;
    var init = ()=>{};
    s.field.listener.on("update",(n,d)=>{
      init = ()=>{
        e = Eval(d.field,d.map);
      };
      init();
    });
    v.addChild(UI.create(UI.image(()=>{
      if(e){
        e.output.forEach((str,i)=>{
          Render.text(str,25,10,35+i*30).left.fill(UI.theme.def);
        });
      }
    })).place(0,0,1,1));
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.meld([
        Render.circle(0.5,0.5,0.3),
        Render.line(0.5,0.5,0.75,0.25)
      ]).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Info",(v)=>{
    var m = null,x = null,y = null,strs = [], branch = [0,0], depend = "";
    s.field.listener.on("hover",(n,d)=>{
      if(!(x && y && x==d.x && y==d.y && m==d.m)){
        x = d.x;
        y = d.y;
        m = d.m;
        strs = [];
        depend = "";
        if(m){
          if(m.valid){
            for(var i=0;i<8;i++){
              if(m.neighbor[i]){
                strs.push({
                  dir : m.neighbor[i].type,
                  name : m.neighbor[i].name
                });
              }
            }
            branch = [m.func.arity.length,m.func.coarity.length];
            m.depend.for
          }else{
            m.func.arity.forEach((s)=>{
              strs.push({
                dir : false,
                name : s
              });
            });
            m.func.coarity.forEach((s)=>{
              strs.push({
                dir : true,
                name : s
              });
            });
            var al=0,col=0;
            for(var i=0;i<8;i++){
              if(m.neighbor[i]){
                if(!m.neighbor[i].type)al++;
                else col++;
              }
            }
            branch = [al,col];
          }
          if(m.depend){
            Object.keys(m.depend).forEach((b,i)=>{
              depend += (i==0?"Deps : ":", ") + "(" + b + ")";
            });
          }
        }
      }
    });
    v.addChild(UI.create(UI.image(()=>{
      Render.rect(10,10,60,60).dup((d)=>{
        Render.shadowed(6,UI.theme.shadow,()=>{
          d.fill(UI.theme.front);
        })
        d.stroke(2.2)(UI.theme.frame);
      });
      if(m){
        Render.translate(40,40,()=>{
          Render.scale(30,30,()=>{
            m.func.icon();
          });
        });
        var title = Render.text(m.name,40,80,45);
        Render.shadowed(4,UI.theme.shadow,()=>{
          title.left.fill(UI.theme.def);
        });
        (()=>{
          var shCol = m.valid ? UI.theme.shadow : UI.theme.invalidShadow;
          var col = m.valid ? UI.theme.def : UI.theme.invalid;
          Render.shadowed(4,shCol,()=>{
            var p = 100 + title.size;
            var w1 = Render.text("[ " + Base.str(branch[0]),40,p,45);
            w1.forceLeft.fill(col);
            p += w1.size+9;
            Render.meld([
              Render.line(p,32,p+20,32),
              Render.polygon([p+13,25,p+20,32,p+13,39])
            ]).stroke(3)(col);
            p += 29;
            var w2 = Render.text(Base.str(branch[1]) + " ]",40,p,45);
            w2.forceLeft.fill(col);
          });
        })();
        var coordStr = Render.text("(" + x + "," + y + ")",20,80,70);
        coordStr.left.fill(UI.theme.def);
        var p = 85+coordStr.size;
        strs.forEach((v)=>{
          var col = !m.valid ? UI.theme.invalid : v.dir ? UI.theme.in : UI.theme.out;
          Render.line(p+10,55,p+10,70).stroke(2)(col);
          if(v.dir){
            Render.polygon([p+5,65,p+10,70,p+15,65]).stroke(2)(col);
          }else{
            Render.polygon([p+5,60,p+10,55,p+15,60]).stroke(2)(col);
          }
          var str = Render.text(v.name,20,p+20,70);
          str.left.fill(col);
          p += str.size + 25;
        });
        Render.text(depend,20,10,95).left.fill(UI.theme.def);
      }
    })).place(0,0,1,1));
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.meld([
        Render.line(0.5,0.15,0.5,0.25),
        Render.polygon([0.35,0.4,0.5,0.4,0.5,0.8]),
        Render.line(0.3,0.8,0.7,0.8)
      ]).stroke(0.1)(UI.theme.def);
    });
  });
  Tile.registerTile("Start",(v)=>{
    v.addChild(UI.create(UI.image(()=>{
      var w = v.parent.rect.w;
      var title = Render.text("Quilt Circuit",1,0,0);
      var script = Render.text("Simplest Synchronous Digital Logic Circuit Simulator",0.145,0,0);
      var mult = w * 0.95 / title.size;
      Render.translate(w/2,0,()=>{
        Render.scale(mult,mult,()=>{
          Render.translate(0,0.2,()=>{
            script.forceCenter.fill(UI.theme.def);
          });
          Render.translate(0,1.05,()=>{
            title.forceCenter.fill(UI.theme.def);
          });
        });
      });
    })).place(0,0,1,1));
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.meld([
        Render.circle(0.5,0.38,0.2),
        Render.line(0.5,0.55,0.5,0.9)
      ]).stroke(0.1)(UI.theme.def);
    });
  });

  s.func = (()=>{
    var f = {};
    f.category = {};
    f.list = {};
    f.addCategory = (cat)=>{
      f.category[cat] = [];
    };
    f.register = (n,cat,func)=>{
      f.category[cat].push(n);
      f.list[n] = func;
    };
    return f;
  })();

  s.control = (()=>{
    var c = {};
    c.list = {
      Swap : ()=>({
        draw : (col)=>{
          Render.bezier([0.2,0.8,0.2,0.1,0.8,0.1,0.8,0.8]).stroke(0.1)(col);
        },
        execute : function*(f,v){},
        description : ["Unimplemented :P"]
      }),
      Duplicate : ()=>({
        draw : (col)=>{
          Render.meld([
            Render.rect(0.2,0.2,0.3,0.3),
            Render.rect(0.5,0.5,0.3,0.3)
          ]).stroke(0.1)(col);
        },
        execute : function*(f,v){},
        description : ["Unimplemented :P"]
      }),
      Select : ()=>{
        var field;
        return {
          draw : (col)=>{
            Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(col);
          },
          execute : function*(f,v){
            field = f;
            var size = 80;
            var start = {x:0,y:0},current = {x:0,y:0};
            var first = true, end = false;
            var firstPoint = null, pointOnly = true;
            v.addChild(UI.create(UI.image(()=>{
              if(!first && !end){
                Render.shadowed(4,UI.theme.frame,()=>{
                  Render.rect(start.x,start.y,current.x-start.x,current.y-start.y).stroke(1/f.scale())(UI.theme.def);
                });
              }
            })).place(0,0,1,1));
            while(true){
              while(p = yield)if(!p.onPoint){
                firstPoint = {x:p.x,y:p.y};
                break;
              }
              if(!p)break;
              if(first){
                first = false;
                start.x = current.x = p.x;
                start.y = current.y = p.y;
              }else{
                pointOnly = false;
                current.x = p.x;
                current.y = p.y;
              }
            }
            if(pointOnly){
              var ox = firstPoint.x/size, oy = firstPoint.y/size;
              var ux = Math.floor(ox+0.5), uy = Math.floor(oy+0.5);
              var vx = Math.floor(ox+0.5), vy = Math.floor(oy);
              var hx = Math.floor(ox), hy = Math.floor(oy+0.5);
              if(Base.distance(ox,oy,ux,uy) < 0.2){
                f.select.init(ux,uy,ux+1,uy+1);
              }else if(Math.abs(ox-vx) < 0.2 && f.bridge(vx,vy,6)){
                f.select.init(vx,vy,vx+1,vy+2);
              }else if(Math.abs(oy-hy) < 0.2 && f.bridge(hx,hy,0)){
                f.select.init(hx,hy,hx+2,hy+1);
              }else if(Base.distance(ox,oy,ux,uy) < 0.3){
                f.select.init(ux,uy,ux+1,uy+1);
              }else {
                f.select.init(0,0,0,0);
              }
            }else{
              var a = Math.floor(start.x/size), b = Math.floor(start.y/size);
              var c = Math.floor(current.x/size), d = Math.floor(current.y/size);
              if(c < a)[a,c] = [c,a];
              if(d < b)[b,d] = [d,b];
              f.select.init(a+1,b+1,c+1,d+1);
            }
            end = true;
          },
          finish : ()=>{
            //if(field)field.select.init(0,0,0,0);
          },
          description : ["Drag&Drop : Select a range"]
        };
      },
      Move : ()=>({
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.15,0.5,0.85),
            Render.line(0.15,0.5,0.85,0.5)
          ]).stroke(0.1)(col);
        },
        execute : function*(f,v){},
        description : ["Unimplemented :P"]
      }),
      Rotate : ()=>({
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.5,0.5,0.8),
            Render.arc(0.5,0.5,0.3,Math.PI*3/2,Math.PI)
          ]).stroke(0.1)(col);
        },
        execute : function*(f,v){},
        description : ["Unimplemented :P"]
      }),
      Operate : ()=>({
        draw : (col)=>{
          Render.translate(0.5,0.5,()=>{
            Render.rotate(Math.PI/4,()=>{
              Render.rect(-0.2,-0.2,0.4,0.4).stroke(0.1)(col);
            });
          });
        },
        execute : function*(f,v){},
        description : ["Unimplemented :P"]
      }),
      Place : (e)=>({
        draw : (()=>{
          var f = Base.void;
          if(s.func.list[e]){
            f = s.func.list[e].icon;
          }
          return (col)=>{
            Render.translate(0.5,0.5,()=>{
              Render.scale(0.5,0.5,()=>{
                f();
              });
            });
            Render.circle(0.5,0.5,0.5).stroke(0.1)(col);
          };
        })(),
        display : "Place : " + e,
        execute : function*(f,v){
          if(!e)return;
          var p;
          while(p = yield)if(p.onPoint)break;
          if(!p)return;
          f.place(p.x,p.y,e);
          c.set("Connect",p);
          f.rewriteAction(s.control.current.execute);
        },
        description : ["Click a grid : Place the func"]
      }),
      Connect : (u)=>({
        draw : (col)=>{
          Render.line(0.15,0.37,0.85,0.37).stroke(0.1)(col);
          Render.line(0.15,0.63,0.85,0.63).stroke(0.1)(col);
        },
        execute : function*(f,v){
          var size = 80;
          var curE=false, curX, curY, curR, curMX, curMY, state;
          state = 1;
          var q;
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
            q = {x:curX,y:curY};
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
                q = {x:curX,y:curY};
              }else{
                if(!f.exist(curX,curY)){
                  f.place(curX,curY,"L");
                }
                if(!f.exist(p.x,p.y)){
                  f.place(p.x,p.y,"Id");
                }
                f.connect(curX,curY,p.x,p.y);
                f.autoAdjust(curX,curY);
                f.autoAdjust(p.x,p.y);
                if(f.at(curX,curY)=="Swap" && !(q.x==curX && q.y==curY)){
                  var d1 = Base.dir(q.x-curX,q.y-curY);
                  var d2 = Base.dir(p.x-curX,p.y-curY);
                  if(d1!=d2){
                    for(var i=0;i<8;i++){
                      var b = f.bridge(curX,curY,i);
                      if(b){
                        if(b.type){
                          if(i==d2)b.name="Out1";
                          else b.name="Out2";
                        }else{
                          if(i==d1)b.name="In1";
                          else b.name="In2";
                        }
                      }
                    }
                  }
                  f.validate(curX,curY);
                }
              }
              curE = true;
              q = {x:curX,y:curY};
              curX = p.x;
              curY = p.y;
            }
          }
          state = 0;
          c.set("Connect");
        },
        description : ["Drag : Place wire"]
      }),
      Remove : ()=>({
        draw : (col)=>{
          Render.meld([
            Render.line(0.2,0.2,0.45,0.45),
            Render.line(0.55,0.55,0.8,0.8)
          ]).stroke(0.1)(col);
        },
        execute : function*(f,v){
          var size = 80;
          var curE=false, curX, curY, curR, curMX, curMY, state;
          state = 1;
          curR = 0;
          var q;
          var curImage = UI.create(UI.image(()=>{
            if(curR>0.01){
              Render.circle(curMX*size,curMY*size,curR*size*0.3).dup((d)=>{
                d.fill(UI.theme.invalid,0.1);
                d.stroke(2)(UI.theme.invalid);
              });
            }
            curMX += (curX - curMX) / 2;
            curMY += (curY - curMY) / 2;
            curR += (state - curR) / 2;
          })).place(0,0,1,1);
          var path = false;
          var p;
          while(p = yield){
            if(p.onPoint){
              if(!curE){
                v.addChild(curImage);
                curE = true;
                curMX = curX = p.x;
                curMY = curY = p.y;
              }else if(Math.max(Math.abs(curX-p.x),Math.abs(curY-p.y)) == 1){
                var dx = p.x - curX, dy = p.y - curY;
                var th = (8 - Math.floor(Math.atan2(dy,dx) / Math.PI / 2 * 8 + 0.5))%8;
                f.disconnect(curX,curY,th);
                f.autoAdjust(curX,curY);
                f.autoAdjust(p.x,p.y);
                path = true;
                curX = p.x;
                curY = p.y;
              }
            }
          }
          state = 0;
        },
        description : ["Drag : Remove wire"]
      }),
      Name : ()=>({
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.2,0.5,0.8),
            Render.line(0.3,0.18,0.5,0.2),
            Render.line(0.7,0.18,0.5,0.2),
            Render.line(0.3,0.82,0.5,0.8),
            Render.line(0.7,0.82,0.5,0.8),
          ]).stroke(0.1)(col);
        },
        execute : function*(f,v){
          var p;
          while(p = yield){
            if(!p.onPoint)continue;
            if(f.exist(p.x,p.y) && f.valid(p.x,p.y)){
              var ia = [], oa = [];
              for(var i=0;i<8;i++){
                var u = f.bridge(p.x,p.y,i);
                if(u){
                  if(u.type)oa.push(u.name);
                  else ia.push(u.name);
                }
              }
              var noa = Base.nextPermutation(oa);
              var nia = ia;
              if(noa){
                nia = Base.nextPermutation(ia);
                if(nia){
                  noa = oa;
                }else{
                  nia = ia.reverse();
                }
              }else{
                nia = Base.nextPermutation(ia);
                if(nia){
                  noa = oa;
                }else{
                  noa = oa.reverse();
                  nia = ia.reverse();
                }
              }
              var ip = 0, op = 0;
              for(var i=0;i<8;i++){
                var u = f.bridge(p.x,p.y,i);
                if(u){
                  if(u.type)u.name = noa[op++];
                  else u.name = nia[ip++];
                }
              }
              f.validate(p.x,p.y);
              break;
            }
          }
        },
        description : ["Click a func : Rearrange the I/O"]
      }),
      Delete : ()=>({
        draw : (col)=>{
          var a = [];
          for(var i=0;i<8;i++){
            var x = Math.cos(i*Math.PI/4), y = Math.sin(i*Math.PI/4);
            a.push(Render.line(x*0.2+0.5,y*0.2+0.5,x*0.38+0.5,y*0.38+0.5));
          }
          Render.meld(a).stroke(0.1)(col);
        },
        execute : function*(f,v){
          f.select.delete();
        },
        description : ["Click any point : Delete selected area"]
      })
    };
    Object.keys(c.list).forEach((k)=>{
      c.list[k].draw = c.list[k]().draw;
    });
    c.name = {
      //Tile : ["Swap","Duplicate"],
      Field : ["Select","Connect","Remove","Name"],
      Selection : [/*"Move","Rotate",*/"Delete"]
    };
    c.available = {
      //Tile : false,
      Field : true,
      Selection : false
    }
    c.current = null;
    c.listener = Listener();
    c.set = (n,opt)=>{
      if(c.current && c.current.finish)c.current.finish();
      c.current = c.list[n](opt);
      if(!c.current.display){
        c.current.display = n;
      }
      c.listener.push("change",null);
    };
    c.set("Select");
    c.visible = (cat)=>{
      c.available[cat] = true;
      c.listener.push("visiblity",null);
    };
    c.invisible = (cat)=>{
      c.available[cat] = false;
      c.listener.push("visiblity",null);
    };
    return c;
  })();
  s.field = (v,size)=>{
    var shadowSize = size/75.0;
    var f = {};
    var map = {}, selection = [];
    var action = null;
    var lastE,lastX,lastY;
    var evalDraw = Base.void;
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
      f.update();
      Render.shadowed(5/shadowSize,UI.theme.select,()=>{
        allDraw((x,y,r)=>{
          if(r.select){
            var radi = 1.0;
            var width = 0.3 - 0.2 * r.selectMot;
            if(r.selectMot != 0){
              if((r.name !== "Id" && r.name !== "Swap" && r.name !== "Duplicate" && r.name !== "Discard") || !r.valid){
                Render.circle(0,0,0.2+width/2).stroke(width)(UI.theme.select);
              }
              Render.circle(0,0,0.05+width/2).stroke(width)(UI.theme.select);
              r.neighbor.forEach((e,i)=>{
                if(e && e.type){
                  var p = Base.fromDir(i);
                  if(map[[x+p.x,y+p.y]].select){
                    Render.line(0,0,p.x,p.y).stroke(width*2 + 0.1)(UI.theme.select);
                  }
                }
              });
            }
            r.selectMot += (1 - r.selectMot) / 2;
          }
        });
      });
      Render.scale(size,size,()=>{
        evalDraw();
      });
      Render.shadowed(2/shadowSize,UI.theme.frame,()=>{
        allDraw((x,y,r)=>{
          Render.circle(0,0,0.05).fill(UI.theme.def);
          r.neighbor.forEach((e,i)=>{
            if(e){
              var p = Base.fromDir(i);
              Render.line(0,0,p.x,p.y).stroke(0.1)(UI.theme.def);
            }
          });
        });
      });
      allDraw((x,y,r)=>{
        Render.circle(0,0,0.035).fill(UI.theme.button);
        r.neighbor.forEach((e,i)=>{
          if(e){
            var p = Base.fromDir(i);
            if(e.type){
              Render.line(0,0,p.x,p.y).stroke(0.07)(UI.theme.button);
            }
          }
        });
      });
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
      allDraw((x,y,r)=>{
        r.func.draw(r,shadowSize);
        r.neighbor.forEach((e,i)=>{
          if(e){
            if(e.name){
              if(r.name!=="Swap" && e.name!=="In" && e.name!=="Out"){
                var dx = 0.33, dy = 0.15;
                var a = i*Math.PI/4;
                [dx,dy] = [dx*Math.cos(a)+dy*Math.sin(a), -dx*Math.sin(a)+dy*Math.cos(a)];
                Render.text(e.name,0.2,dx,dy+0.09).center.fill(UI.theme.frame);
              }
            }
          }
        });
      });
    }),(v)=>{v.name="layer";})).place(0,0,1,1));
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
      f.validated = true;
      f.newView();
      action = inst(f,overlay);
      if(action.next().value)action = null;
      lastE = false;
      f.pass(ux,uy);
    };
    f.pass = (ux,uy)=>{
      var x = i(ux), y = i(uy);
      if(action){
        if(action.next({onPoint:false,x:ux,y:uy}).value)action = null;
        if(Base.distance(x,y,ux/size,uy/size) < 0.4 && (!lastE || lastX!=x || lastY!=y)){
          lastE = true, lastX = x, lastY = y;
          if(action.next({onPoint:true,x:x,y:y}).value)action = null;
        }
      }
      s.field.listener.push("hover",{x:x,y:y,m:map[[x,y]]});
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
    f.evalDraw = (d)=>{
      evalDraw = d;
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
      map[[x,y]].select = false;
      if(!map[[x,y]].neighbor){
        map[[x,y]].neighbor = [];
        for(var i=0;i<8;i++){
          map[[x,y]].neighbor.push(null);
        }
      }else{
        for(var i=0;i<8;i++){
          if(map[[x,y]].neighbor[i]){
            map[[x,y]].neighbor[i].name = null;
          }
        }
      }
      map[[x,y]].valid = false;
      f.validate(x,y);
      s.field.listener.push("hover",{x:x,y:y,m:map[[x,y]]});
      return true;
    };
    f.bridge = (x,y,i)=>{
      return map[[x,y]] ? map[[x,y]].neighbor[i] : null;
    };
    f.connect = (x1,y1,x2,y2)=>{
      var xc = (x1+x2)/2;
      var yc = (y1+y2)/2;
      var di = Base.dir(x2-x1,y2-y1);
      var du = (di+4)%8;
      if(!map[[x1,y1]].neighbor[di] || !map[[x1,y1]].neighbor[di].type){
        if(map[[x1,y1]].neighbor[di] || map[[x2,y2]].neighbor[du]){
          map[[x1,y1]].neighbor[di] = null;
          map[[x2,y2]].neighbor[du] = null;
        }
        map[[x1,y1]].neighbor[di] = {};
        map[[x1,y1]].neighbor[di].name = null;
        map[[x1,y1]].neighbor[di].type = true;
        map[[x2,y2]].neighbor[du] = {};
        map[[x2,y2]].neighbor[du].name = null;
        map[[x2,y2]].neighbor[du].type = false;
      }
      f.validate(x1,y1);
      f.validate(x2,y2);
      return true;
    };
    f.disconnect = (x,y,i)=>{
      if(map[[x,y]] && map[[x,y]].neighbor[i]){
        var p = Base.fromDir(i);
        map[[x,y]].neighbor[i] = null;
        map[[x+p.x,y+p.y]].neighbor[(i+4)%8] = null;
        f.validate(x,y);
        f.validate(x+p.x,y+p.y);
      }
    };
    f.autoAdjust = (x,y)=>{
      if(f.at(x,y) == "Id" || f.at(x,y) == "Duplicate" || f.at(x,y) == "Discard" || f.at(x,y) == "Swap"){
        var a=0,ca=0;
        for(var i=0;i<8;i++){
          var b = f.bridge(x,y,i);
          if(b){
            if(b.type)ca++;
            else a++;
          }
        }
        if(a==1 && ca==1){
          f.place(x,y,"Id");
        }else if(a==1 && ca==2){
          f.place(x,y,"Duplicate");
        }else if(a==1 && ca==0){
          f.place(x,y,"Discard");
        }else if(a==2 && ca==2){
          f.place(x,y,"Swap");
        }else if(a==0 && ca==0){
          delete map[[x,y]];
        }
      }
    }
    f.validated = false;
    f.validate = (x,y)=>{
      var m = map[[x,y]];
      m.valid = false;
      m.validIO = false;
      var iCnt = 0, oCnt = 0;
      for(var i=0;i<8;i++){
        if(m.neighbor[i]){
          if(m.neighbor[i].type)oCnt++;
          else iCnt++;
        }
      }
      if(m.func.arity.length == iCnt && m.func.coarity.length == oCnt){
        m.validIO = true;
        var ip = 0, op = 0;
        for(var i=0;i<8;i++){
          if(m.neighbor[i]){
            if(m.neighbor[i].type){
              if(m.neighbor[i].name)break;
              m.neighbor[i].name = m.func.coarity[op++];
            }else{
              if(m.neighbor[i].name)break;
              m.neighbor[i].name = m.func.arity[ip++];
            }
          }
        }
        m.arity = {};
        m.coarity = {};
        for(var i=0;i<8;i++){
          if(m.neighbor[i]){
            var n = m.neighbor[i].name;
            if(m.neighbor[i].type){
              if(!m.coarity[n])m.coarity[n] = [i];
              else m.coarity[n].push(i);
            }else{
              if(!m.arity[n])m.arity[n] = [i];
              else m.arity[n].push(i);
            }
          }
        }
      }else{
        for(var i=0;i<8;i++){
          if(m.neighbor[i]){
            m.neighbor[i].name = null;
          }
        }
      }
      f.validated = true;
    };
    f.error = null;
    f.update = ()=>{
      if(f.validated){
        f.error = null;
        Object.keys(map).forEach((k)=>{
          map[k].depend = {};
          if(map[k].validIO)map[k].valid = true;
          else{
            if(!f.error)f.error = "Invalid (co)arity : ("+k+")";
            else f.error += ", ("+k+")";
          }
        });
        var outCount = 0;
        Object.keys(map).forEach((k)=>{
          if(map[k].name == "Begin" && map[k].validIO){
            outCount++;
          }
        });
        f.validated = false;
        s.field.listener.push("update",{field:f,map:map});
      }
    };
    f.valid = (x,y)=>{
      return map[[x,y]] && map[[x,y]].valid;
    }
    f.select = (()=>{
      var e = {};
      e.init = (x1,y1,x2,y2)=>{
        selection.forEach((p)=>{
          map[[p.x,p.y]].select = false;
        });
        selection = [];
        for(var i=x1;i<x2;i++){
          for(var j=y1;j<y2;j++){
            if(map[[i,j]]){
              map[[i,j]].select = true;
              map[[i,j]].selectMot = 0;
              selection.push({x:i,y:j});
            }
          }
        }
        if(selection.length>0)s.control.visible("Selection");
        else s.control.invisible("Selection");
      };
      e.delete = ()=>{
        var n = [];
        selection.forEach((p)=>{
          for(var i=0;i<8;i++){
            var e = map[[p.x,p.y]].neighbor[i];
            if(e){
              var d = Base.fromDir(i);
              var m = map[[p.x+d.x,p.y+d.y]];
              if(m){
                n.push({x:p.x+d.x,y:p.y+d.y});
                m.neighbor[(i+4)%8] = null;
              }
            }
          };
          delete map[[p.x,p.y]];
        });
        n.forEach((p)=>{
          if(map[[p.x,p.y]])f.validate(p.x,p.y);
        });
        f.validated = true;
        selection = [];
        s.control.invisible("Selection");
        s.control.set("Select");
        s.field.listener.push("update",{field:f,map:map});
      };
      return e;
    })();
    f.view = ()=>{
      return v;
    };
    return f;
  };
  s.field.listener = Listener();

  setTimeout(()=>{
    Tile.initTile({
      type : 2,
      children : [
        {
          type : 1,
          children : [
            {
              type : 0,
              name : "Execute"
            },{
              type : 2,
              children : [
                {
                  type : 0,
                  name : "Start"
                },{
                  type : 0,
                  name : "Field"
                }
              ]
            },{
              type : 0,
              name : "Function"
            }
          ],
          ratio : [0.2,0.7]
        },{
          type : 1,
          children : [
            {
              type : 0,
              name : "Info"
            },{
              type : 0,
              name : "Control"
            }
          ],
          ratio : [0.4]
        }
      ],
      ratio : [0.8]
    });
  },0);

  return s;
});
