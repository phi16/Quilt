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
    var oldName = sc.current.display, curName = sc.current.display;
    var oldMode = sc.current.name, curMode = sc.current.name;
    var animate = 1;
    ope.addChild(UI.create(UI.image(()=>{
      Render.rect(0,0,1,1).fill(UI.theme.front);
      var v = Math.cos(animate*Math.PI)*0.5+0.5;
      Render.translate(0,1-v,()=>{
        Render.scale(1,v,()=>{
          Render.shadowed(4,UI.theme.shadow,()=>{
            sc.list[oldMode].draw(UI.theme.def);
          });
        });
      })
      Render.scale(1,1-v,()=>{
        Render.shadowed(4,UI.theme.shadow,()=>{
          sc.list[curMode].draw(UI.theme.def);
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
    var scr = UI.create(UI.scroll(1000,-1,false)).place(0,90,1,1);
    var scrLayout = scr.layout;
    scr.layout = (w,h)=>{
      scrLayout(w,95);
    };
    v.addChild(scr);
    var pos = 0;
    var available = {};
    Object.keys(sc.name).forEach((g)=>{
      var ns = sc.name[g];
      var cnt = 0;
      var plate = UI.create(UI.image(()=>{
        Render.text(g,30,0,0).left.fill(UI.theme.def);
      })).place(pos*50+10,70,1,1);
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
            scr.addChild(btn);
            pos++;
            cnt++;
          }
        })(i);
      }
      if(cnt>0)scr.addChild(plate), pos += 0.2;
    });
    scr.resize(pos*50);
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
    var scroll = UI.create(UI.scroll(-1,names.length*50));
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
        var text;
        var i = "", o = "";
        f.arity.forEach((s)=>{i += s + "   ";});
        f.coarity.forEach((s)=>{o += s + "   ";});
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
    });
    list.forceMotion();
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.line(0.2,0.2+0.05,0.8,0.2+0.05).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.5,0.8,0.5).stroke(0.1)(UI.theme.def);
      Render.line(0.2,0.8-0.05,0.8,0.8-0.05).stroke(0.1)(UI.theme.def);
    });
  });

  s.func = (()=>{
    var f = {};
    function make(ari,coari,icf,drf,spf){
      if(drf==null){
        drf = (r,shadowSize)=>{
          var col = r.valid ? UI.theme.def : UI.theme.invalid;
          Render.shadowed(4/shadowSize,UI.theme.frame,()=>{
            Render.circle(0,0,0.2).fill(UI.theme.base);
          });
          Render.circle(0,0,0.2).stroke(0.02)(col);
          Render.scale(0.2,0.2,()=>{
            Render.shadowed(2/shadowSize,UI.theme.sharp,()=>{
              icf(col);
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
          if(r.valid){
            spf(r,shadowSize);
          }else{
            drf(r,shadowSize);
          }
        },
        icon : ()=>{
          Render.shadowed(2,UI.theme.sharp,()=>{
            icf(UI.theme.def);
          });
        }
      };
    }
    f.list = {
      Id : make(["In"],["Out"],(col)=>{
        Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(col);
        Render.line(0,-0.6,0,0.6).stroke(0.2)(col);
        Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(col);
      },null,Base.void),
      Lambda : make(["Y"],["X","F"],(col)=>{
        Render.meld([
          Render.line(0,0,-0.4,0.7),
          Render.line(-0.4,-0.7,0.4,0.7)
        ]).stroke(0.2)(col);
      }),
      Apply : make(["F","X"],["Y"],(col)=>{
        Render.circle(0,0,0.4).stroke(0.2)(col);
      }),
      Duplicate : make(["In"],["Out","Out"],(col)=>{
        Render.scale(0.7,0.7,()=>{
          Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(col);
        });
      }),
      Discard : make(["In"],[],(col)=>{
        Render.line(0,0.2,0,-0.7).stroke(0.2)(col);
        Render.line(0,0.5,0,0.7).stroke(0.2)(col);
      }),
      Swap : make(["In1","In2"],["Out1","Out2"],(col)=>{
        Render.meld([
          Render.line(-0.5,-0.5,0.5,0.5),
          Render.line(-0.5,0.5,0.5,-0.5)
        ]).stroke(0.2)(col);
      },null,(r,shadowSize)=>{
        var n = r.neighbor;
        var i1,o1,i2,o2;
        for(var i=0;i<8;i++){
          if(n[i]){
            if(n[i].type){
              if(n[i].name=="Out1")i1 = i;
              else i2 = i;
            }else{
              if(n[i].name=="In1")o1 = i;
              else o2 = i;
            }
          }
        }
        var pi1 = Base.fromDir(i1);
        var po1 = Base.fromDir(o1);
        var pi2 = Base.fromDir(i2);
        var po2 = Base.fromDir(o2);
        Render.shadowed(10/shadowSize,UI.theme.base,()=>{
          Render.line(0,0,pi1.x*0.05,pi1.y*0.05).stroke(0.1)(UI.theme.base);
          Render.line(0,0,po1.x*0.05,po1.y*0.05).stroke(0.1)(UI.theme.base);
          Render.circle(0,0,0.05).fill(UI.theme.base);
        });
        Render.shadowed(2/shadowSize,UI.theme.frame,()=>{
          Render.line(0,0,pi1.x*0.4,pi1.y*0.4).stroke(0.1)(UI.theme.def);
          Render.line(0,0,po1.x*0.4,po1.y*0.4).stroke(0.1)(UI.theme.def);
          Render.circle(0,0,0.05).fill(UI.theme.def);
        });
        Render.line(0,0,pi1.x/2,pi1.y/2).stroke(0.07)(UI.theme.button);
        Render.line(0,0,po1.x/2,po1.y/2).stroke(0.07)(UI.theme.button);
        Render.circle(0,0,0.035).fill(UI.theme.button);
        var t = UI.time()%80/80;
        var sz = 0.03;
        if(t<0.7){
          Render.shadowed(4,UI.theme.shadow,()=>{
            Render.translate(t*pi1.x,t*pi1.y,()=>{
              Render.rotate(-i1*Math.PI*2/8,()=>{
                Render.rect(-sz,-sz,sz*2,sz*2).fill(UI.theme.def);
              });
            });
          });
        }
        if(0.3<t){
          Render.shadowed(4,UI.theme.shadow,()=>{
            Render.translate((1-t)*po1.x,(1-t)*po1.y,()=>{
              Render.rotate(-o1*Math.PI*2/8,()=>{
                Render.rect(-sz,-sz,sz*2,sz*2).fill(UI.theme.def);
              });
            })
          });
        }
      }),
      In : make([],["Out"],(col)=>{
        Render.cycle([0,-0.5,-0.5,0,0,0.5,0.5,0]).stroke(0.2)(col);
      }),
      Out : make(["In"],[],(col)=>{
        Render.rect(-0.4,-0.4,0.8,0.8).stroke(0.2)(col);
      })
    };
    return f;
  })();

  s.control = (()=>{
    var c = {};
    c.list = {
      Swap : {
        draw : (col)=>{
          Render.bezier([0.2,0.8,0.2,0.1,0.8,0.1,0.8,0.8]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){}
      },
      Duplicate : {
        draw : (col)=>{
          Render.meld([
            Render.rect(0.2,0.2,0.3,0.3),
            Render.rect(0.5,0.5,0.3,0.3)
          ]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){}
      },
      Select : {
        draw : (col)=>{
          Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){
          var size = 80;
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
          var a = Math.floor(start.x/size), b = Math.floor(start.y/size);
          var c = Math.floor(current.x/size), d = Math.floor(current.y/size);
          if(c < a)[a,c] = [c,a];
          if(d < b)[b,d] = [d,b];
          f.select.init(a+1,b+1,c+1,d+1);
          end = true;
        }
      },
      Move : {
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.15,0.5,0.85),
            Render.line(0.15,0.5,0.85,0.5)
          ]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){}
      },
      Rotate : {
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.5,0.5,0.8),
            Render.arc(0.5,0.5,0.3,Math.PI*3/2,Math.PI)
          ]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){}
      },
      Operate : {
        draw : (col)=>{
          Render.translate(0.5,0.5,()=>{
            Render.rotate(Math.PI/4,()=>{
              Render.rect(-0.2,-0.2,0.4,0.4).stroke(0.1)(col);
            });
          });
        },
        execute : ()=>function*(f,v){}
      },
      Place : {
        draw : (col)=>{
          Render.circle(0.5,0.5,0.25).stroke(0.1)(col);
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
        draw : (col)=>{
          Render.line(0.15,0.37,0.85,0.37).stroke(0.1)(col);
          Render.line(0.15,0.63,0.85,0.63).stroke(0.1)(col);
        },
        execute : (u)=>function*(f,v){
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
                  f.place(curX,curY,"Id");
                }else{
                  var a=0,ca=0;
                  for(var i=0;i<8;i++){
                    var b = f.bridge(curX,curY,i);
                    if(b){
                      if(b.type)ca++;
                      else a++;
                    }
                  }
                  if(a==2 && ca==1 && !f.exist(p.x,p.y)){
                    f.place(curX,curY,"Swap");
                  }
                }
                if(!f.exist(p.x,p.y)){
                  f.place(p.x,p.y,"Id");
                }
                f.connect(curX,curY,p.x,p.y);
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
        }
      },
      Disconnect : {
        draw : (col)=>{
          Render.meld([
            Render.line(0.2,0.2,0.45,0.45),
            Render.line(0.55,0.55,0.8,0.8)
          ]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){
          var size = 80;
          var p;
          while(p = yield){
            if(p.onPoint)continue;
            var x = Math.floor(p.x/size+0.5), y = Math.floor(p.y/size+0.5);
            var dx = p.x - x*size, dy = p.y - y*size;
            if(dx!=0 || dy!=0){
              var th = (8 - Math.floor(Math.atan2(dy,dx) / Math.PI / 2 * 8 + 0.5))%8;
              f.disconnect(x,y,th);
            }
          }
        }
      },
      Name : {
        draw : (col)=>{
          Render.meld([
            Render.line(0.5,0.2,0.5,0.8),
            Render.line(0.3,0.18,0.5,0.2),
            Render.line(0.7,0.18,0.5,0.2),
            Render.line(0.3,0.82,0.5,0.8),
            Render.line(0.7,0.82,0.5,0.8),
          ]).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){
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
            }
          }
        }
      },
      Delete : {
        draw : (col)=>{
          var a = [];
          for(var i=0;i<8;i++){
            var x = Math.cos(i*Math.PI/4), y = Math.sin(i*Math.PI/4);
            a.push(Render.line(x*0.2+0.5,y*0.2+0.5,x*0.38+0.5,y*0.38+0.5));
          }
          Render.meld(a).stroke(0.1)(col);
        },
        execute : ()=>function*(f,v){
          f.select.delete();
        }
      }
    };
    c.name = {
      Tile : ["Swap","Duplicate"],
      Field : ["Select","Connect","Disconnect","Name"],
      Selection : ["Move","Rotate","Delete"]
    };
    c.available = {
      Tile : false,
      Field : true,
      Selection : false
    }
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
    c.visible = (cat)=>{
      c.available[cat] = true;
    };
    c.invisible = (cat)=>{
      c.available[cat] = false;
    };
    return c;
  })();
  s.field = (v,size)=>{
    var shadowSize = size/75.0;
    var f = {};
    var map = {}, selection = [];
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
      Render.shadowed(5/shadowSize,UI.theme.select,()=>{
        allDraw((x,y,r)=>{
          if(r.select){
            var radi = 1.0;
            var width = 0.3 - 0.2 * r.selectMot;
            if(r.selectMot != 0){
              if((r.name !== "Id" && r.name !== "Swap") || !r.valid){
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
      allDraw((x,y,r)=>{
        if(r.name === "Id"){
          Render.circle(0,0,0.035).fill(UI.theme.button);
        }
        r.neighbor.forEach((e,i)=>{
          if(e){
            var p = Base.fromDir(i);
            if(e.type){
              Render.line(0,0,p.x,p.y).stroke(0.07)(UI.theme.button);
            }
            if(e.name){
              // Debug
              if(r.name!=="Swap" && e.name!=="In" && e.name!=="Out"){
                Render.rotate(-i*Math.PI/4,()=>{
                  Render.text(e.name,0.2,0.2,-0.1).left.fill(Color(1,1,0));
                });
              }
            }
          }
        })
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
    }
    f.validate = (x,y)=>{
      var m = map[[x,y]];
      m.valid = false;
      var iCnt = 0, oCnt = 0;
      for(var i=0;i<8;i++){
        if(m.neighbor[i]){
          if(m.neighbor[i].type)oCnt++;
          else iCnt++;
        }
      }
      if(m.func.arity.length == iCnt && m.func.coarity.length == oCnt){
        m.valid = true;
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
      }else{
        for(var i=0;i<8;i++){
          if(m.neighbor[i]){
            m.neighbor[i].name = null;
          }
        }
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
          map[[p.x,p.y]].neighbor.forEach((e,i)=>{
            var d = Base.fromDir(i);
            var m = map[[p.x+d.x,p.y+d.y]];
            if(m){
              n.push({x:p.x+d.x,y:p.y+d.y});
              m.neighbor[(i+4)%8] = null;
            }
          });
          delete map[[p.x,p.y]];
        });
        n.forEach((p)=>{
          if(map[[p.x,p.y]])f.validate(p.x,p.y);
        });
        selection = [];
        s.control.invisible("Selection");
        s.control.set("Select");
      };
      return e;
    })();
    return f;
  };

  Tile.initTile({
    type : 2,
    children : [
      {
        type : 1,
        children : [
          {
            type : 0,
            name : "Field"
          },{
            type : 0,
            name : "Function"
          }
        ]
      },{
        type : 0,
        name : "Control"
      }
    ]
  });

  return s;
});