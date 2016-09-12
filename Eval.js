Base.write("Eval",()=>{
  return (field,map)=>{
    var e = {};
    e.current = [0,0,0,0,0,0,0];
    function* evaluate(position,bridge,scope){
      e.current[0]++;
      yield "begin("+position.x+","+position.y+")";
      var p = Base.fromDir(bridge);
      var nd = (bridge+4)%8;
      var np = {x:position.x+p.x,y:position.y+p.y};
      var m = map[[np.x,np.y]];
      var lastStack = 0;
      if(m.name === "Apply"){
        e.current[5]++;
        lastStack = e.current[4];
        e.current[6] = 0;
      }
      if(m.name !== "Id" && m.name !== "Swap" && m.name !== "Duplicate")e.current[4]++,e.current[6]++;
      var res = yield* m.func.eval(m,np,nd,scope,evaluate,function*(d){
        e.current[1]++;
        var r = yield* evaluate(np,d,scope);
        e.current[1]--;
        return r;
      },(str)=>{
        var err = {
          type : "error",
          name : m.name + "(" + np.x + "," + np.y + ")",
          error : str
        };
        console.log(JSON.stringify(err));
        e.status.error = "Failed to evaluate";
        delete e.status.success;
        return err;
      });
      if(m.name !== "Id" && m.name !== "Swap" && m.name !== "Duplicate")e.current[4]--,e.current[6]--;
      if(m.name === "Apply"){
        e.current[5]--;
        e.current[6] = lastStack;
      }
      yield "end("+position.x+","+position.y+")";
      e.current[0]--;
      return res;
    }
    function* display(gen){
      e.current[2]++;
      var res;
      if(gen.type){
        res = gen;
      }else{
        e.current[3]++;
        res = yield* gen;
        e.current[3]--;
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
          e.current[2]--;
          return "(" + n + " > " + ret + ")";
        }
      }else if(res.type == "variable"){
        e.current[2]--;
        return res.name;
      }else if(res.type == "apply"){
        var f = yield* display(res.function);
        var x = yield* display(res.argument);
        e.current[2]--;
        return "(" + f + " " + x + ")";
      }else if(res.type == "number"){
        e.current[2]--;
        return String(res.number);
      }else if(res.type == "boolean"){
        e.current[2]--;
        if(res.boolean)return "True";
        else return "False";
      }else{
        e.current[2]--;
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
            e.current = [0,0,0,0,0,0,0];
            e.eval = output(evaluate({x:a[0],y:a[1]},i,{}),e);
          }
        }
      }
    });
    return e;
  };
});