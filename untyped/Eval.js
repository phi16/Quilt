Base.write("Eval",()=>{
  var Status = {
    ready : "Ready to evaluate",
    evaluating : "Evaluating...",
    done : "Evaluation done",
    failed : "Evaluation failed"
  };
  return (field,map)=>{
    var e = {};
    e.current = [0,0,0,0,0,0,0];
    var lastPush = true;
    var beforePush = true;
    var headColor = 0;
    var tailColor = 0;
    var pushColor = 0;
    e.nextHead = (x,y,b)=>{
      e.position.x = e.next.x;
      e.position.y = e.next.y;
      var d = b==-1 ? {x:0,y:0} : Base.fromDir(b);
      e.next.x = x+d.x;
      e.next.y = y+d.y;
      e.next.r = 1;
    };
    e.directHead = (x,y,b)=>{
      var d = b==-1 ? {x:0,y:0} : Base.fromDir(b);
      e.position.x = e.next.x = x+d.x;
      e.position.y = e.next.y = y+d.y;
    };
    e.push = (x,y,b)=>{
      e.stack[0].unshift({x:x,y:y,b:b});
      e.nextHead(x,y,b);
      lastPush = true;
    };
    e.prepop = ()=>{
      if(e.stack[0] && e.stack[0][0]){
        e.nextHead(e.stack[0][0].x,e.stack[0][0].y,-1);
        lastPush = false;
      }
    };
    e.pop = ()=>{
      e.stack[0].shift();
      if(e.stack[0].length==0){
        e.next.r = 0.5;
      }
    };
    e.jmp = (x,y)=>{
      e.directHead(x,y,-1);
      e.position.r = 0;
      e.next.r = 1;
      e.stack.unshift([]);
      tailColor = 1;
      beforePush = lastPush;
    };
    e.ret = ()=>{
      if(e.stack[1] && e.stack[1][0]){
        e.directHead(e.stack[1][0].x,e.stack[1][0].y,e.stack[1][0].b);
        lastPush = false;
        headColor = 1;
      }
      e.stack.shift();
    };
    e.showScope = (s)=>{
      var v = [
        s.type,
        s.position.x,
        s.position.y,
        s.bridge
      ].toString();
      v += "(";
      for(var i in s.scope){
        v += i;
        v += e.showScope(s.scope[i]);
        v += ",";
      }
      v += ")";
      return v;
    };
    e.cache = {};
    function* evaluate(position,bridge,scope){
      e.push(position.x,position.y,bridge);
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
      var res = yield* m.func.eval(m,np,nd,scope,e,function*(p,b,s){
        e.jmp(p.x,p.y);
        var r = yield* evaluate(p,b,s);
        yield "return";
        e.ret();
        return r;
      },function*(d){
        e.current[1]++;
        var r = yield* evaluate(np,d,scope);
        e.current[1]--;
        return r;
      },(str)=>{
        var err = {
          type : "error"
        };
        e.status.error = "Failed to evaluate";
        e.output = m.name + "(" + np.x + "," + np.y + ") : " + str;
        delete e.status.success;
        return err;
      });
      if(m.name !== "Id" && m.name !== "Swap" && m.name !== "Duplicate")e.current[4]--,e.current[6]--;
      if(m.name === "Apply"){
        e.current[5]--;
        e.current[6] = lastStack;
      }
      e.prepop();
      yield "end("+position.x+","+position.y+")";
      e.pop();
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
        if(scope[[res.position.x,res.position.y]]){
          e.status.error = "Failed to display";
          delete e.status.success;
          return "<Fail>";
        }else{
          var n = String.fromCharCode(65 + e.counter++);
          scope[[res.position.x,res.position.y]] = {
            type : "variable",
            name : n
          };
          e.directHead(res.position.x,res.position.y,-1);
          e.position.r = 0;
          e.next.r = 1;
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
        e.status.error = "Failed to display";
        delete e.status.success;
        return "<Fail>";
      }
    }
    e.done = false;
    function* output(gen){
      e.status.success = Status.evaluating;
      var str = yield* display(gen);
      e.output = str;
      if(!e.status.error)e.status.success = Status.done;
      e.done = true;
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
            e.position = {x:a[0],y:a[1],r:0};
            e.next = {x:a[0],y:a[1],r:1};
            e.stack = [[]];
          }
        }
      }
    });
    e.draw = ()=>{
      if(e.status.success !== Status.evaluating)return;
      e.position.x += (e.next.x - e.position.x) / 2;
      e.position.y += (e.next.y - e.position.y) / 2;
      e.position.r += (e.next.r - e.position.r) / 2;
      headColor += (0 - headColor) / 4;
      tailColor += (0 - tailColor) / 4;
      pushColor += ((lastPush?1:0) - pushColor) / 4;
      for(var ix=e.stack.length-1;ix>-1;ix--){
        var s = e.stack[ix];
        var colMain = ix!=0 ? UI.theme.evalWait : Color.mix(UI.theme.evalOut,UI.theme.evalIn,pushColor);
        var colSub = ix==0 ? UI.theme.evalWait : beforePush ? UI.theme.evalIn : UI.theme.evalOut;
        var ratio = ix==0 ? headColor : ix==1 ? tailColor : 0;
        var col = Color.mix(colMain,colSub,ratio);
        var path = [];
        if(ix==0){
          path.push(e.position.x,e.position.y);
        }
        s.forEach((t,i)=>{
          var d = Base.fromDir(t.b);
          if(ix!=0 || i!=0)path.push(t.x+d.x,t.y+d.y);
          if(i==s.length-1)path.push(t.x,t.y);
        });
        for(var i=0;i<path.length;i+=2){
          var m = ix==0&&i==0 ? false : map[[path[i],path[i+1]]];
          var c = ix==0&&i==path.length-2&&lastPush;
          var r = !m || c ? e.position.r : 1;
          if(!m || m.name!=="Id" && m.name!=="Duplicate" && m.name!=="Swap"){
            Render.circle(path[i],path[i+1],0.3*r).fill(col,0.3);
            Render.circle(path[i],path[i+1],0.3*r).stroke(0.03)(col);
          }
        }
        for(var i=0;i<path.length;i+=2){
          Render.circle(path[i],path[i+1],0.1).fill(col);
          if(i!=0){
            Render.line(path[i-2],path[i-1],path[i],path[i+1]).stroke(0.2)(col);
          }
        }
      };
    };
    return e;
  };
});