Base.write("Tile",()=>{
  var t = {};
  var tileSpace = 10;

  // [Tree]
  // - Frame{0,tile::View}[tile.index]
  // - Horizontal{1,children::[Tree]}[view, view.index]
  // - Vertical{2,children::[Tree]}[view, view.index]
  var view = UI.create(UI.fullView(tileSpace));
  var confTiles = [];
  var confX = 0, confY = 0;

  t.makeTile = (f)=>{
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
    }));
    fr.addChild(UI.create((v)=>{
      v.name = "container";
      f(v);
    }));
    var menuDisplay = false;
    var menuWidth = 0, menuHeight = 0;
    var menu = UI.create((v)=>{
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
          v.rect.h += (menuHeight - v.rect.h) / 2.0;
        }else{
          v.rect.w += (0 - v.rect.w) / 2.0;
          v.rect.h += (0 - v.rect.h) / 2.0;
        }
        v.rect.x = w-v.rect.w;
        v.rect.y = 0;
        v.shape = Render.rect(0,0,v.rect.w,v.rect.h);
      };
      v.onPress = (x,y,c)=>{
        c();
        return true;
      };
      v.onRelease = (x,y,c)=>{
        c();
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
    });
    for(var i=0;i<confTiles.length;i++){
      Base.with(confTiles[i],(conf)=>{
        var btn = UI.create(UI.button(()=>{
          fr.rewriteAt(0,t.makeTile(conf.tile).children[0]);
          console.log("nya!");
        }));
        btn.addChild(UI.create(UI.image(()=>{
          conf.icon();
        })));
        menu.addChild(btn);
      });
    }
    var menuButton = UI.create(UI.inherit(UI.button((v)=>{
      var size = v.size;
      menuDisplay = !menuDisplay;
      menu.hovering = true;
      //configure menuSizes
      menuWidth = (confX*1.75+1.25)*size;
      menuHeight = (confY*1.75+0.75)*size;
      menu.children.forEach((v,i)=>{
        var ix = i%confX, iy = Math.floor(i/confX);
        var px = (ix*1.75+0.5)*size, py = (iy*1.75+0.5)*size;
        v.place(px,py,1.5*size,1.5*size);
        v.children[0].place(0,0,1.5*size,1.5*size);
      });
    }),(v)=>{
      v.layout = UI.defaultLayout(v,(w,h)=>{
        var size = Math.min(40,Math.min(w,h)/3);
        v.rect.w = v.rect.h = size;
        v.rect.x = w-v.rect.w;
        v.rect.y = 0;
        v.shape = Render.polygon([0,0,size,0,size,size,0,0]);
        v.size = size;
      });
    }));
    menu.full = true;
    menuButton.full = true;
    fr.addChild(menu);
    fr.addChild(menuButton);
    return fr;
  };
  function vanishTile(v,ix){
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
      }
    }
  }
  t.putTile = (obj,path)=>{
    function traverse(tTree,path,idx){
      if(!tTree)return;
      if(tTree.type==0 || idx >= path.length){
        if(tTree.type==0){
          var tile = tTree.tile;
          if(tile.rect.w < tile.rect.h){
            tTree.type = 2;
            tTree.view = UI.vertical(tileSpace,true,vanishTile);
          }else{
            tTree.type = 1;
            tTree.view = UI.horizontal(tileSpace,true,vanishTile);
          }
          
          if(tTree.parent==null || tTree.parent.type!=tTree.type){
            delete tTree.tile;
            var a0 = Base.clone(tile.index);
            var a1 = Base.clone(tile.index);
            var a2 = Base.clone(tile.index);
            a1.push(0),a2.push(1);
            tile.index = a1;
            obj.index = a2;
            tTree.children = [{
              type : 0,
              parent : tTree,
              tile : tile
            },{
              type : 0,
              parent : tTree,
              tile : obj
            }];
            tTree.view.addChild(tile);
            tTree.view.addChild(obj);
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
            tTree.parent.children.splice(path[idx-1]+1,0,{
              type : 0,
              parent : tTree.parent,
              tile : obj
            });
            var par = tTree.parent.view;
            par.insertAt(path[idx-1],obj);
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
            indexing(tTree.parent,tTree.parent.view.index);
          }
        }else{
          var a = Base.clone(tTree.view.index);
          a.push(tTree.children.length);
          tTree.children.push({
            type : 0,
            parent : tTree,
            index : a,
            tile : obj
          });
          tTree.view.addChild(obj);
        }
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
  }

  var dupView = null;
  dupView = (v)=>{
    v.onPress = (x,y)=>{
      t.putTile(t.makeTile(dupView),v.parent.index);
    };
    v.render = ()=>{
      var r = Math.min(v.rect.w/2,v.rect.h/2);
      Render.shadowed(5,UI.theme.shadow,()=>{
        Render.circle(v.rect.w/2,v.rect.h/2,r).stroke(4)(UI.theme.def);
      });
    };
  };
  t.registerTile("DupTile",dupView,()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.circle(0.5,0.5,0.3).stroke(0.1)(UI.theme.def);
    });
  });
  t.registerTile("ScrollTile",(v)=>{
    v.addChild(UI.create(UI.field((dx,dy,dz)=>{
      var size = 80;
      for(var i=-1;i<v.rect.h/size/dz;i++){
        Render.line(-dx/dz,(i-Math.floor(dy/size/dz))*size,(v.rect.w-dx)/dz,(i-Math.floor(dy/size/dz))*size).stroke(1/dz)(UI.theme.impact);
      }
      for(var i=-1;i<v.rect.w/size/dz;i++){
        Render.line((i-Math.floor(dx/size/dz))*size,-dy/dz,(i-Math.floor(dx/size/dz))*size,(v.rect.h-dy)/dz).stroke(1/dz)(UI.theme.impact);
      }
      Render.circle(0,0,10).fill(UI.theme.def);
    })));
  },()=>{
    Render.shadowed(4,UI.theme.frame,()=>{
      Render.rect(0.25,0.25,0.5,0.5).stroke(0.1)(UI.theme.def);
    });
  });
  t.registerTile("NoneTile",Base.void,Base.void);
  var tileTree = {
    type : 0,
    tile : t.makeTile(dupView)
  };
  function makeTree(t,p,v,a){
    if(t.type==0){
      t.tile.index = Base.clone(a);
      v.addChild(t.tile);
      t.parent = p;
    }else{
      var s;
      if(t.type==1)s = UI.horizontal(tileSpace,true,vanishTile);
      else s = UI.vertical(tileSpace,true,vanishTile);
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
  UI.root.addChild(view);
  makeTree(tileTree,null,view,[]);

  t.tt = ()=>tileTree;

  return t;
});