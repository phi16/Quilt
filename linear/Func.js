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
  System.func.addCategory("Coefficient");
  System.func.addCategory("Variable");
  make("Produce","Flow",[],["Out","Out"],function*(m,p,d,s,ev,e,de,err){
    if(d<0){
      var r1 = yield* de(m.coarity["Out"][0]);
      var r2 = yield* de(m.coarity["Out"][1]);
      var res = {};
      Object.keys(r1).forEach((k)=>{
        if(res[k]==null)res[k] = r1[k];
        else res[k] += r1[k];
      });
      Object.keys(r2).forEach((k)=>{
        if(res[k]==null)res[k] = -r2[k];
        else res[k] -= r2[k];
      });
      return [res];
    }else{
      var res = {};
      res[[p.x,p.y]] = 1;
      return res;
    }
  },(col)=>{
    Render.meld([
      Render.line(-0.25,-0.5,-0.25,0.5),
      Render.line(0.25,-0.5,0.25,0.5)
    ]).stroke(0.2)(col);
  });
  make("Equality","Flow",["In","In"],[],function*(m,p,d,s,ev,e,de,err){
    if(d<0){
      var r1 = yield* de(m.arity["In"][0]);
      var r2 = yield* de(m.arity["In"][1]);
      var res = {};
      Object.keys(r1).forEach((k)=>{
        if(res[k]==null)res[k] = r1[k];
        else res[k] += r1[k];
      });
      Object.keys(r2).forEach((k)=>{
        if(res[k]==null)res[k] = -r2[k];
        else res[k] -= r2[k];
      });
      return [res];
    }else{
      var res = {};
      res[[p.x,p.y]] = 1;
      return res;
    }
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.25,0.5,-0.25),
      Render.line(-0.5,0.25,0.5,0.25)
    ]).stroke(0.2)(col);
  });
  make("Id","Flow",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(m.neighbor[d].name == "In"){
      var res = yield* de(m.coarity["Out"][0]);
      return res;
    }else{
      var res = yield* de(m.arity["In"][0]);
      return res;
    }
  },(col)=>{
    Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(col);
    Render.line(0,-0.6,0,0.6).stroke(0.2)(col);
    Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(col);
  },null,Base.void),
  make("Duplicate","Flow",["In"],["Out","Out"],function*(m,p,d,s,ev,e,de,err){
    if(d<0){
      var r1 = yield* de(m.arity["In"][0]);
      var r2 = yield* de(m.coarity["Out"][0]);
      var r3 = yield* de(m.coarity["Out"][1]);
      if(r1[[p.x,p.y]])r1[[p.x,p.y]] -= 1;
      else r1[[p.x,p.y]] = -1;
      if(r2[[p.x,p.y]])r2[[p.x,p.y]] -= 1;
      else r2[[p.x,p.y]] = -1;
      if(r3[[p.x,p.y]])r3[[p.x,p.y]] -= 1;
      else r3[[p.x,p.y]] = -1;
      return [r1,r2,r3];
    }else{
      var res = {};
      res[[p.x,p.y]] = 1;
      return res;
    }
  },(col)=>{
    Render.scale(0.7,0.7,()=>{
      Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(col);
    });
  },null,Base.void);
  make("Discard","Flow",["In"],[],function*(m,p,d,s,ev,e,de,err){
    var res = {};
    res[[p.x,p.y]] = 1;
    return res;
  },(col)=>{
    Render.line(0,0.2,0,-0.7).stroke(0.2)(col);
    Render.line(0,0.5,0,0.7).stroke(0.2)(col);
  },null,Base.void);
  make("Swap","Flow",["In1","In2"],["Out1","Out2"],function*(m,p,d,s,ev,e,de,err){
    var dir;
    var n;
    if(m.neighbor[d].name=="Out1")dir = "arity", n = "In1";
    else if(m.neighbor[d].name=="Out2")dir = "arity", n = "In2";
    else if(m.neighbor[d].name=="In1")dir = "coarity", n = "Out1";
    else if(m.neighbor[d].name=="In2")dir = "coarity", n = "Out2";
    var res = yield* de(m[dir][n][0]);
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
    if(d<0){
      var r1 = yield* de(m.arity["In"][0]);
      var r2 = yield* de(m.arity["In"][1]);
      var r3 = yield* de(m.coarity["Out"][0]);
      var res = {};
      if(r1[[p.x,p.y]+"A"])r1[[p.x,p.y]+"A"] -= 1;
      else r1[[p.x,p.y]+"A"] = -1;
      if(r2[[p.x,p.y]+"B"])r2[[p.x,p.y]+"B"] -= 1;
      else r2[[p.x,p.y]+"B"] = -1;
      if(r3[[p.x,p.y]+"C"])r3[[p.x,p.y]+"C"] -= 1;
      else r3[[p.x,p.y]+"C"] = -1;
      res[[p.x,p.y]+"A"] = 1;
      res[[p.x,p.y]+"B"] = 1;
      res[[p.x,p.y]+"C"] = -1;
      return [r1,r2,r3,res];
    }else{
      var t = 1;
      for(var i=0;i<d;i++){
        if(m.neighbor[i]){
          if(m.neighbor[i].name == "In")t++;
        }
      }
      var res = {};
      if(m.neighbor[d].name=="In" && t==1){
        res[[p.x,p.y]+"A"] = 1;
      }
      if(m.neighbor[d].name=="In" && t==2){
        res[[p.x,p.y]+"B"] = 1;
      }
      if(m.neighbor[d].name=="Out"){
        res[[p.x,p.y]+"C"] = 1;
      }
      return res;
    }
  },(col)=>{
    Render.meld([
      Render.line(-0.5,0,0.5,0),
      Render.line(0,0.5,0,-0.5)
    ]).stroke(0.2)(col);
  });
  make("Negate","Operator",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    if(m.neighbor[d].name=="In"){
      var res = yield* de(m.coarity["Out"][0]);
      Object.keys(res).forEach((k)=>{
        res[k] *= -1;
      });
      return res;
    }else{
      var res = yield* de(m.arity["In"][0]);
      Object.keys(res).forEach((k)=>{
        res[k] *= -1;
      });
      return res;
    }
  },(col)=>{
    Render.meld([
      Render.line(-0.6,0,0.6,0)
    ]).stroke(0.2)(col);
  });
  make("0","Operator",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return [];
  },(col)=>{
    Render.text("0",2,0,0.65).center.fill(col);
  });
  make("1","Operator",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {"1":1};
  },(col)=>{
    Render.text("1",2,-0.07,0.65).center.fill(col);
  });
  ([2,3,4,5,6]).forEach((n)=>{
    make(String(n),"Coefficient",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
      if(m.neighbor[d].name=="In"){
        var res = yield* de(m.coarity["Out"][0]);
        Object.keys(res).forEach((k)=>{
          res[k] /= n;
        });
        return res;
      }else{
        var res = yield* de(m.arity["In"][0]);
        Object.keys(res).forEach((k)=>{
          res[k] *= n;
        });
        return res;
      }
    },(col)=>{
      Render.text(String(n),2,0,0.65).center.fill(col);
    });
  });
  ["A","B","C","D","E","F","G","X","Y","Z"].forEach((n)=>{
    make(n,"Variable",[],["Out"],function*(m,p,d,s,ev,e,de,err){
      var res = {};
      res[n] = 1;
      return res;
    },(col)=>{
      Render.text(n,1.8,0,0.65).center.fill(col);
    });
  });
  return {};
});
