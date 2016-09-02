Base.write("Font",()=>{
  var f = {};
  var font = null;
  f.available = ()=>font!=null;
  opentype.load('/Quilt/res/ReemKufi-Regular.ttf',(err,f)=>{
    if(err)console.log(err);
    else font = f;
  });
  f.make = (text,size,x,y)=>{
    if(x==null)x=0;
    if(y==null)y=0;
    if(size==null)size = 1;
    var p = font.getPath(text,x,y,size);
    var ix=0,ax=0,vx;
    for(var i=0;i<p.commands.length;i++){
      if(p.commands[i].x){
        if(p.commands[i].x < ix)ix = p.commands[i].x;
        if(p.commands[i].x > ax)ax = p.commands[i].x;
      }
    }
    vx = (ix+ax)/2;
    f = (ctx,x,y)=>{
      for (var i = 0; i < p.commands.length; i += 1) {
        var cmd = p.commands[i];
        if (cmd.type === 'M') {
          ctx.moveTo(cmd.x-x, cmd.y-y);
        } else if (cmd.type === 'L') {
          ctx.lineTo(cmd.x-x, cmd.y-y);
        } else if (cmd.type === 'C') {
          ctx.bezierCurveTo(cmd.x1-x, cmd.y1-y, cmd.x2-x, cmd.y2-y, cmd.x-x, cmd.y-y);
        } else if (cmd.type === 'Q') {
          ctx.quadraticCurveTo(cmd.x1-x, cmd.y1-y, cmd.x-x, cmd.y-y);
        } else if (cmd.type === 'Z') {
          ctx.closePath();
        }
      }
    };
    return {
      ix : ix,
      vx : vx,
      ax : ax,
      draw : f
    };
  };
  return f;
});
