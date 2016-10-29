Base.write("Color",()=>{
  var c = (r,g,b,a)=>()=>{
    var ai = a == null ? 1.0 : a;
    return {r:r,g:g,b:b,a:ai};
  };
  c.con = (f)=>{
    var obj = (r,g,b,a)=>{
      var color;
      if(g == null){
        if(typeof r == "string")color = r;
        else if(typeof r == "function"){
          var o = r();
          var ri = Math.floor(o.r*255);
          var gi = Math.floor(o.g*255);
          var bi = Math.floor(o.b*255);
          color = "rgba(" + ri + "," + gi + "," + bi+ "," + o.a + ")";
        }else color = "rgba(" + r + "," + r + "," + r + ",1)"
      }else{
        if(typeof r == "function"){
          var o = r();
          var ri = Math.floor(o.r*255);
          var gi = Math.floor(o.g*255);
          var bi = Math.floor(o.b*255);
          color = "rgba(" + ri + "," + gi + "," + bi + "," + o.a * g + ")";
        }else{
          r = Math.floor(r*255);
          g = Math.floor(g*255);
          b = Math.floor(b*255);
          if(a == null)a = 1.0;
          color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
      }
      return f(color);
    };
    return obj;
  };
  c.mix = (f,g,x)=>()=>{
    var of = f(), og = g();
    return {
      r:of.r*(1-x)+og.r*x,
      g:of.g*(1-x)+og.g*x,
      b:of.b*(1-x)+og.b*x,
      a:of.a*(1-x)+og.a*x};
  };
  return c;
});