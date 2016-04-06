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
  t.tt = tileTree;
  t.makeTile = (f)=>{
    var fr = UI.frame();
    fr.addChild(UI.createView(f));
    return fr;
  };
  t.putTile = (obj,path)=>{
    function traverse(tTree,path,idx){
      if(!tTree)return;
      if(tTree.type==0 || idx >= path.length){
        if(tTree.type==0){
          var tile = tTree.tile;
          var par = tile.parent;
          if(tile.rect.w < tile.rect.h){
            tTree.type = 2;
            tTree.view = UI.vertical(tileSpace,true);
          }else{
            tTree.type = 1;
            tTree.view = UI.horizontal(tileSpace,true);
          }
          tTree.children = [{
            type : 0,
            tile : tile
          },{
            type : 0,
            tile : obj
          }];
          tTree.view.addChild(tile);
          tTree.view.addChild(obj);
          delete tTree.tile;
          par.rewriteAt(path[idx-1],tTree.view);
        }else{
          tTree.children.push({
            type : 0,
            tile : obj
          });
          tTree.view.addChild(obj);
        }
      }else{
        console.log(tTree,path,idx);
        traverse(tTree.children[path[idx]],path,idx+1);
      }
    }
    traverse(tileTree,path,0);
  };

  function makeTree(t,v){
    if(t.type==0){
      v.addChild(t.tile);
    }else{
      var s;
      if(t.type==1)s = UI.horizontal(tileSpace,true);
      else s = UI.vertical(tileSpace,true);
      t.children.forEach((c)=>{
        makeTree(c,s);
      });
      v.addChild(s);
      t.view = s;
    }
  }
  var view = UI.fullView(tileSpace);
  UI.root.addChild(view);
  makeTree(tileTree,view);

  return t;
});