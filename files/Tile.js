Base.write("Tile",()=>{
  var t = {};
  var tileSpace = 10;

  var view = UI.fullView(tileSpace);
  UI.root.addChild(view);
  var fr = UI.frame();
  view.addChild(fr);
  fr.addChild(UI.button(()=>{console.log("po");}).place(10,10,40,40));

  return t;
});