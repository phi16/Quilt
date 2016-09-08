Base.write("Func",()=>{
  function make(ari,coari,ev,icf,drf,spf){
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
    return {
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
    };
  }
  System.func.register("Id",make(["In"],["Out"],function*(m,p,d,s,e,de,err){
    var res = yield* de(m.arity["In"][0]);
    return res;
  },(col)=>{
    Render.line(-0.3,-0.6,0.3,-0.6).stroke(0.2)(col);
    Render.line(0,-0.6,0,0.6).stroke(0.2)(col);
    Render.line(-0.3,0.6,0.3,0.6).stroke(0.2)(col);
  },null,Base.void)),
  System.func.register("Lambda",make(["Y"],["X","F"],function*(m,p,d,s,e,de,err){
    if(m.coarity["F"][0] == d){
      return {
        type : "function",
        position : p,
        bridge : m.arity["Y"][0],
        scope : Base.clone(s)
      };
    }else{
      var x = s[[p.x,p.y]];
      if(x){
        if(x.type == "thunk"){
          var res = yield* e(x.position,x.bridge,x.scope);
          return res;
        }else if(x.type == "variable"){
          return x;
        }else return err("Invalid value : " + Base.str(x));
      }else return err("No scope variable");
    }
  },(col)=>{
    Render.meld([
      Render.line(0,-0.1,-0.4,0.7),
      Render.line(-0.2,-0.7,0.4,0.7)
    ]).stroke(0.2)(col);
  }));
  System.func.register("Apply",make(["F","X"],["Y"],function*(m,p,d,s,e,de,err){
    var res = yield* de(m.arity["F"][0]);
    if(res.type == "function"){
      var scope = Base.clone(res.scope);
      if(scope[[res.position.x,res.position.y]])return err("Duplicate variable : " + Base.str(scope[p]));
      scope[[res.position.x,res.position.y]] = {
        type : "thunk",
        position : p,
        bridge : m.arity["X"][0],
        scope : Base.clone(s)
      };
      var ret = yield* e(res.position,res.bridge,scope);
      return ret;
    }else if(res.type == "variable" || res.type == "apply"){
      var arg = yield* de(m.arity["X"][0]);
      return {
        type : "apply",
        function : res,
        argument : arg
      };
    }else return err("Not a function : " + Base.str(res));
  },(col)=>{
    Render.circle(0,0,0.4).stroke(0.2)(col);
  }));
  System.func.register("Duplicate",make(["In"],["Out","Out"],function*(m,p,d,s,e,de,err){
    var res = yield* de(m.arity["In"][0]);
    return res;
  },(col)=>{
    Render.scale(0.7,0.7,()=>{
      Render.cycle([0,-0.9,-0.7,0.7,0.7,0.7]).stroke(0.3)(col);
    });
  }));
  System.func.register("Discard",make(["In"],[],function*(m,p,d,s,e,de,err){
    return err("Try to evaluate Discard");
  },(col)=>{
    Render.line(0,0.2,0,-0.7).stroke(0.2)(col);
    Render.line(0,0.5,0,0.7).stroke(0.2)(col);
  }));
  System.func.register("Swap",make(["In1","In2"],["Out1","Out2"],function*(m,p,d,s,e,de,err){
    var n;
    if(m.neighbor[d].name=="Out1")n = "In1";
    else n = "In2";
    var res = yield* de(m.arity[n][0]);
    return res;
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,0.5,-0.5)
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
  }));
  System.func.register("In",make([],["Out"],function*(m,p,d,s,e,de,err){
    return err("Try to evaluate In");
  },(col)=>{
    Render.cycle([0,-0.5,-0.5,0,0,0.5,0.5,0]).stroke(0.2)(col);
  }));
  System.func.register("Out",make(["In"],[],function*(m,p,d,s,e,de,err){
    return err("Try to evaluate Out");
  },(col)=>{
    Render.rect(-0.4,-0.4,0.8,0.8).stroke(0.2)(col);
  }));
  return {};
});