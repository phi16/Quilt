Base.write("Eval",()=>{
  var Status = {
    ready : "Ready to execute",
    evaluating : "Executing...",
    done : "Execution done",
    failed : "Execution failed"
  };
  var originalField = {
    pos : {x:5,y:9,d:1},
    array : [],
    size : 11,
    stack : []
  };
  for(var i=0;i<originalField.size;i++){
    originalField.array[i] = [];
    for(var j=0;j<originalField.size;j++){
      originalField.array[i][j] = {
        type : false,
        mark : false
      };
    }
  }
  return (field,map)=>{
    var e = {};
    e.original = {
      field : (i,j,t)=>{
        originalField.array[i][j] = {
          type : t,
          mark : false
        };
      },
      pos : (x,y,d)=>{
        originalField.pos = {x:x,y:y,d:d};
      }
    };
    e.field = Base.clone(originalField);
    e.field.ix = (i,j)=>{
      if(i < 0 || j < 0 || i >= e.field.size || j >= e.field.size){
        return {
          type : true,
          mark : false
        }
      }else{
        return e.field.array[i][j];
      }
    };
    function* evaluate(position,bridge,scope){
      yield "begin("+position.x+","+position.y+")";
      var p = Base.fromDir(bridge);
      var nd = (bridge+4)%8;
      var np = {x:position.x+p.x,y:position.y+p.y};
      var m = map[[np.x,np.y]];
      yield* m.func.eval(m,np,nd,scope,e,function*(p,b,s){
        yield* evaluate(p,b,s);
        yield "return";
      },function*(d){
        yield* evaluate(np,d,scope);
      },(str)=>{
        var err = {
          type : "error"
        };
        e.status.error = "Failed to execute";
        delete e.status.success;
        console.log(str);
        return err;
      });
    }
    function* output(gen){
      e.status.success = Status.evaluating;
      yield* gen;
      if(!e.status.error)e.status.success = Status.done;
    }
    if(field.error){
      e.status = {
        error : field.error
      };
      return e;
    }
    e.status = {
      success : Status.ready
    };
    e.eval = null;
    Object.keys(map).forEach((k)=>{
      if(map[[k]] && map[[k]].name == "Begin"){
        for(var i=0;i<8;i++){
          if(map[[k]].neighbor[i]){
            var a = k.split(',').map((s)=>parseInt(s));
            e.eval = output(evaluate({x:a[0],y:a[1]},i,{}),e);
          }
        }
      }
    });
    return e;
  };
});