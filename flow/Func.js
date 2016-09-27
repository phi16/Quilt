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
  System.func.addCategory("Turtle");
  System.func.addCategory("Stack");
  System.func.addCategory("Special");
  System.func.addCategory("Routine");
  make("Begin","Flow",[],["To"],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.circle(0,-0.2,0.4),
      Render.line(0,0.1,0,0.7)
    ]).stroke(0.2)(col);
  });
  make("End","Flow",["From"],[],function*(m,p,d,s,ev,e,de,err){
    ev.end();
  },(col)=>{
    Render.meld([
      Render.circle(0,0.2,0.4),
      Render.line(0,-0.1,0,-0.7)
    ]).stroke(0.2)(col);
  });
  make("Through","Flow",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.meld([
      Render.line(0,-0.6,0,0.6)
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Merge","Flow",["From","From"],["To"],function*(m,p,d,s,ev,e,de,err){
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.meld([
      Render.line(0,0.1,0,0.7),
      Render.line(0,0.1,-0.4,-0.6),
      Render.line(0,0.1,0.4,-0.6)
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Unit","Flow",[],["To"],function*(m,p,d,s,ev,e,de,err){
    return err("tried to evaluate Unit");
  },(col)=>{
    Render.meld([
      Render.cycle([0,0.4,-0.4,-0.4,0.4,-0.4])
    ]).stroke(0.2)(col);
  },null,Base.void);
  make("Swap","Flow",["From1","From2"],["To1","To2"],function*(m,p,d,s,ev,e,de,err){
    var n;
    if(m.neighbor[d].name=="From1")n = "To1";
    else n = "To2";
    yield* de(m.coarity[n][0]);
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
  make("Forward","Turtle",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    ev.field.pos.x += ddx[ev.field.pos.d];
    ev.field.pos.y += ddy[ev.field.pos.d];
    if(ev.field.ix(ev.field.pos.x,ev.field.pos.y).type){
      return err("crashed into a wall");
    }else{
      yield* de(m.coarity["To"][0]);
    }
  },(col)=>{
    Render.meld([
      Render.line(0,-0.6,0,0.65),
      Render.polygon([-0.4,-0.2,0,-0.6,0.4,-0.2])
    ]).stroke(0.2)(col);
  });
  make("Left","Turtle",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    ev.field.pos.d++;
    ev.field.sumDir++;
    if(ev.field.pos.d == 4)ev.field.pos.d = 0;
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.rotate(-Math.PI*3/4,()=>{
      Render.meld([
        Render.arc(0,0,0.4,Math.PI*3/4,Math.PI*1/4),
        Render.polygon([0.05,0,0.4,-0.35,0.75,0])
      ]).stroke(0.2)(col);
    });
  });
  make("Right","Turtle",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    ev.field.pos.d--;
    ev.field.sumDir--;
    if(ev.field.pos.d == -1)ev.field.pos.d = 3;
    yield* de(m.coarity["To"][0]);
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
  make("Wall?","Turtle",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x + ddx[ev.field.pos.d];
    var py = ev.field.pos.y + ddy[ev.field.pos.d];
    if(ev.field.ix(px,py).type){
      yield* de(m.coarity["Y"][0]);
    }else{
      yield* de(m.coarity["N"][0]);
    }
  },(col)=>{
    Render.meld([
      Render.rect(-0.47,-0.4,0.94,0.8),
      Render.line(-0.47,0.25,0.47,0.25)
    ]).stroke(0.2)(col);
  });
  make("Goal?","Turtle",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x;
    var py = ev.field.pos.y;
    if(ev.field.goal.x == px && ev.field.goal.y == py){
      yield* de(m.coarity["Y"][0]);
    }else{
      yield* de(m.coarity["N"][0]);
    }
  },(col)=>{
    Render.rotate(Math.PI/4,()=>{
      Render.meld([
        Render.rect(-0.3,-0.3,0.6,0.6)
      ]).stroke(0.2)(col);
    });
  });
  make("Mark","Special",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x;
    var py = ev.field.pos.y;
    ev.field.ix(px,py).mark = !ev.field.ix(px,py).mark;
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.meld([
      Render.rect(-0.3,-0.3,0.6,0.6)
    ]).stroke(0.2)(col);
  });
  make("Mark?","Special",["From"],["Y","N"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x;
    var py = ev.field.pos.y;
    if(ev.field.ix(px,py).mark){
      yield* de(m.coarity["Y"][0]);
    }else{
      yield* de(m.coarity["N"][0]);
    }
  },(col)=>{
    Render.meld([
      Render.line(-0.2,-0.4,0.2,-0.4),
      Render.line(0.4,-0.2,0.4,0.2),
      Render.line(0.2,0.4,-0.2,0.4),
      Render.line(-0.4,0.2,-0.4,-0.2)
    ]).stroke(0.2)(col);
  });
  make("Dig","Special",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x + ddx[ev.field.pos.d];
    var py = ev.field.pos.y + ddy[ev.field.pos.d];
    if(px<0 || py<0 || px>=ev.field.size || py>=ev.field.size){
      return err("out of bounds");
    }else if(ev.field.ix(px,py).type){
      ev.field.ix(px,py).type = false;
      yield* de(m.coarity["To"][0]);
    }else{
      return err("there is no wall");
    }
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
  make("Put","Special",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    var px = ev.field.pos.x + ddx[ev.field.pos.d];
    var py = ev.field.pos.y + ddy[ev.field.pos.d];
    if(px<0 || py<0 || px>=ev.field.size || py>=ev.field.size){
      return err("out of bounds");
    }else if(ev.field.ix(px,py).type){
      return err("there is already a wall");
    }else{
      ev.field.ix(px,py).type = true;
      yield* de(m.coarity["To"][0]);
    }
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
  make("Push0","Stack",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    ev.field.stack.push(0);
    ev.field.stackPush();
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.text("0",1.7,0,0.55).center.fill(col);
  });
  make("Push1","Stack",["From"],["To"],function*(m,p,d,s,ev,e,de,err){
    ev.field.stack.push(1);
    ev.field.stackPush();
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.text("1",1.7,-0.05,0.55).center.fill(col); 
  });
  make("Pop?","Stack",["From"],["0","1","X"],function*(m,p,d,s,ev,e,de,err){
    if(ev.field.stack.length == 0){
      yield* de(m.coarity["X"][0]);
    }else{
      var t = ev.field.stack.pop();
      ev.field.stackPop();
      if(t==0){
        yield* de(m.coarity["0"][0]);
      }else{
        yield* de(m.coarity["1"][0]);
      }
    }
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
  make("Call","Routine",["From"],["F","To"],function*(m,p,d,s,ev,e,de,err){
    yield* e(p,m.coarity["F"][0],s);
    yield* de(m.coarity["To"][0]);
  },(col)=>{
    Render.meld([
      Render.cycle([-0.35,-0.4,0.5,0,-0.35,0.4])
    ]).stroke(0.2)(col);
  });
  make("Return","Routine",["From"],[],function*(m,p,d,s,ev,e,de,err){
  },(col)=>{
    Render.meld([
      Render.polygon([-0.1,-0.4,-0.5,0,-0.1,0.4]),
      Render.polygon([0.5,-0.4,0.1,0,0.5,0.4])
    ]).stroke(0.2)(col);
  });
  make("Abort","Routine",["From"],[],function*(m,p,d,s,ev,e,de,err){
    return err("abort!");
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,0.5,-0.5)
    ]).stroke(0.2)(col);
  });
  return {};
});