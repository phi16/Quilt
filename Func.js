Base.write("Func",()=>{
  var ddx = [1,0,-1,0], ddy = [0,-1,0,1];
  function make(name,cat,ari,coari,ev,icf,drf,spf){
    if(icf==null){
      var str = name[0];
      icf = (col)=>{
        Render.text(str,1.7,0,0.65).forceCenter.fill(col);
      }
    }
    if(drf==null){
      drf = (r,shadowSize)=>{
        var col = r.valid ? UI.theme.def : UI.theme.invalid;
        var sdw = r.valid ? UI.theme.sharp : Color(1,0.2,0);
        Render.shadowed(4/shadowSize,UI.theme.frame,()=>{
          Render.circle(0,0,0.2).fill(UI.theme.base);
        });
        Render.circle(0,0,0.2).stroke(0.02)(col);
        Render.scale(0.2,0.2,()=>{
          Render.shadowed(2/shadowSize,sdw,()=>{
            icf(col);
          });
        });
      }
    }
    if(spf==null){
      spf = drf;
    }
    System.func.register(name,cat,{
      arity : ari,
      coarity : coari,
      eval : ev,
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
    });
  }
  System.func.addCategory("Flow");
  System.func.addCategory("Operator");
  System.func.addCategory("Variable");
  System.func.addCategory("Coefficient");
  make("Produce","Flow",[],["Out","Out"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.25,-0.5,-0.25,0.5),
      Render.line(0.25,-0.5,0.25,0.5)
    ]).stroke(0.2)(col);
  });
  make("Equality","Flow",["In","In"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.25,0.5,-0.25),
      Render.line(-0.5,0.25,0.5,0.25)
    ]).stroke(0.2)(col);
  });
  make("Id","Flow",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var res = yield* de(m.arity["In"][0]);
    return res;
  },(col)=>{
    Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(col);
    Render.line(0,-0.6,0,0.6).stroke(0.2)(col);
    Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(col);
  },null,Base.void),
  make("Duplicate","Flow",["In"],["Out","Out"],function*(m,p,d,s,ev,e,de,err){
    var scopeStr = "";
    for(var i in m.depend){
      scopeStr += ev.showScope(s[i]);
    }
    if(ev.cache[[p.x,p.y]] && ev.cache[[p.x,p.y]][scopeStr]){
      return ev.cache[[p.x,p.y]][scopeStr];
    }else{
      var res = yield* de(m.arity["In"][0]);
      if(!ev.cache[[p.x,p.y]])ev.cache[[p.x,p.y]] = {};
      ev.cache[[p.x,p.y]][scopeStr] = res;
      return res;
    }
  },(col)=>{
    Render.scale(0.7,0.7,()=>{
      Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(col);
    });
  },null,Base.void);
  make("Discard","Flow",["In"],[],function*(m,p,d,s,ev,e,de,err){
    return err("Tried to evaluate Discard");
  },(col)=>{
    Render.line(0,0.2,0,-0.7).stroke(0.2)(col);
    Render.line(0,0.5,0,0.7).stroke(0.2)(col);
  },null,Base.void);
  make("Swap","Flow",["In1","In2"],["Out1","Out2"],function*(m,p,d,s,ev,e,de,err){
    var n;
    if(m.neighbor[d].name=="Out1")n = "In1";
    else n = "In2";
    var res = yield* de(m.arity[n][0]);
    return res;
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,-0.2,0.2),
      Render.line(0.2,-0.2,0.5,-0.5)
    ]).stroke(0.2)(col);
  },null,(r,shadowSize)=>{
    var n = r.neighbor;
    var i1 = r.coarity["Out1"][0];
    var o1 = r.arity["In1"][0];
    var i2 = r.coarity["Out2"][0];
    var o2 = r.arity["In2"][0];
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
  });
  make("Plus","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.5,0,0.5,0),
      Render.line(0,0.5,0,-0.5)
    ]).stroke(0.2)(col);
  });
  make("Negate","Operator",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.6,0,0.6,0)
    ]).stroke(0.2)(col);
  });
  make("0","Operator",["In"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.text("0",2,0,0.65).center.fill(col);
  });
  make("1","Operator",[],["Out"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.text("1",2,-0.07,0.65).center.fill(col);
  });
  ["A","B","C","D","E","F","G","X","Y","Z"].forEach((n)=>{
    make(n,"Variable",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    },(col)=>{
      Render.text(n,1.8,0,0.65).center.fill(col);
    });
  });
  ([2,3,4,5,6]).forEach((n)=>{
    make(String(n),"Coefficient",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    },(col)=>{
      Render.text(String(n),2,0,0.65).center.fill(col);
    });
  });
  ["a","b","c","d","e","f","g","x","y","z"].forEach((n)=>{
    make(n,"Coefficient",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    },(col)=>{
      Render.text(n,1.8,0,0.5).center.fill(col);
    });
  });
  return {};
});