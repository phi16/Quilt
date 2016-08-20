Base.write("Listener",()=>{
  return ()=>{
    var l = {};
    var listeners = [];
    l.listen = (h)=>{
      listeners.push({handler:h});
    };
    l.on = (n,h)=>{
      listeners.push({tag:n,handler:h});
    };
    l.push = (n,d)=>{
      for(var i=0;i<listeners.length;i++){
        var u = listeners[i];
        if(!u.tag || u.tag===n){
          var r = u.handler(n,d);
          if(r==true){
            listeners.splice(i,1);
            i--;
          }
        }
      }
    };
    return l;
  };
});