Base.write("Tile",()=>{
  var t = {};
  var tileSpace = 10;

  // Frame{0,view::View}
  // Horizontal{1,children::[Tree]}
  // Vertical{2,children::[Tree]}
  /*var tileTree = {
    type : 0,
    view : UI.frame()
  };*/
  var tileTree = {
    type : 1,
    children : [
      {type : 0, tile : UI.frame()},
      {type : 2, children : [
        {type : 0, tile : UI.frame()},
        {type : 0, tile : UI.frame()}
      ]},
      {type : 0, tile : UI.frame()}
    ]
  };
  t.makeTile = (f)=>{
    var fr = UI.frame();
    fr.addChild(UI.createView(f));
    return fr;
  };
  t.tt = tileTree;
  t.putTile = (obj,path)=>{
    function traverse(tTree,path,idx){
      if(!tTree)return;
      if(tTree.type==0 || idx >= path.length){
        if(tTree.type==0){
          var tile = tTree.tile;
          var par = tTree.parent.view;
          if(tile.rect.w < tile.rect.h){
            tTree.type = 2;
            tTree.view = UI.vertical(tileSpace,true);
          }else{
            tTree.type = 1;
            tTree.view = UI.horizontal(tileSpace,true);
          }
          if(tTree.parent.type != tTree.type){
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
            delete tTree.tile;
            par.rewriteAt(path[idx-1],tTree.view);
          }else{
            delete tTree.view;
            tTree.type = 0;
            tTree.parent.children.splice(path[idx-1],0,{
              type : 0,
              parent : tTree.parent,
              tile : obj
            });
            par.insertAt(path[idx-1],obj);
          }
        }else{
          tTree.children.push({
            type : 0,
            parent : tTree,
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

  function makeTree(t,p,v){
    if(t.type==0){
      v.addChild(t.tile);
      t.parent = p;
    }else{
      var s;
      if(t.type==1)s = UI.horizontal(tileSpace,true);
      else s = UI.vertical(tileSpace,true);
      t.children.forEach((c)=>{
        makeTree(c,t,s);
      });
      v.addChild(s);
      t.view = s;
      t.parent = p;
    }
  }
  var view = UI.fullView(tileSpace);
  UI.root.addChild(view);
  makeTree(tileTree,null,view);

  return t;
});