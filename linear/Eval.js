function reduce(m,w,h){
  var p = 0;
  for(var j=0;j<h;j++){
    var jj = j;
    while(p<w){
      jj = j;
      while(jj<h && m[jj][p]==0)jj++;
      if(jj==h){
        p++;
      }else break;
    }
    if(p==w)return;
    if(jj!=j){
      var ts = m[jj];
      m[jj] = m[j];
      m[j] = ts;
    }
    var t = m[j][p];
    for(var i=p;i<w;i++){
      m[j][i] /= t;
    }
    for(var k=0;k<h;k++){
      if(k==j)continue;
      var u = m[k][p];
      for(var l=p;l<w;l++){
        m[k][l] -= u * m[j][l];
      }
    }
    p++;
  }
}

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
    e.output = ["nya"];
    var variables = {};
    var equations = [];
    Object.keys(map).forEach((k)=>{
      if(map[[k]]){
        if(map[[k]].name == "Produce" || map[[k]].name == "Equality" || map[[k]].name == "Duplicate" || map[[k]].name == "Plus"){
          var a = k.split(',').map((s)=>parseInt(s));
          var g = evaluate({x:a[0],y:a[1]},-1,{});
          equations = equations.concat(g.next().value);
        }
      }
    });
    var varList = [];
    equations.forEach((eq)=>{
      Object.keys(eq).forEach((k)=>{
        variables[k] = true;
      });
    });
    varList = Object.keys(variables);
    var temps = varList.filter((k)=>k.indexOf(",")!=-1);
    var vars = varList.filter((k)=>"ABCDEFGXYZ".indexOf(k)!=-1);
    var ones = varList.filter((k)=>k=="1");
    varList = [].concat(temps).concat(vars).concat(ones);

    console.log("[Preparing...]");
    console.log(varList);
    var matrix = [];
    equations.forEach((eq)=>{
      var row = [];
      varList.forEach((v)=>{
        if(eq[v])row.push(eq[v]);
        else row.push(0);
      });
      matrix.push(row);
    })
    console.log(JSON.stringify(matrix));
    reduce(matrix,varList.length,equations.length);
    console.log(JSON.stringify(matrix));
    var rowN = matrix.length;
    for(;rowN>0;rowN--){
      var t = true;
      for(var j=0;j<varList.length;j++){
        if(Math.abs(matrix[rowN-1][j])>0.0001){
          t = false;
          break;
        }
      }
      if(!t){
        break;
      }
    }
    console.log(rowN);
    var anyN = varList.length - rowN;
    var varPos = [];
    var varIdx = 0;
    var rowP = 0;
    while(varIdx < varList.length){
      while(varIdx < varList.length && (rowP>=matrix.length || Math.abs(matrix[rowP][varIdx])<0.0001)){
        varPos.push(varIdx);
        varIdx++;
      }
      rowP++;
      varIdx++;
    }
    console.log(JSON.stringify(varPos));
    var solutions = [];
    varIdx = 0;
    var solIdx = 0;
    for(var i=0;i<varList.length;i++){
      if(i==varPos[varIdx]){
        var s = [];
        for(var k=0;k<anyN;k++){
          s.push(varIdx==k ? 1 : 0);
        }
        solutions.push(s);
        varIdx++;
      }else{
        var s = [];
        for(var k=0;k<anyN;k++){
          s.push(-matrix[solIdx][varPos[k]]);
        }
        solutions.push(s);
        solIdx++;
      }
    }
    console.log(JSON.stringify(solutions));
    console.log("[Solution]");
    e.output = [];
    varIdx = 0;
    for(var i=0;i<varList.length;i++){
      if(i==varPos[varIdx]){
        varIdx++;
        continue;
      }
      if(i<temps.length)continue;
      if(varList[i]=="1"){
        e.output = ["No solution"];
        break;
      }
      var str = varList[i] + " = ";
      var first = true;
      var poi = 0;
      solutions[i].forEach((s,j)=>{
        if(Math.abs(s)<0.0001)return;
        if(!first){
          if(s > 0)str += " + ";
          else str += " - ";
          s = Math.abs(s);
          if(Math.abs(s-1) < 0.0001)str += varList[varPos[j]];
          else if(varList[varPos[j]] == "1")str += s;
          else str += s + " " + varList[varPos[j]];
        }else{
          if(Math.abs(s-1) < 0.0001)str += varList[varPos[j]];
          else if(Math.abs(s+1) < 0.0001)str += "- " + varList[varPos[j]];
          else if(varList[varPos[j]] == "1")str += s;
          else str += s + " " + varList[varPos[j]];
          first = false;
        }
        poi++;
      });
      if(poi==0){
        str += "0";
      }
      e.output.push(str);
      console.log(str);
    }
    if(e.output.length == 0)e.output = ["Any assignment is a solution"];
    return e;
  };
});