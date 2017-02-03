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
  System.func.addCategory("Input");
  System.func.addCategory("Negative Edge Trigger");
  System.func.addCategory("Composition");

  make("Id","Flow",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    ev.setLevel(p,d)(s.value);
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(col);
    Render.line(0,-0.6,0,0.6).stroke(0.2)(col);
    Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(col);
  },null,Base.void),
  make("Duplicate","Flow",["In"],["Out","Out"],function*(m,p,d,s,ev,e,de,err){
    let v = s.value;
    ev.setLevel(p,d)(v);
    yield* de(m.coarity["Out"][0]);
    s.value = v;
    yield* de(m.coarity["Out"][1]);
  },(col)=>{
    Render.scale(0.7,0.7,()=>{
      Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(col);
    });
  },null,Base.void);
  make("Discard","Flow",["In"],[],function*(m,p,d,s,ev,e,de,err){
    ev.setLevel(p,d)(s.value);
  },(col)=>{
    Render.line(0,0.2,0,-0.7).stroke(0.2)(col);
    Render.line(0,0.5,0,0.7).stroke(0.2)(col);
  },null,Base.void);
  make("Swap","Flow",["In1","In2"],["Out1","Out2"],function*(m,p,d,s,ev,e,de,err){
    ev.setLevel(p,d)(s.value);
    if(m.neighbor[d].name=="In1")n = "Out1";
    else n = "Out2";
    yield* de(m.coarity[n][0]);
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

  make("Not","Operator",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    if(x!=-1)s.value = !x;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.5,0,0.5,0])
    ]).stroke(0.2)(col);
  });
  make("And","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1)s.value = x && y;
    else if(x==0 || y==0)s.value = 0;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,0.6,0,-0.4,0.4,0.6])
    ]).stroke(0.2)(col);
  });
  make("Or","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1)s.value = x || y;
    else if(x==1 || y==1)s.value = 1;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,-0.6,0,0.4,0.4,-0.6])
    ]).stroke(0.2)(col);
  });
  make("Nand","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1)s.value = !(x && y);
    else if(x==0 || y==0)s.value = 1;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,0.6,0,-0.1,0.4,0.6]),
      Render.polygon([-0.4,-0.5,0.4,-0.5])
    ]).stroke(0.2)(col);
  });
  make("Nor","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1)s.value = !(x || y);
    else if(x==1 || y==1)s.value = 0;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,-0.3,0,0.4,0.4,-0.3]),
      Render.polygon([-0.4,-0.5,0.4,-0.5])
    ]).stroke(0.2)(col);
  });
  make("Xor","Operator",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1)s.value = x != y;
    else s.value = -1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.5,0,0.5,0]),
      Render.polygon([0,-0.5,0,0.5])
    ]).stroke(0.2)(col);
  });

  make("SRFF","Negative Edge Trigger",["S","R","CK"],["Q","N"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    if(m.clock===undefined){
      m.state = 0;
      m.clock = 0;
    }
    let is = ev.getLevel(p.x,p.y,m.arity["S"][0]);
    let ir = ev.getLevel(p.x,p.y,m.arity["R"][0]);
    let ick = ev.getLevel(p.x,p.y,m.arity["CK"][0]);
    if(is!=-1 && ir!=-1 && ick!=-1){
      if(ick==0 && m.clock==1){
        if(is)m.state = 1;
        else if(ir)m.state = 0;
      }
      s.value = m.state;
      yield* de(m.coarity["Q"][0]);
      s.value = !m.state;
      yield* de(m.coarity["N"][0]);
      m.clock = ick;
    }
  },(col)=>{
    Render.text("SR",1.2,0,0.4).center.fill(col);
  });
  make("JKFF","Negative Edge Trigger",["J","K","CK"],["Q","N"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    if(m.clock===undefined){
      m.state = 0;
      m.clock = 0;
    }
    let ij = ev.getLevel(p.x,p.y,m.arity["J"][0]);
    let ik = ev.getLevel(p.x,p.y,m.arity["K"][0]);
    let ick = ev.getLevel(p.x,p.y,m.arity["CK"][0]);
    if(ij!=-1 && ik!=-1 && ick!=-1){
      if(ick==0 && m.clock==1){
        if(ij&&ik)m.state = !m.state;
        else if(ij)m.state = 1;
        else if(ir)m.state = 0;
      }
      s.value = m.state;
      yield* de(m.coarity["Q"][0]);
      s.value = !m.state;
      yield* de(m.coarity["N"][0]);
      m.clock = ick;
    }
  },(col)=>{
    Render.text("JK",1.2,0,0.4).center.fill(col);
  });
  make("DFF","Negative Edge Trigger",["D","CK"],["Q","N"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    if(m.clock===undefined){
      m.state = 0;
      m.clock = 0;
    }
    let id = ev.getLevel(p.x,p.y,m.arity["D"][0]);
    let ick = ev.getLevel(p.x,p.y,m.arity["CK"][0]);
    if(id!=-1 && ick!=-1){
      if(ick==0 && m.clock==1){
        m.state = id;
      }
      s.value = m.state;
      yield* de(m.coarity["Q"][0]);
      s.value = !m.state;
      yield* de(m.coarity["N"][0]);
      m.clock = ick;
    }
  },(col)=>{
    Render.text("DF",1.2,0,0.4).center.fill(col);
  });
  make("TFF","Negative Edge Trigger",["T","CK"],["Q","N"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    if(m.clock===undefined){
      m.state = 0;
      m.clock = 0;
    }
    let id = ev.getLevel(p.x,p.y,m.arity["T"][0]);
    let ick = ev.getLevel(p.x,p.y,m.arity["CK"][0]);
    if(id!=-1 && ick!=-1){
      if(ick==0 && m.clock==1){
        if(id)m.state = !m.state;
      }
      s.value = m.state;
      yield* de(m.coarity["Q"][0]);
      s.value = !m.state;
      yield* de(m.coarity["N"][0]);
      m.clock = ick;
    }
  },(col)=>{
    Render.text("TF",1.2,0,0.4).center.fill(col);
  });

  make("Half Adder","Composition",["In","In"],["S","C"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    if(x!=-1 && y!=-1){
      s.value = x != y;
      yield* de(m.coarity["S"][0]);
      s.value = x && y;
      yield* de(m.coarity["C"][0]);
    }
  },(col)=>{
    Render.text("HA",1.2,0,0.4).center.fill(col);
  });
  make("Full Adder","Composition",["In","In","In"],["S","C"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1){
      ev.setLevel(p,d)(s.value);
      return;
    }
    let x = ev.getLevel(p.x,p.y,m.arity["In"][0]);
    let y = ev.getLevel(p.x,p.y,m.arity["In"][1]);
    let z = ev.getLevel(p.x,p.y,m.arity["In"][2]);
    if(x!=-1 && y!=-1 && z!=-1){
      s.value = (x+y+z)%2;
      yield* de(m.coarity["S"][0]);
      s.value = x+y+z >= 2 ? 1 : 0;
      yield* de(m.coarity["C"][0]);
    }
  },(col)=>{
    Render.text("FA",1.2,0,0.4).center.fill(col);
  });

  make("L","Input",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1)return;
    s.value = 0;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.text("0",2,0,0.65).center.fill(col);
  });
  make("H","Input",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1)return;
    s.value = 1;
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.text("1",2,-0.07,0.65).center.fill(col);
  });
  make("CK","Input",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(d!=-1)return;
    s.value = ev.clock();
    yield* de(m.coarity["Out"][0]);
  },(col)=>{
    Render.text("CK",1.2,0,0.4).center.fill(col);
  });
  ["A","B","C","D","E","F","G","X","Y","Z"].forEach((n)=>{
    make(n,"Input",[],["Out"],function*(m,p,d,s,ev,e,de,err){
      if(d!=-1)return;
      s.value = ev.getVar(n);
      yield* de(m.coarity["Out"][0]);
    },(col)=>{
      Render.text(n,1.8,0,0.65).center.fill(col);
    });
  });
  return {};
});
