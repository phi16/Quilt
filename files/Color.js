Base.write("Color",()=>{
  var c = {};
  c.con = (f)=>{
    var obj = (r,g,b,a)=>{
      var color;
      if(g == null){
        if(typeof r == "string")c = r;
        else color = "rgba(" + r + "," + r + "," + r + ",1)"
      }else{
        r = Math.floor(r*255);
        g = Math.floor(g*255);
        b = Math.floor(b*255);
        if(a == null)a = 1.0;
        color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      }
      return f(color);
    };
    return obj;
  };
  return c;
});