Base.write("Render",()=>{
  var r = {};
  var cvs = document.getElementById("canvas");
  var ctx = cvs.getContext('2d');
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var timer;
  r.loop = (e)=>{
    if(timer)clearInterval(timer);
    timer = setInterval(e,16);
  };
  var component = (f)=>{
    return {
      fill : Color.con((c)=>{
        ctx.beginPath();
        f();
        ctx.fillStyle = c;
        ctx.closePath();
        ctx.fill();
      }),
      stroke : (w)=>{
        return Color.con((c)=>{
          ctx.beginPath();
          f();
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.stroke();
        });
      },
      clip : (h)=>{
        ctx.save();
        ctx.beginPath();
        f();
        ctx.clip();
        h();
        ctx.restore();
      }
    };
  };
  r.rect = (x,y,w,h)=>{
    var f = ()=>{};
    if(y==null)f = ()=>{
      ctx.rect(-x/2,-x/2,x,x);
    };else if(w==null)f = ()=>{
      ctx.rect(-x/2,-y/2,x,y);
    };else if(h==null)f = ()=>{
      ctx.rect(x-w/2,y-w/2,w,w);
    };else f = ()=>{
      ctx.rect(x,y,w,h);
    }
    return component(f);
  };
  r.circle = (x,y,r)=>{
    var f = ()=>{};
    if(r>0){
      if(y==null)f = ()=>{
        ctx.arc(0,0,r,0,Math.PI*2,1);
      };else f = ()=>{
        ctx.arc(x,y,r,0,Math.PI*2,1);
      }
    }
    return component(f);
  };
  return r;
});