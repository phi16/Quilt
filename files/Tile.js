Base.write("Tile",()=>{
  var t = {};
  var tileSpace = 10;

  // [Tree]
  // - Frame{0,tile::View}[tile.index]
  // - Horizontal{1,children::[Tree]}[view, view.index]
  // - Vertical{2,children::[Tree]}[view, view.index]
  var view = UI.create(UI.fullView(tileSpace));

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
      f(v,fr);
    }));
    var menu = UI.create(UI.inherit(UI.button(()=>{
      console.log("po");
    }),(v)=>{
      v.layout = UI.defaultLayout(v,(w,h)=>{
        v.rect.w = v.rect.h = 40;
        v.rect.x = w-v.rect.w;
        v.rect.y = 0;
        v.shape = Render.polygon([0,0,40,0,40,40,0,0]);
      });
    }));
    menu.full = true;
    fr.addChild(menu);
    return fr;
  };
  t.putTile = (obj,path)=>{
    function traverse(tTree,path,idx){
      if(!tTree)return;
      if(tTree.type==0 || idx >= path.length){
        if(tTree.type==0){
          var tile = tTree.tile;
          if(tile.rect.w < tile.rect.h){
            tTree.type = 2;
            tTree.view = UI.vertical(tileSpace,true);
          }else{
            tTree.type = 1;
            tTree.view = UI.horizontal(tileSpace,true);
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

  var dupView = null;
  dupView = ()=>{
    return t.makeTile((v,w)=>{
      v.onPress = (x,y)=>{
        t.putTile(dupView(),w.index);
      };
      v.render = ()=>{
        var r = Math.min(v.rect.w/2,v.rect.h/2);
        Render.shadowed(5,UI.theme.shadow,()=>{
          Render.circle(v.rect.w/2,v.rect.h/2,r).stroke(4)(UI.theme.def);
        });
      }
    });
  }
  var tileTree = {
    type : 0,
    tile : dupView()
  };
  function makeTree(t,p,v,a){
    if(t.type==0){
      t.tile.index = Base.clone(a);
      v.addChild(t.tile);
      t.parent = p;
    }else{
      var s;
      if(t.type==1)s = UI.horizontal(tileSpace,true);
      else s = UI.vertical(tileSpace,true);
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

  t.tt = tileTree;

  return t;
});