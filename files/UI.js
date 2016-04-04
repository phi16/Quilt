Base.write("UI",()=>{
  var u = {};
  u.theme = {
    bg : Color(1,1,0.9),
    frame : Color(0.6,0.3,0),
    base : Color(1,0.97,0.8),
    shadow : Color(1,0.5,0,0.5)
  };
  var space = 5;
  /**** View
  - shadow :: Bool
  - onHover :: (Float,Float) -> Bool
  - onPress :: (Float,Float) -> Bool
  - onRelease :: (Float,Float) -> Bool
  - onClick :: (Float,Float) -> Bool
  - render :: () -> ()
  - layout :: (Float,Float) -> ()
  - rect :: (Float,Float,Float,Float)
  - parent :: View
  - children :: [View]
  - addChild :: View -> ()
  ****/
  function createView(f){
    var v = {};
    f(v);
    var defaultLayout = (w,h)=>{
      v.rect.w = w;
      v.rect.h = h;
    };
    v.clipped = v.clipped==null ? false : v.clipped;
    v.shadow = v.shadow==null ? false : v.shadow;
    v.onHover = v.onHover==null ? Base.const(false) : v.onHover;
    v.onPress = v.onPress==null ? Base.const(false) : v.onPress;
    v.onRelease = v.onRelease==null ? Base.const(false) : v.onRelease;
    v.onClick = v.onClick==null ? Base.const(false) : v.onClick;
    v.render = v.render==null ? Base.void : v.render;
    v.layout = v.layout==null ? defaultLayout : v.layout;
    v.rect = v.rect==null ? {x:0,y:0,w:0,h:0} : v.rect;
    v.parent = null;
    v.children = v.children==null ? [] : v.children;
    v.addChild = (w)=>{
      w.parent = v;
      v.children.push(w);
    };
    v.place = (x,y,w,h)=>{
      v.rect = {x:x,y:y,w:w,h:h};
      return v;
    };
    return v;
  };
  u.button = (run)=>{
    return createView((v)=>{
      v.shadow = true;
      v.clipped = true;
      var state = 0; // Default, Hover, Press, Untouch
      v.onHover = (x,y)=>{};
      v.onPress = (x,y)=>{};
      v.onRelease = (x,y)=>{};
      v.onClick = (x,y)=>{
        run();
      };
      v.render = ()=>{
        Render.rect(0,0,v.rect.w,v.rect.h).dup((d)=>{
          d.fill(u.theme.base);
          d.stroke(2)(u.theme.frame);
        });
      };
    });
  };

  function layoutView(v,w,h){
    v.layout(w,h);
  }
  function renderView(v){
    if(v.shadow){
      Render.rect(-space/2,space,v.rect.w+space,v.rect.h).fill(u.theme.shadow);
    }
    v.render();
    function f(){
      v.children.forEach(function(w){
        Render.translate(w.rect.x,w.rect.y,()=>{
          renderView(w);
        });
      });
    }
    if(v.clipped){
      Render.rect(0,0,v.rect.w,v.rect.h).clip(()=>{
        f();
      });
    }else{
      f();
    }
  }

  var rootView = createView(Base.void,null);
  rootView.addChild(u.button().place(100,100,100,100));
  Render.add(()=>{
    Render.rect(0,0,Render.width,Render.height).fill(u.theme.bg);
    layoutView(rootView,Render.width,Render.height);
    renderView(rootView);
  });
  return u;
});