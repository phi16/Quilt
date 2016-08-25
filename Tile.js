Base.write("Tile",()=>{
  var t = {};
  var tileSpace = 10, titleHeight = 20;

  // [Tree]
  // - Frame{0,tile::View}[tile.index]
  // - Horizontal{1,children::[Tree]}[view, view.index]
  // - Vertical{2,children::[Tree]}[view, view.index]
  var view = UI.create(UI.fullView(tileSpace));
  var confTiles = [];
  var confX = 0, confY = 0;
  var tileTree;

  t.makeTile = (f)=>{
    var titleBar,container,menu;
    var fr = UI.create(UI.inherit(UI.frame(),(v)=>{
      var lev = 0, levM = 0;
      v.onHover = (x,y)=>{
        lev = 1;
        return false;
      };
      v.onLeave = (x,y)=>{
        lev = 0;
        return false;
      };
      v.shadowDepth = ()=>{
        if(levM<lev)levM += 0.2;
        if(levM>lev)levM -= 0.2;
        return tileSpace * (levM+1) / 2;
      };
      v.layout = (w,h)=>{
        container = v.children[0];
        v.rect.w = w;
        v.rect.h = h;
        titleBar.place(0,0,w,titleHeight);
        titleBar.layout(w,titleHeight);
        container.layout(w,h-titleHeight);
        menu.layout(w,h);
        for(var i=3;i<v.children.length;i++){
          v.children[i].layout(w,h);
        }
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
    }));
    container = UI.create((v)=>{
      v.name = "container";
      f(v);
    }).place(0,titleHeight,0,0);
    fr.addChild(container);
    titleBar = UI.create(UI.inherit(UI.frame(),(v)=>{
      v.name = "title";
      v.render = ()=>{
        v.shape.dup((d)=>{
          d.fill(UI.theme.front);
          d.stroke(2)(UI.theme.frame);
        });
      };
      var clicked=false,clickTime;
      v.onPress = (x,y,c)=>{
        if(c())return true;
        var curTime = UI.time();
        if(!clicked || clickTime+10 < curTime){
          clicked = true;
          clickTime = curTime;
        }else if(clicked){
          var ratio = x / v.rect.w;
          if(ratio < 1.0/3){
            t.putTile(t.makeTile(Base.void),v.parent.index,{horizontal:true});
          }else if(ratio < 2.0/3){
            t.putTile(t.makeTile(Base.void),v.parent.index,{vertical:true});
          }else{
            t.putTile(t.makeTile(Base.void),v.parent.index,{horizontal:true});
          }
          clicked = false;
        }
        return true;
      };
    })).place(0,0,0,0);

    var menuDisplay = false;
    var menuWidth = 0, menuHeight = 0;
    menu = UI.create((v)=>{
      v.name = "menu";
      v.shadow = true;
      v.clipped = true;
      v.layout = (w,h)=>{
        v.children.forEach((c)=>{
          if(c.full)c.layout(w,h);
          else c.layout(c.rect.w,c.rect.h);
        });
        if(menuDisplay){
          v.rect.w += (menuWidth - v.rect.w) / 2.0;
          v.rect.h += (menuHeight + titleHeight - v.rect.h) / 2.0;
        }else{
          v.rect.w += (0 - v.rect.w) / 2.0;
          v.rect.h += (titleHeight - v.rect.h) / 2.0;
        }
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
      v.onPress = (x,y,c)=>{
        if(c)c();
        return true;
      };
      v.onRelease = (x,y,c)=>{
        if(c)c();
        return true;
      };
      v.onLeave = (x,y)=>{
        menuDisplay = false;
        return false;
      }
      v.render = (c)=>{
        v.shape.dup((d)=>{
          d.fill(UI.theme.front);
          c();
          d.stroke(2)(UI.theme.frame);
        });
      };
      v.shadowDepth = () => 10;
    }).place(0,0,0,0);
    for(var i=0;i<confTiles.length;i++){
      Base.with(confTiles[i],(conf)=>{
        var btn = UI.create(UI.button(()=>{
          var cont = t.makeTile(conf.tile).children[0];
          UI.dispose(fr.children[0]);
          fr.rewriteAt(0,cont);
          console.log("nya!");
        }));
        btn.addChild(UI.create(UI.image(()=>{
          conf.icon();
        })));
        menu.addChild(btn);
        menu.addChild(UI.create(UI.image(()=>{
          Render.text(conf.name,0.3,0,0).center.fill(UI.theme.def);
        })));
      });
    }
    titleBar.addChild(UI.create(UI.button((v)=>{
      var size = titleHeight * 2;
      menuDisplay = !menuDisplay;
      menu.hovering = true;
      //configure menuSizes
      menuWidth = (confX*1.75+1.25)*size;
      menuHeight = (confY*2.25+0.75)*size;
      menu.children.forEach((v,j)=>{
        var i = Math.floor(j/2);
        var ix = i%confX, iy = Math.floor(i/confX);
        var px = (ix*1.75+0.5)*size, py = (iy*2.25+0.5)*size;
        if(j%2==0){
          v.place(px,py+titleHeight,1.5*size,1.5*size);
          v.children[0].place(0,0,1.5*size,1.5*size);
        }else{
          v.place(px+1.5*size/2,py+titleHeight+size*2,1.5*size,1.5*size);
        }
      });
    })).place(0,0,titleHeight,titleHeight));
    fr.addChild(menu);
    fr.addChild(titleBar);
    return fr;
  };
  function vanishTile(v,ix){
    UI.dispose(v.children[ix]);
    var b = v.removeAt(ix);
    var vx = Base.clone(v.index);
    function obtain(t,i,f){
      if(i == vx.length){
        f(t);
      }else{
        obtain(t.children[vx[i]],i+1,f);
      }
    }
    obtain(tileTree,0,(t)=>{
      t.children.splice(ix,1);
    });
    function traverse(e,f){
      f(e);
      if(e.name!="frame"){
        e.children.forEach((c)=>{
          traverse(c,f);
        });
      }
    }
    v.children.forEach((e,i)=>{
      if(i>=ix){
        traverse(e,(u)=>{
          u.index[vx.length]--;
        });
      }
    });
    if(b){ // v.children.length == 1
      var a = Base.clone(vx);
      var i = vx.length==0 ? 0 : a.pop();
      v.parent.rewriteAt(i,v.children[0]);
      traverse(v.children[0],(u)=>{
        u.index.splice(vx.length,1);
      });
      if(vx.length==0){
        var t = tileTree.children[0];
        t.parent = null;
        tileTree = t;
      }else{
        function getTile(t,i){
          if(i==a.length)return t;
          else return getTile(t.children[a[i]],i+1);
        }
        var tu = getTile(tileTree,0);
        tu.children[i] = tu.children[i].children[0];
        tu.children[i].parent = tu;
      }
    }
  }
  t.putTile = (obj,path,option)=>{
    function indexing(tr,ix){
      if(tr.type==0)return;
      tr.children.forEach((v,i)=>{
        var a = Base.clone(ix);
        a.push(i);
        if(v.type==0)v.tile.index = a;
        else v.view.index = a;
        indexing(v,a);
      });
    }
    function insertTo(tTree,path,idx){
      if(tTree.type==0 || option && (option.vertical && tTree.type!=2 || option.horizontal && tTree.type!=1)){
        var type = tTree.type;
        var old = {type : type, parent : tTree};
        if(type==0)old.tile = tTree.tile;
        else{
          old.children = tTree.children;
          old.children.forEach((c)=>{
            c.parent = old;
          });
          old.view = tTree.view;
        }

        if(option && option.vertical){
          tTree.type = 2;
        }else if(option && option.horizontal){
          tTree.type = 1;
        }else if(old.tile && old.tile.rect.w < old.tile.rect.h){
          tTree.type = 2;
        }else if(old.tile && old.tile.rect.w > old.tile.rect.h){
          tTree.type = 1;
        }
        if(tTree.type==1){
          tTree.view = UI.create(UI.horizontal(tileSpace,true,vanishTile));
        }else{
          tTree.view = UI.create(UI.vertical(tileSpace,true,vanishTile));
        }
        if(tTree.parent==null || tTree.parent.type!=tTree.type){
          if(type==0){
            delete tTree.tile;
          }
          var a0 = Base.clone(path);
          var a1 = Base.clone(path);
          var a2 = Base.clone(path);
          a1.push(0),a2.push(1);
          if(option && option.head){
            if(type==0)old.tile.index = a2;
            else old.view.index = a2;
            obj.index = a1;
            tTree.children = [{
              type : 0,
              parent : tTree,
              tile : obj
            },old];
            tTree.view.addChild(type==0?old.tile:old.view);
            tTree.view.insertAt(-1,obj).noMotion();
          }else if(option && option.tail){
            if(type==0)old.tile.index = a1;
            else old.view.index = a1;
            obj.index = a2;
            tTree.children = [old,{
              type : 0,
              parent : tTree,
              tile : obj
            }];
            tTree.view.addChild(type==0?old.tile:old.view);
            tTree.view.insertAt(tTree.view.children.length-1,obj).noMotion();
          }else{
            if(type==0)old.tile.index = a1;
            else old.view.index = a1;
            obj.index = a2;
            tTree.children = [old,{
              type : 0,
              parent : tTree,
              tile : obj
            }];
            tTree.view.addChild(type==0?old.tile:old.view);
            tTree.view.addChild(obj);
          }
          tTree.view.index = a0;
          if(tTree.parent){
            var par = tTree.parent.view;
            par.rewriteAt(path[idx-1],tTree.view);
          }else{
            view.rewriteAt(0,tTree.view);
          }
        }else{
          delete tTree.view;
          tTree.type = 0;
          if(option && option.head){
            tTree.parent.children.splice(0,0,{
              type : 0,
              parent : tTree.parent,
              tile : obj
            });
            var par = tTree.parent.view;
            par.insertAt(-1,obj)();
          }else if(option && option.tail){
            tTree.parent.children.splice(path[idx-1]+1,0,{
              type : 0,
              parent : tTree.parent,
              tile : obj
            });
            var par = tTree.parent.view;
            par.insertAt(path[idx-1],obj).noMotion();
          }else{
            tTree.parent.children.splice(path[idx-1]+1,0,{
              type : 0,
              parent : tTree.parent,
              tile : obj
            });
            var par = tTree.parent.view;
            par.insertAt(path[idx-1],obj);
          }
        }
      }else{
        var a = Base.clone(tTree.view.index);
        if(option && option.head){
          a.push(0);
          tTree.children.unshift({
            type : 0,
            parent : tTree,
            index : a,
            tile : obj
          });
          tTree.view.insertAt(-1,obj).noMotion();
        }else if(option && option.tail){
          a.push(0);
          tTree.children.push({
            type : 0,
            parent : tTree,
            index : a,
            tile : obj
          });
          tTree.view.insertAt(tTree.view.children.length-1,obj).noMotion();
        }else{
          a.push(tTree.children.length);
          tTree.children.push({
            type : 0,
            parent : tTree,
            index : a,
            tile : obj
          });
          tTree.view.addChild(obj);
        }
      }
      if(tTree.parent)indexing(tTree.parent,tTree.parent.view.index);
      else indexing(tileTree,[]);
    }
    function traverse(tTree,path,idx){
      if(!tTree)return;
      if(tTree.type==0 || idx >= path.length){
        insertTo(tTree,path,idx);
      }else{
        traverse(tTree.children[path[idx]],path,idx+1);
      }
    }
    traverse(tileTree,path,0);
  };
  t.registerTile = (n,t,i)=>{
    confTiles.push({
      name : n,
      tile : t,
      icon : i
    });
    confX = Math.ceil(Math.sqrt(confTiles.length*Math.PHI));
    confY = Math.ceil(confTiles.length / confX);
  };

  function makeTree(t,p,v,a){
    if(t.type==0){
      t.tile.index = Base.clone(a);
      v.addChild(t.tile);
      t.parent = p;
    }else{
      var s;
      if(t.type==1)s = UI.create(UI.horizontal(tileSpace,true,vanishTile));
      else s = UI.create(UI.vertical(tileSpace,true,vanishTile));
      t.children.forEach((c,i)=>{
        a.push(i);
        makeTree(c,t,s,a);
        a.pop();
      });
      v.addChild(s);
      t.view = s;
      t.view.index = Base.clone(a);
      t.parent = p;
    }
  }
  var borderView = UI.create((v)=>{
    v.name = "border";
    v.onPress = (x,y)=>{
      var tile;
      if(x < tileSpace){
        t.putTile(tile = t.makeTile(Base.void),[],{horizontal:true,head:true});
        tile.parent.grab(0);
      }else if(x > v.rect.w - tileSpace){
        t.putTile(tile = t.makeTile(Base.void),[],{horizontal:true,tail:true});
        tile.parent.grab(tileTree.children.length-2);
      }else if(y < tileSpace){
        t.putTile(tile = t.makeTile(Base.void),[],{vertical:true,head:true});
        tile.parent.grab(0);
      }else if(y > v.rect.h - tileSpace){
        t.putTile(tile = t.makeTile(Base.void),[],{vertical:true,tail:true});
        tile.parent.grab(tileTree.children.length-2);
      }
      if(tile){
        return true;
      }else{
        return false;
      }
    };
    v.onHover = (x,y)=>{
      if(x < tileSpace){
        Mouse.cursor(Mouse.Cur.hResize);
        return true;
      }else if(x > v.rect.w - tileSpace){
        Mouse.cursor(Mouse.Cur.hResize);
        return true;
      }else if(y < tileSpace){
        Mouse.cursor(Mouse.Cur.vResize);
        return true;
      }else if(y > v.rect.h - tileSpace){
        Mouse.cursor(Mouse.Cur.vResize);
        return true;
      }else{
        Mouse.cursor(Mouse.Cur.auto);
        return false;
      }
    };
  });
  t.initTile = ()=>{
    tileTree = {
      type : 0,
      tile : t.makeTile(Base.void)
    };
    UI.root.addChild(view);
    UI.root.addChild(borderView);
    makeTree(tileTree,null,view,[]);
  };

  t.tt = ()=>tileTree;

  return t;
});