Base.write("Render",()=>{
  var r = {};

  var cvs = document.getElementById("canvas");
  var ctx = cvs.getContext('2d');
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var component = (f,r)=>{
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
      },
      raw : f,
      on : (x,y)=>{
        return r(x,y);
      }
    }
    c.dup = (g)=>{
      g(c);
    };
    return c;
  };
  r.line = (x1,y1,x2,y2)=>{
    return component(()=>{
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
    },(p,q)=>{
      return false; 
    });
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
    return component(f,Base.in(x,y,w,h));
  };
  r.circle = (x,y,r)=>{
    var f = ()=>{};
    if(y==null)f = ()=>{
      if(x>0)ctx.arc(0,0,x,0,Math.PI*2,1);
    };else f = ()=>{
      if(r>0)ctx.arc(x,y,r,0,Math.PI*2,1);
    }
    return component(f,(p,q)=>{
      return (p-x)*(p-x)+(q-y)*(q-y) <= r*r;
    });
  };
  r.polygon = (a)=>{
    if(a.length<2)return component(()=>{},()=>false);
    return component(()=>{
      ctx.moveTo(a[0],a[1]);
      for(var i=0;i<a.length;i+=2){
        ctx.lineTo(a[i],a[i+1]);
      }
    },(x,y)=>{
      var b = false;
      var x1 = 0;
      var y1 = 0;
      var x2 = a[0]-x;
      var y2 = a[1]-y;
      for(var i=0;i<a.length-2;i+=2){
        x1 = x2;
        y1 = y2;
        x2 = a[i+2]-x;
        y2 = a[i+3]-y;
        var r = -y2/y1;
        var rx;
        if(Math.abs(y1) < 0.0001){
          rx = x1;
        }else if(Math.abs(y2) < 0.0001){
          rx = x2;
        }else if(0 <= r){
          rx = (x1*r + x2*1)/(r+1);
        }
        if(rx >= 0)b = !b;
      }
      return b;
    });
  };
  r.arc = (x,y,r,sa,fa)=>{
    return component(()=>{
      ctx.arc(x,y,r,-sa,-fa,1);
    });
  };
  r.bezier = (a)=>{
    if(a.length<8)return component(()=>{},()=>false);
    return component(()=>{
      ctx.moveTo(a[0],a[1]);
      for(var i=2;i<a.length;i+=6){
        ctx.bezierCurveTo(a[i+0],a[i+1],a[i+2],a[i+3],a[i+4],a[i+5]);
      }
    },(x,y)=>false);
  };
  r.cycle = (a)=>{
    return component(()=>{
      ctx.moveTo(a[0],a[1]);
      for(var i=0;i<a.length;i+=2){
        ctx.lineTo(a[i],a[i+1]);
      }
      ctx.lineTo(a[0],a[1]);
      ctx.closePath();
    },(x,y)=>{
      var b = false;
      var x1 = 0;
      var y1 = 0;
      var x2 = a[0]-x;
      var y2 = a[1]-y;
      for(var i=0;i<a.length-2;i+=2){
        x1 = x2;
        y1 = y2;
        x2 = a[i+2]-x;
        y2 = a[i+3]-y;
        var r = -y2/y1;
        var rx;
        if(Math.abs(y1) < 0.0001){
          rx = x1;
        }else if(Math.abs(y2) < 0.0001){
          rx = x2;
        }else if(0 <= r){
          rx = (x1*r + x2*1)/(r+1);
        }
        if(rx >= 0)b = !b;
      }
      return b;
    });
  };
  r.text = (text,s,x,y)=>{
    if(!Font.available()){
      var stub = component(Base.void,(x,y)=>false);
      return {
        left : stub,
        center : stub,
        right : stub,
        forceLeft : stub,
        forceCenter : stub,
        forceRight : stub,
        size : 0,
      };
    }else{
      var p = Font.make(text,s,0,0);
      var ix = p.ix;
      var vx = p.vx;
      var ax = p.ax;
      function kon(dx){
        return component(()=>{
          Render.translate(x,y,()=>{
            p.draw(ctx,dx,0);
          })
        },(x,y)=>false);
      }
      return {
        left : kon(0),
        center : kon(vx),
        right : kon(ax),
        forceLeft : kon(ix),
        forceCenter : kon((ax+ix)/2),
        forceRight : kon(ax),
        size : ax-ix
      };
    }
  };

  r.meld = (xs)=>{
    return component(()=>{
      xs.forEach((x)=>{
        x.raw();
      });
    },(x,y)=>{
      for(var i=0;i<xs.length;i++){
        if(xs.on(x,y))return true;
      }
      return false;
    });
  };
  r.translate = (x,y,f)=>{
    ctx.save();
    ctx.translate(x,y);
    f();
    ctx.restore();
  };
  r.rotate = (a,f)=>{
    ctx.save();
    ctx.rotate(a);
    f();
    ctx.restore();
  };
  r.scale = (x,y,f)=>{
    ctx.save();
    ctx.scale(x,y);
    f();
    ctx.restore();
  };
  r.shadowed = (h,c,f)=>{
    if(r.enableShadow){
      ctx.save();
      Color.con((ce)=>{
        ctx.shadowColor = ce;
        ctx.shadowBlur = h;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = h/2;
      })(c);
      f();
      ctx.restore();
    }else{
      f();
    }
  };

  r.enableShadow = true;
  var timer = null;
  var flipCount = 0;
  var draws = [];
  r.add = (d)=>{
    draws.push(d);
  };
  function render(){
    var t = new Date();
    if(timer){
      if(r.enableShadow){
        if(t-timer > 60){
          flipCount++;
          if(flipCount > 100){
            r.enableShadow = false;
            flipCount = 0;
          }
        }
      }
    }
    timer = t;
    for(var i=0;i<draws.length;i++)draws[i]();
    requestAnimationFrame(render);
  }
  render();

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