Base.write("Screen",()=>{
  var s = {};
  Render.loop(()=>{
    Render.rect(0,0,Window.width,Window.height).fill(1,0.5,0);
    Render.circle(Window.width/2,Window.height/2,100).stroke(3)(1,0,0);
  });
  return s;
});