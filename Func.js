Base.write("Func",()=>{
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
  System.func.addCategory("Function");
  System.func.addCategory("Number");
  System.func.addCategory("Boolean");
  make("In","Flow",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    yield "In";
    var str = prompt("Input a value");
    if(str === "T" || str === "True" || str === "t" || str === "true"){
      return {
        type : "boolean",
        boolean : true
      };
    }else if(str === "F" || str === "False" || str === "f" || str === "false"){
      return {
        type : "boolean",
        boolean : false
      };
    }else{
      var v = Number(str);
      if(str!=null && str.length>0 && !isNaN(v)){
        return {
          type : "number",
          number : v
        };
      }else{
        return err("Failed to convert " + Base.str(str) + " to a value");
      }
    }
  },(col)=>{
    Render.cycle([0,-0.5,-0.5,0,0,0.5,0.5,0]).stroke(0.2)(col);
  });
  make("Out","Flow",["In"],[],function*(m,p,d,s,ev,e,de,err){
    return err("Tried to evaluate Out");
  },(col)=>{
    Render.rect(-0.4,-0.4,0.8,0.8).stroke(0.2)(col);
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
  make("Lambda","Function",["Y"],["F","X"],function*(m,p,d,s,ev,e,de,err){
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
  });
  make("Apply","Function",["F","X"],["Y"],function*(m,p,d,s,ev,e,de,err){
    var res = yield* de(m.arity["F"][0]);
    if(res.type == "function"){
      var scope = Base.clone(res.scope);
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
  });
  make("Zero","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 0
    };
  },(col)=>{
    Render.text("0",2,0,0.65).center.fill(col);
  });
  make("One","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 1
    };
  },(col)=>{
    Render.text("1",2,-0.07,0.65).center.fill(col);
  });
  make("Two","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 2
    };
  },(col)=>{
    Render.text("2",2,0,0.65).center.fill(col);
  });
  make("Three","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 3
    };
  },(col)=>{
    Render.text("3",2,0,0.65).center.fill(col);
  });
  make("Four","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 4
    };
  },(col)=>{
    Render.text("4",2,0.1,0.65).center.fill(col);
  });
  make("Five","Number",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "number",
      number : 5
    };
  },(col)=>{
    Render.text("5",2,0,0.65).center.fill(col);
  });
  make("Plus","Number",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    var y = yield* de(m.arity["In"][1]);
    if(x.type == "number" && y.type == "number"){
      return {
        type : "number",
        number : x.number + y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.line(-0.5,0,0.5,0),
      Render.line(0,0.5,0,-0.5)
    ]).stroke(0.2)(col);
  });
  make("Minus","Number",["X","Y"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["X"][0]);
    var y = yield* de(m.arity["Y"][0]);
    if(x.type == "number" && y.type == "number"){
      return {
        type : "number",
        number : x.number - y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.line(-0.6,0,0.6,0)
    ]).stroke(0.2)(col);
  });
  make("Multiply","Number",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    var y = yield* de(m.arity["In"][1]);
    if(x.type == "number" && y.type == "number"){
      return {
        type : "number",
        number : x.number * y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.5,0.5,0.5),
      Render.line(-0.5,0.5,0.5,-0.5)
    ]).stroke(0.2)(col);
  });
  make("Divide","Number",["X","Y"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["X"][0]);
    var y = yield* de(m.arity["Y"][0]);
    if(x.type == "number" && y.type == "number"){
      return {
        type : "number",
        number : x.number / y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.line(-0.6,0,0.6,0),
      Render.line(0,-0.6,0,-0.35),
      Render.line(0,0.6,0,0.35)
    ]).stroke(0.2)(col);
  });
  make("Modulo","Number",["X","Y"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["X"][0]);
    var y = yield* de(m.arity["Y"][0]);
    if(x.type == "number" && y.type == "number"){
      return {
        type : "number",
        number : x.number % y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  });
  make("True","Boolean",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "boolean",
      boolean : true
    };
  },(col)=>{
    Render.meld([
      Render.line(-0.4,-0.4,0.4,-0.4),
      Render.line(0,-0.4,0,0.6)
    ]).stroke(0.2)(col);
  });
  make("False","Boolean",[],["Out"],function*(m,p,d,s,ev,e,de,err){
    return {
      type : "boolean",
      boolean : false
    };
  },(col)=>{
    Render.meld([
      Render.line(-0.4,0.4,0.4,0.4),
      Render.line(0,0.4,0,-0.6)
    ]).stroke(0.2)(col);
  });
  make("And","Boolean",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    if(x.type == "boolean"){
      if(!x.boolean){
        return {
          type : "boolean",
          boolean : false
        };
      }else{
        var y = yield* de(m.arity["In"][1]);
        return y;
      }
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,0.6,0,-0.4,0.4,0.6])
    ]).stroke(0.2)(col);
  });
  make("Or","Boolean",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    if(x.type == "boolean"){
      if(x.boolean){
        return {
          type : "boolean",
          boolean : true
        };
      }else{
        var y = yield* de(m.arity["In"][1]);
        return y;
      }
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.4,-0.6,0,0.4,0.4,-0.6])
    ]).stroke(0.2)(col);
  });
  make("Not","Boolean",["In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    if(x.type == "boolean"){
      return {
        type : "boolean",
        boolean : !x.boolean
      };
    }else return err("Type mismatch : " + x.type);
  },(col)=>{
    Render.meld([
      Render.polygon([-0.5,-0.1,0.4,-0.1,0.4,0.3])
    ]).stroke(0.2)(col);
  });
  make("If","Boolean",["C","T","F"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var c = yield* de(m.arity["C"][0]);
    if(c.type == "boolean"){
      var res = yield* de(m.arity[c.boolean?"T":"F"][0]);
      return res;
    }else return err("Type mismatch : " + c.type);
  },(col)=>{
    Render.meld([
      Render.line(0,0.3,0,0,1),
      Render.arc(0,-0.2,0.3,Math.PI*3/2,Math.PI)
    ]).stroke(0.2)(col);
    Render.line(0,0.5,0,0.7).stroke(0.2)(col);
  });
  make("Same","Boolean",["In","In"],["Out"],function*(m,p,d,s,ev,e,de,err){
    var x = yield* de(m.arity["In"][0]);
    var y = yield* de(m.arity["In"][1]);
    if(x.type == "boolean" && y.type == "boolean"){
      return {
        type : "boolean",
        boolean : x.boolean === y.boolean
      };
    }else if(x.type == "number" && y.type == "number"){
      return {
        type : "boolean",
        boolean : x.number === y.number
      };
    }else return err("Type mismatch : " + x.type + ", " + y.type);
  },(col)=>{
    Render.meld([
      Render.line(-0.5,-0.25,0.5,-0.25),
      Render.line(-0.5,0.25,0.5,0.25)
    ]).stroke(0.2)(col);
  });
  return {};
});
