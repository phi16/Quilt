Base.write("Eval",()=>{
  return (field,map)=>{
    var e = {};
    function* evaluate(position,bridge,scope){
      var m = map[[position.x,position.y]];
      var res = yield* m.func.eval(m,position,bridge,scope,e,function*(p,b,s){
        var r = yield* evaluate(p,b,s);
        return r;
      },function*(d){
        var p = Base.fromDir(d);
        var np = {x:position.x+p.x,y:position.y+p.y};
        var r = yield* evaluate(np,(d+4)%8,scope);
        return r;
      },(str)=>{
        e.output = [m.name + "(" + position.x + "," + position.y + ") : " + str];
        return err;
      });
      return res;
    }
    if(field.error){
      e.output = ["Error : " + field.error];
      return e;
    }
    e.output = ["Ready to execute"];
    return e;
  };
});
