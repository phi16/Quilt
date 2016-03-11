Base.write("Render",()=>{
  var r = {};

  var cvs = document.getElementById("canvas");
  var ctx = cvs.getContext('2d');
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var component = (f)=>{
    var c = {
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
    }
    c.dup = (g)=>{
      g(c);
    };
    return c;
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
    if(y==null)f = ()=>{
      if(x>0)ctx.arc(0,0,x,0,Math.PI*2,1);
    };else f = ()=>{
      if(r>0)ctx.arc(x,y,r,0,Math.PI*2,1);
    }
    return component(f);
  };
  r.polygon = (a)=>{
    if(a.length<2)return component(()=>{});
    return component(()=>{
      ctx.moveTo(a[0],a[1]);
      for(var i=0;i<a.length;i+=2){
        ctx.lineTo(a[i],a[i+1]);
      }
    });
  };
  r.translate = (x,y,f)=>{
    ctx.save();
    ctx.translate(x,y);
    f();
    ctx.restore();
  }
  r.scale = (s,f)=>{
    ctx.save();
    ctx.scale(s,s);
    f();
    ctx.restore();
  };

  var timer;
  var draws = [];
  r.add = (d)=>{
    draws.push(d);
  };
  setInterval(()=>{
    for(var i=0;i<draws.length;i++)draws[i]();
  },16);

  r.width = 0;
  r.height = 0;
  function resize(){
    r.width = document.getElementById("canvas").width = document.getElementById("container").clientWidth;
    r.height = document.getElementById("canvas").height = document.getElementById("container").clientHeight;
  }
  resize();
  window.onresize = resize;

  return r;
});