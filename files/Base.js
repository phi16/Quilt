var Base = (()=>{
  var b = {};
  var a = [];
  var i = 0;
  b.write = (n,c)=>{
    a.push({n:n,c:c});
    i++;
    return a[i-1];
  };
  window.onload = ()=>{
    for(var j=0;j<i;j++){
      window[a[j].n] = a[j].c();
    }
  };
  return b;
})();