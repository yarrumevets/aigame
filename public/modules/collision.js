export const rectRectCollisionCheck = (rect1, rect2) => {
  if (
    rect1.x1 > rect2.x2 ||
    rect2.x1 > rect1.x2 ||
    rect1.y1 > rect2.y2 ||
    rect2.y1 > rect1.y2
  ) {
    return false;
  }
  return true;
};

// Create a world-coordinates rectangle based on the game object position and the offset of the hitbox.
export const rectFromObjectHitbox = (gameObj, i) => {
  const rect = {
    x1: gameObj.x + gameObj.hitboxes[i].x1,
    y1: gameObj.y + gameObj.hitboxes[i].y1,
  };
  rect.x2 = rect.x1 + gameObj.hitboxes[i].x2;
  rect.y2 = rect.y1 + gameObj.hitboxes[i].y2;
  return rect;
};

// Compare all hitboxes among 2 game objects for a collision.
export const gameObjectCollisionCheck = (gameObj1, gameObj2) => {
  for (let i = 0; i < gameObj1.hitboxes.length; i++) {
    for (let j = 0; j < gameObj2.hitboxes.length; j++) {
      const rect1 = rectFromObjectHitbox(gameObj1, i);
      const rect2 = rectFromObjectHitbox(gameObj2, j);
      if (rectRectCollisionCheck(rect1, rect2) === true) {
        return true;
      }
    }
  }
  return false;
};
