/*
    Draws an innner shadow along the left and top edges of the canvas.
*/
export const drawCanvasShadow = (canvas, ctx, shadowOpacity) => {
  const tempShadowOffsetX = ctx.shadowOffsetX;
  const tempShadowOffsetY = ctx.shadowOffsetY;
  const tempShadowBlur = ctx.shadowBlur;
  const tempShadowColor = ctx.shadowColor;
  const tempFillStyle = ctx.fillStyle;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.shadowOffsetX = 30;
  ctx.shadowOffsetY = 30;
  ctx.shadowBlur = 15;
  ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(-50, -50);
  ctx.lineTo(canvasWidth, -50);
  ctx.lineTo(canvasWidth, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, canvasHeight);
  ctx.lineTo(-50, canvasHeight);
  ctx.closePath();
  ctx.fill();

  ctx.shadowOffsetX = tempShadowOffsetX;
  ctx.shadowOffsetY = tempShadowOffsetY;
  ctx.shadowBlur = tempShadowBlur;
  ctx.shadowColor = tempShadowColor;
  ctx.fillStyle = tempFillStyle;
};

export const drawHitboxes = (gameObject, ctx, color = "blue") => {
  const x = Math.floor(gameObject.x);
  const y = Math.floor(gameObject.y);
  ctx.strokeStyle = color;
  for (let i = 0; i < gameObject.hitboxes.length; i++) {
    ctx.strokeRect(
      x + gameObject.hitboxes[i].x1,
      y + gameObject.hitboxes[i].y1,
      gameObject.hitboxes[i].x2,
      gameObject.hitboxes[i].y2
    );
  }
};
