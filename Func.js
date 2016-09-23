Base.write("Func",()=>{
  function make(name,ari,coari,ev,icf,drf,spf){
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
    System.func.register(name,{
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
  make("Begin",[],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.circle(0,-0.2,0.4),
      Render.line(0,0.1,0,0.7)
    ]).stroke(0.2)(col);
  });
  make("End",["From"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.circle(0,0.2,0.4),
      Render.line(0,-0.1,0,-0.7)
    ]).stroke(0.2)(col);
  });
  make("Through",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(0,-0.6,0,0.6)
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Merge",["From","From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(0,0.1,0,0.7),
      Render.line(0,0.1,-0.4,-0.6),
      Render.line(0,0.1,0.4,-0.6)
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Unit",[],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.cycle([0,0.4,-0.4,-0.4,0.4,-0.4])
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Swap",["From1","From2"],["To1","To2"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,-0.2,0.2),
      Render.line(0.2,-0.2,0.5,-0.5)
    ]).stroke(0.2)(col);
  },null,(r,shadowSize)=>{
    var n = r.neighbor;
    var i1 = r.coarity["To1"][0];
    var o1 = r.arity["From1"][0];
    var i2 = r.coarity["To2"][0];
    var o2 = r.arity["From2"][0];
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
  make("Forward",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(0,-0.6,0,0.65),
      Render.polygon([-0.4,-0.2,0,-0.6,0.4,-0.2])
    ]).stroke(0.2)(col);
  });
  make("Left",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.rotate(-Math.PI*3/4,()=>{
      Render.meld([
        Render.arc(0,0,0.4,Math.PI*3/4,Math.PI*1/4),
        Render.polygon([0.05,0,0.4,-0.35,0.75,0])
      ]).stroke(0.2)(col);
    });
  });
  make("Right",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.scale(-1,1,()=>{
      Render.rotate(-Math.PI*3/4,()=>{
        Render.meld([
          Render.arc(0,0,0.4,Math.PI*3/4,Math.PI*1/4),
          Render.polygon([0.05,0,0.4,-0.35,0.75,0])
        ]).stroke(0.2)(col);
      });
    });
  });
  make("Dig",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    var r = 0.45;
    var a = 0.3;
    Render.meld([
      Render.arc(-r,-r,a,Math.PI*3/2,0),
      Render.to(r,-r),
      Render.arc(r,r,a,Math.PI*1/2,Math.PI),
      Render.to(-r,r),
      Render.to(-r,a-r),
      Render.to(-r+0.0001,a-r)
    ]).stroke(0.2)(col);
  });
  make("Put",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    var r = 0.45;
    var a = 0.4;
    Render.meld([
      Render.arc(-r+a,-r+a,a,Math.PI*1/2,Math.PI),
      Render.to(-r,r),
      Render.arc(r-a,r-a,a,Math.PI*3/2,0),
      Render.to(r,-r),
      Render.to(a-r,-r)
    ]).stroke(0.2)(col);
  });
  make("Mark",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.rect(-0.3,-0.3,0.6,0.6)
    ]).stroke(0.2)(col);
  });
  make("Push0",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.text("0",1.7,0,0.55).center.fill(col);
  });
  make("Push1",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.text("1",1.7,-0.05,0.55).center.fill(col); 
  });
  make("Wall?",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.rect(-0.47,-0.4,0.94,0.8),
      Render.line(-0.47,0.25,0.47,0.25)
    ]).stroke(0.2)(col);
  });
  make("Goal?",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.rotate(Math.PI/4,()=>{
      Render.meld([
        Render.rect(-0.3,-0.3,0.6,0.6)
      ]).stroke(0.2)(col);
    });
  });
  make("Mark?",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.2,-0.4,0.2,-0.4),
      Render.line(0.4,-0.2,0.4,0.2),
      Render.line(0.2,0.4,-0.2,0.4),
      Render.line(-0.4,0.2,-0.4,-0.2)
    ]).stroke(0.2)(col);
  });
  make("Pop?",["From"],["0","1","X"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    var rad = Math.PI*0.5;
    Render.rotate(-Math.PI/2,()=>{
      Render.meld([
        Render.arc(0.55,0,0.45,Math.PI,Math.PI+rad),
        Render.to(-0.45,0.45),
        Render.to(-0.45,-0.45),
        Render.arc(0.55,0,0.45,Math.PI-rad,Math.PI)
      ]).stroke(0.2)(col);
    });
  });
  make("Call",["From"],["F","To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.cycle([-0.35,-0.4,0.5,0,-0.35,0.4])
    ]).stroke(0.2)(col);
  });
  make("Return",["From"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.polygon([-0.1,-0.4,-0.5,0,-0.1,0.4]),
      Render.polygon([0.5,-0.4,0.1,0,0.5,0.4])
    ]).stroke(0.2)(col);
  });
  make("Abort",["From"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,0.5,-0.5)
    ]).stroke(0.2)(col);
  });
  return {};
});