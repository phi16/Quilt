Base.write("Eval",()=>{
  var Status = {
    ready : "Ready to execute",
    evaluating : "Executing...",
    done : "Execution done",
    failed : "Execution failed"
  };
  var originalField = {
    pos : {x:5,y:9,d:1},
    goal : {x:5,y:5},
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
    var headColor = 0;
    var headColorMot = 0;
    e.nextHead = (x,y,b)=>{
      e.position.x = e.next.x;
      e.position.y = e.next.y;
      var d = b==-1 ? {x:0,y:0} : Base.fromDir(b);
      e.next.x = x+d.x;
      e.next.y = y+d.y;
      e.next.r = 1;
    };
    e.jmp = (x,y,b)=>{
      headColor = 0;
      headColorMot = 1;
      e.position.r = 0;
      e.stack.unshift({x:x,y:y,b:b});
    };
    e.preret = ()=>{
      e.next.r = 0;
      headColor = 1;
      headColorMot = 0;
    };
    e.ret = ()=>{
      var b = e.stack[0].b;
      var d = b==-1 ? {x:0,y:0} : Base.fromDir(b);
      e.position.x = e.next.x = e.stack[0].x;
      e.position.y = e.next.y = e.stack[0].y;
      e.position.r = e.next.r = 1;
      e.stack.shift();
      headColor = 0;
      headColorMot = 0;
    };
    e.original = {
      field : (i,j,t)=>{
        originalField.array[i][j] = {
          type : t,
          mark : false
        };
        e.field.array[i][j] = {
          type : t,
          mark : false
        };
      },
      pos : (x,y,d)=>{
        originalField.pos = {x:x,y:y,d:d};
        e.field.pos = {x:x,y:y,d:d};
      },
      goal : (x,y)=>{
        originalField.goal = {x:x,y:y};
        e.field.goal = {x:x,y:y};
      },
      stack : {
        push : (u)=>{
          originalField.stack.unshift(u);
          e.field.stack.unshift(u);
        },
        pop : ()=>{
          originalField.stack.pop();
          e.field.stack.pop();
        },
        remove : (i)=>{
          originalField.stack.splice(i,1);
          e.field.stack.splice(i,1);
        },
        flip : (i)=>{
          originalField.stack[i] = 1-originalField.stack[i];
          e.field.stack[i] = 1-e.field.stack[i];
        }
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
      if(e.done)return;
      e.nextHead(position.x,position.y,bridge);
      yield "begin("+position.x+","+position.y+")";
      var p = Base.fromDir(bridge);
      var nd = (bridge+4)%8;
      var np = {x:position.x+p.x,y:position.y+p.y};
      var m = map[[np.x,np.y]];
      yield* m.func.eval(m,np,nd,scope,e,function*(p,b,s){
        e.jmp(p.x,p.y,b);
        yield* evaluate(p,b,s);
        e.preret();
        yield "return";
        e.ret();
      },function*(d){
        yield* evaluate(np,d,scope);
      },(str)=>{
        var err = {
          type : "error"
        };
        e.status.error = "Failed to execute";
        e.status.reason = str;
        delete e.status.success;
        return err;
      });
    }
    e.done = false;
    e.end = ()=>{
      e.done = true;
      e.next.r = 0;
    };
    function* output(gen){
      e.status.success = Status.evaluating;
      yield* gen;
      if(!e.status.error){
        if(!e.done){
          e.status.error = Status.failed;
          e.status.reason = "call stack is empty";
        }else e.status.success = Status.done;
      }
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
    e.eval = null;
    Object.keys(map).forEach((k)=>{
      if(map[[k]] && map[[k]].name == "Begin"){
        for(var i=0;i<8;i++){
          if(map[[k]].neighbor[i]){
            var a = k.split(',').map((s)=>parseInt(s));
            e.eval = output(evaluate({x:a[0],y:a[1]},i,{}),e);
            e.position = {x:a[0],y:a[1],r:0};
            e.next = {x:a[0],y:a[1],r:1};
            e.stack = [];
          }
        }
      }
    });
    e.draw = ()=>{
      if(e.status.success === Status.ready)return;
      e.position.x += (e.next.x - e.position.x) / 4;
      e.position.y += (e.next.y - e.position.y) / 4;
      e.position.r += (e.next.r - e.position.r) / 4;
      headColorMot += (headColor - headColorMot) / 8;
      if(e.stack.length>0){
        var shCol = Color.mix(UI.theme.select,UI.theme.in,headColorMot);
        var cuCol = Color.mix(UI.theme.execWait,UI.theme.exec,headColorMot);
        Render.shadowed(8,shCol,()=>{
          var p = e.stack[0];
          Render.circle(p.x,p.y,0.3).fill(cuCol,0.3);
          Render.circle(p.x,p.y,0.3).stroke(0.03)(cuCol);
        });
      }
      Render.shadowed(8,UI.theme.select,()=>{
        e.stack.forEach((p,i)=>{
          if(i==0)return;
          Render.circle(p.x,p.y,0.3).fill(UI.theme.execWait,0.3);
          Render.circle(p.x,p.y,0.3).stroke(0.03)(UI.theme.execWait);
        });
      });
      Render.shadowed(8,UI.theme.in,()=>{
        Render.circle(e.position.x,e.position.y,0.3*e.position.r).fill(UI.theme.exec,0.3);
        Render.circle(e.position.x,e.position.y,0.3*e.position.r).stroke(0.03)(UI.theme.exec);
      });
    }
    return e;
  };
});