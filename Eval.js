Base.write("Eval",()=>{
  return (field,map)=>{
    var e = {};
    if(field.error){
      e.status = {
        error : field.error
      };
    }else{
      e.status = {
        success : "Ready to evaluate"
      };
    }
    return e;
  };
});