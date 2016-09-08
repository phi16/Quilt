Base.write("Eval",()=>{
  return (field,map)=>{
    var e = {};
    function* evaluate(position,bridge,scope){
      yield "begin("+position.x+","+position.y+") [(" + position.x + "," + position.y + ")," + bridge + "," + JSON.stringify(scope) + "]";
      var p = Base.fromDir(bridge);
      var nd = (bridge+4)%8;
      var np = {x:position.x+p.x,y:position.y+p.y};
      var m = map[[np.x,np.y]];
      var res = yield* m.func.eval(m,np,nd,scope,evaluate,function*(d){
        var r = yield* evaluate(np,d,scope);
        return r;
      },(str)=>{
        var e = {
          type : "error",
          name : m.name + "(" + np.x + "," + np.y + ")",
          error : str
        };
        console.log(JSON.stringify(e));
        e.status.error = "Failed to evaluate";
        delete e.status.success;
        return e;
      });
      yield "end("+position.x+","+position.y+")";
      return res;
    }
    function* display(gen){
      var res;
      if(gen.type){
        res = gen;
      }else{
        res = yield* gen;
      }
      yield "done";
      if(res.type == "function"){
        var scope = Base.clone(res.scope);
        if(scope[[res.position.x,res.position.y]])return "<Failed to display>";
        else{
          var n = String.fromCharCode(65 + e.counter++);
          scope[[res.position.x,res.position.y]] = {
            type : "variable",
            name : n
          };
          var ret = yield* display(evaluate(res.position,res.bridge,scope));
          return "(" + n + " > " + ret + ")";
        }
      }else if(res.type == "variable"){
        return res.name;
      }else if(res.type == "apply"){
        var f = yield* display(res.function);
        var x = yield* display(res.argument);
        return "(" + f + " " + x + ")";
      }else{
        return "<Fail>";
      }
    }
    function* output(gen){
      var str = yield* display(gen);
      e.output = str;
      if(!e.status.error)e.status.success = "Evaluation done";
    }
    if(field.error){
      e.status = {
        error : field.error
      };
      return e;
    }
    e.status = {
      success : "Ready to evaluate"
    };
    e.output = null;
    e.eval = null;
    Object.keys(map).forEach((k)=>{
      if(map[[k]] && map[[k]].name == "Out"){
        for(var i=0;i<8;i++){
          if(map[[k]].neighbor[i]){
            var a = k.split(',').map((s)=>parseInt(s));
            e.counter = 0;
            e.eval = output(evaluate({x:a[0],y:a[1]},i,{}),e);
          }
        }
      }
    });
    return e;
  };
});