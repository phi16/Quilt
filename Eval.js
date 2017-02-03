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
      e.ready = false;
      return e;
    }
    var levelMap = {}, levelMap2 = {};
    e.getLevel = (x,y,b)=>{
      if(b >= 4){
        var p = Base.fromDir(b);
        x += p.x;
        y += p.y;
        b -= 4;
      }
      if(levelMap[[x,y,b]]===undefined){
        levelMap[[x,y,b]] = -1;
      }
      return levelMap[[x,y,b]];
    };
    e.setLevel = (pp,b)=>(v)=>{
      var x = pp.x, y = pp.y;
      if(b >= 4){
        var p = Base.fromDir(b);
        x += p.x;
        y += p.y;
        b -= 4;
      }
      levelMap2[[x,y,b]] = v;
    };
    var clock = 0;
    e.clock = ()=>{
      return clock >= 10;
    };
    var varLevels = {};
    e.getVar = (n)=>{
      if(varLevels[n]===undefined)return -1;
      else return varLevels[n];
    };
    e.setVar = (n,l)=>{
      varLevels[n] = l;
    };
    e.exec = ()=>{
      clock++;
      if(clock >= 20)clock = 0;
      levelMap2 = Base.clone(levelMap);
      Object.keys(map).forEach((k)=>{
        if(map[[k]]){
          if(map[[k]].name == "Id" || map[[k]].name == "Duplicate" || map[[k]].name == "Discard" || map[[k]].name == "Swap"){
            return;
          }
          var a = k.split(',').map((s)=>parseInt(s));
          var g = evaluate({x:a[0],y:a[1]},-1,{});
          while(!g.next().done);
        }
      });
      levelMap = Base.clone(levelMap2);
      console.log(JSON.stringify(levelMap));
    };
    e.output = ["Ready to execute"];
    e.ready = true;
    e.draw = ()=>{
      Object.keys(map).forEach((k)=>{
        if(map[[k]]){
          var a = k.split(',').map((s)=>parseInt(s));
          for(var i=0;i<8;i++){
            if(map[[k]].neighbor[i] && map[[k]].neighbor[i].type){
              var l = e.getLevel(a[0],a[1],i);
              var p = Base.fromDir(i);
              var col = l==-1 ? Color(0.9,0.5,0) : l==0 ? UI.theme.notify : UI.theme.def;
              Render.translate(a[0],a[1],()=>{
                Render.line(0,0,p.x,p.y).stroke(0.2)(col);
                Render.circle(0,0,0.1).fill(col);
                Render.circle(p.x,p.y,0.1).fill(col);
              });
            }
          }
        }
      });
    };
    return e;
  };
});
