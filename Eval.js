Base.write("Eval",()=>{
  return (field,map)=>{
    var e = {};
    e.done = false;
    e.end = ()=>{
      e.done = true;
      e.next.r = 0;
    };
    if(field.error){
      e.output = "Error : " + field.error;
      return e;
    }
    e.output = "Sonouchi tsukuru nya";
    e.eval = null;
    return e;
  };
});