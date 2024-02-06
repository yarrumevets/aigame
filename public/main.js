// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
import {
  ticket,
  ghostGameObject,
  createHeartGameObject,
  npcBoss,
  npcPanic,
  npcJolly,
  npcPrincess,
} from "./modules/gameObjects.js";
import { generateGameMap } from "./modules/map.js";
import { wallImages } from "./modules/tiles.js";
import { drawCanvasShadow } from "./modules/utils.js";
import {
  gameObjectCollisionCheck,
  rectFromObjectHitbox,
  rectRectCollisionCheck,
} from "./modules/collision.js";
import { generateKeyCapture } from "./modules/keyboard.js";
import { drawHitboxes } from "./modules/utils.js"; // @TODO Remove

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ GAME INIT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

let heartGameObjects;

const items = {
  ticket: false,
  accessGranted: false,
}; // items collected by the user to progress. verified on back-end.

const gameMap = generateGameMap();
ghostGameObject.x = 100; // @TODO: set this in 'constructor'...
ghostGameObject.y = 100;

const keyboard = generateKeyCapture();
keyboard.initKeyboard();

const speed = 360; // 300 pixels per second.
let lastTimestamp = 0;
const stats = document.getElementById("stats");
const gameTilesX = 16;
const gameTilesY = 12;
const gameTileSize = 64;
const gameWidth = gameTilesX * gameTileSize;
const gameHeight = gameTilesY * gameTileSize;

// Create the canvas / game area
const canvas = document.getElementById("game");
canvas.width = gameWidth;
canvas.height = gameHeight;

const ctx = canvas.getContext("2d");
// Shadows
ctx.shadowOffsetX = 30;
ctx.shadowOffsetY = 30;
ctx.shadowBlur = 15;
ctx.shadowColor = `rgba(0, 0, 0, 0.4`;
ctx.fillStyle = "#000";

// ------- Ai Chat Stuff ------ //

let currentChatGhost = ""; // Jolly, Panic, Boss

let showTextInitPrompt = false; // show the indicator and allow user to trigger the text prompt
let isDisplayTextPrompt = false; // false; // show or hide the text prompt

const sayButton = document.getElementById("saybutton");
const closeButton = document.getElementById("closebutton");
const userPrompt = document.getElementById("userprompt");
const aiResponse = document.getElementById("airesponse");
const promptModal = document.getElementById("talkwrapperoverlay");
promptModal.style.display = "none";

async function sendMessage() {
  sayButton.setAttribute("disabled", "disabled");

  const message = userPrompt.value;
  if (!message) return;

  userPrompt.value = "";

  aiResponse.innerHTML = "Hmmmmm...";

  userPrompt.focus();
  const messageData = {
    message,
    items,
    npc: currentChatGhost,
  };
  const response = await fetch("./api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });
  const jsonResponse = await response.json();
  aiResponse.innerHTML = jsonResponse.response;

  if (jsonResponse.item) {
    items[jsonResponse.item] = true;
  }

  // @TODO: move this code somewhere else...
  if (jsonResponse.item === "accessGranted") {
    gameMap.setRoom("endgameRoom");
    initWalls();
  }

  sayButton.removeAttribute("disabled");
}

sayButton.onclick = () => {
  sendMessage();
};

userPrompt.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    isDisplayTextPrompt &&
    userPrompt.value &&
    !sayButton.hasAttribute("disabled")
  ) {
    sendMessage();
  }
});

closeButton.onclick = () => {
  isDisplayTextPrompt = false;
  userPrompt.value = "";
  aiResponse.innerHTML = "";
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Given the key inputs:
// - Update the ghost's sprite (directional)
// - Return the next frame's increment x and y based on movement
// --- to be collision tested before applying to the player's xy position
const controlGhost = (distance) => {
  const tempCurrentSprite = ghostGameObject.currentSprite;
  let xMove = 0;
  let yMove = 0;

  // Update the position based on arrow keys
  if (keyboard.getKeys().ArrowUp) {
    yMove = -distance;
    ghostGameObject.currentSprite = "back";
  }
  if (keyboard.getKeys().ArrowDown) {
    yMove = distance;
    ghostGameObject.currentSprite = "front";
  }
  if (keyboard.getKeys().ArrowLeft) {
    xMove = -distance;
    ghostGameObject.currentSprite = "left";
  }
  if (keyboard.getKeys().ArrowRight) {
    xMove = distance;
    ghostGameObject.currentSprite = "right";
  }

  // Reset to first frame if sprite changes.
  if (ghostGameObject.currentSprite !== tempCurrentSprite)
    ghostGameObject.currentFrame = 0;

  return { xMove, yMove };
};

// Animate through the sprite frames.
const spriteAnimation = (gameObject, timestamp) => {
  const currentSprite = gameObject.sprites[gameObject.currentSprite];
  const currentFrame = currentSprite[gameObject.currentFrame];
  if (timestamp - gameObject.lastFrameTime > currentFrame.duration) {
    // Go to next frame
    gameObject.lastFrameTime = timestamp;
    if (gameObject.currentFrame < currentSprite.length - 1)
      gameObject.currentFrame += 1;
    else gameObject.currentFrame = 0;
  }
};

let wallSprites = []; // the images and locations; specifically to help collision detection.
const initWalls = () => {
  wallSprites = [];
  for (let y = 0; y < gameTilesY; y++) {
    for (let x = 0; x < gameTilesX; x++) {
      const mapSymbol = gameMap.getCurrentRoom()[y][x];
      if (mapSymbol === "#") {
        // Regular wall
        wallSprites.push({
          image: wallImages[Math.floor(Math.random() * 4)],
          x: x * gameTileSize,
          y: y * gameTileSize,
        });
      } else if (mapSymbol === "x") {
        // Passable wall
        wallSprites.push({
          image: wallImages[Math.floor(Math.random() * 4)],
          x: x * gameTileSize,
          y: y * gameTileSize,
          passable: true,
        });
      }
    }
  }
};

initWalls();
const drawWalls = () => {
  for (let i = 0; i < wallSprites.length; i++) {
    if (wallSprites[i].passable) {
      ctx.globalAlpha = 0.7;
      ctx.drawImage(wallSprites[i].image, wallSprites[i].x, wallSprites[i].y);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.drawImage(wallSprites[i].image, wallSprites[i].x, wallSprites[i].y);
    }
  }
};

const initItemsInRoom = () => {
  npcBoss.isPresent = false;
  npcJolly.isPresent = false;
  npcPanic.isPresent = false;
  npcPrincess.isPresent = false;
  heartGameObjects = [];
  const map = gameMap.getCurrentRoom();
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      // Hearts
      if (map[i][j] === "@") {
        heartGameObjects.push(createHeartGameObject(j * 64, i * 64));
      }
      if (map[i][j] === "J") {
        npcJolly.isPresent = true;
        npcJolly.x = j * 64;
        npcJolly.y = i * 64;
      }
      if (map[i][j] === "B") {
        npcBoss.isPresent = true;
        npcBoss.x = j * 64;
        npcBoss.y = i * 64;
      }
      if (map[i][j] === "P") {
        npcPanic.isPresent = true;
        npcPanic.x = j * 64;
        npcPanic.y = i * 64;
      }
      if (map[i][j] === "L") {
        npcPrincess.isPresent = true;
        npcPrincess.x = j * 64;
        npcPrincess.y = i * 64;
      }
    }
  }
};
initItemsInRoom();

let fpsStart = performance.now();
let fpsFrames = 0;
let averageFrameRate = 0;

const ghostWallCollision = (move) => {
  let yHit = false;
  let xHit = false;
  for (let i = 0; i < wallSprites.length; i++) {
    if (wallSprites[i].passable) continue;

    // using sprites for collision - bad! - find a better alternative.
    const wallHitbox = {
      x1: wallSprites[i].x,
      y1: wallSprites[i].y,
      x2: wallSprites[i].x + 64,
      y2: wallSprites[i].y + 64,
    };

    // Create hitbox with next frames' x/y position.
    const hitbox = rectFromObjectHitbox(ghostGameObject, 0);
    const nextHitbox = {
      ...hitbox,
      x1: hitbox.x1 + move.xMove,
      x2: hitbox.x2 + move.xMove,
      y1: hitbox.y1 + move.yMove,
      y2: hitbox.y2 + move.yMove,
    };

    // Check for a collision on the next frame.
    if (rectRectCollisionCheck(nextHitbox, wallHitbox)) {
      // there will be a collision...

      // Try with only Y only
      if (!yHit) {
        // skip if y already collided.
        const hitboxY = rectFromObjectHitbox(ghostGameObject, 0);
        const nextYHitbox = {
          ...hitboxY,
          y1: hitboxY.y1 + move.yMove,
          y2: hitboxY.y2 + move.yMove,
        };
        if (rectRectCollisionCheck(nextYHitbox, wallHitbox)) {
          yHit = true;
        }
      }

      // Try with only X only
      if (!xHit) {
        // skip if x already collided.
        const hitboxX = rectFromObjectHitbox(ghostGameObject, 0);
        const nextXHitbox = {
          ...hitboxX,
          x1: hitboxX.x1 + move.xMove,
          x2: hitboxX.x2 + move.xMove,
        };
        if (rectRectCollisionCheck(nextXHitbox, wallHitbox)) {
          xHit = true;
        }
      }

      if (xHit && yHit) {
        break;
      }
    }
  }

  return { xHit, yHit };
};

// Draw Game Object:
const drawGameObject = (gameObject) => {
  ctx.drawImage(
    gameObject.sprites[gameObject.currentSprite][gameObject.currentFrame].image,
    gameObject.x,
    gameObject.y,
    gameObject.width,
    gameObject.height
  );
};

// Draw the squares that are to hold the acquired game items:
const drawItemBox = (x, y, w, h) => {
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#ffffff";
  ctx.strokeWidth = 3;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeWidth = 1;
};
const drawItemBoxes = () => {
  const itemBoxes = [
    [800, 10, 68, 68],
    [872, 10, 68, 68],
    [944, 10, 68, 68],
  ];
  for (let i = 0; i < itemBoxes.length; i++) {
    drawItemBox(...itemBoxes[i]);
  }
};

const drawInventoryItem = () => {
  ctx.drawImage(ticket.image, ticket.x, ticket.y, 64, 64);
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MAIN ANIMATION LOOP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
const update = (timestamp) => {
  // ------------ FRAME INIT ------------ //
  var deltaTime = (timestamp - lastTimestamp) / 1000; // In seconds.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var distance = speed * deltaTime;
  const fps = 1 / deltaTime;

  fpsFrames++;
  const fpsElapsedTime = performance.now() - fpsStart;
  if (fpsElapsedTime > 1000) {
    fpsStart = performance.now();
    averageFrameRate = (fpsFrames / fpsElapsedTime) * 1000;
    fpsFrames = 0;
  }

  // ---------- MOVEMENT / INPUTS ---------- //
  const move = controlGhost(distance);

  // Changing rooms. ! Leave overlap so player cannot squeeze between wall and edge of screen
  // and makes the transition more snappy.
  const roomSpawnOverlap = 30; // pixels.
  if (ghostGameObject.x > canvas.width - roomSpawnOverlap) {
    // @TODO: Replace these blocks with a common room-init function.
    ghostGameObject.x = -ghostGameObject.width + roomSpawnOverlap;
    gameMap.changeRooms("right");
    initWalls();
    initItemsInRoom();
  }
  if (ghostGameObject.y > canvas.height - roomSpawnOverlap) {
    ghostGameObject.y = -ghostGameObject.height + roomSpawnOverlap;
    gameMap.changeRooms("down");
    initWalls();
    initItemsInRoom();
  }
  if (ghostGameObject.x < -ghostGameObject.width + roomSpawnOverlap) {
    ghostGameObject.x = canvas.width - roomSpawnOverlap;
    gameMap.changeRooms("left");
    initWalls();
    initItemsInRoom();
  }
  if (ghostGameObject.y < -ghostGameObject.height + roomSpawnOverlap) {
    ghostGameObject.y = canvas.height - roomSpawnOverlap;
    gameMap.changeRooms("up");
    initWalls();
    initItemsInRoom();
  }
  // Check if player is initiating talk:
  if (keyboard.getKeys().t && showTextInitPrompt && !isDisplayTextPrompt) {
    isDisplayTextPrompt = true;
  }

  if (isDisplayTextPrompt && showTextInitPrompt) {
    // user clicked the button, and is within range of an NPC
    if (promptModal.style.display !== "block") {
      promptModal.style.display = "block";
    }
  } else if (isDisplayTextPrompt && !showTextInitPrompt) {
    // text prompt was open but player moved out of range.
    // make sure to reset input innner text ( duplicated code here..)
    console.log("Clear ai prompt on leave.");
    isDisplayTextPrompt = false;
    userPrompt.value = "";
    aiResponse.innerHTML = "";
  } else {
    if (promptModal.style.display === "block") {
      promptModal.style.display = "none";
    }
  }

  // ---------- COLLISION DETECTION ----------- //

  // ghost-heart
  for (let i = 0; i < heartGameObjects.length; i++) {
    const heartGameObject = heartGameObjects[i];
    if (gameObjectCollisionCheck(ghostGameObject, heartGameObject)) {
      // @TODO: DO SOMETHING BETTER.
      heartGameObjects.splice(i, 1);
    }
  }

  // ghost-walls
  const ghostWallCollisions = ghostWallCollision(move);

  // // For dev purposed: move without collision stuff...
  if (!ghostWallCollisions.xHit) ghostGameObject.x += move.xMove;
  if (!ghostWallCollisions.yHit) ghostGameObject.y += move.yMove;

  showTextInitPrompt = false;
  if (npcBoss.isPresent) {
    if (gameObjectCollisionCheck(ghostGameObject, npcBoss)) {
      currentChatGhost = "Boss";
      showTextInitPrompt = true;
    }
  }

  if (npcJolly.isPresent) {
    if (gameObjectCollisionCheck(ghostGameObject, npcJolly)) {
      currentChatGhost = "Jolly";
      showTextInitPrompt = true;
    }
  }

  if (npcPanic.isPresent) {
    if (gameObjectCollisionCheck(ghostGameObject, npcPanic)) {
      currentChatGhost = "Panic";
      showTextInitPrompt = true;
    }
  }

  if (npcPrincess.isPresent) {
    if (gameObjectCollisionCheck(ghostGameObject, npcPrincess)) {
      currentChatGhost = "Princess";
      showTextInitPrompt = true;
    }
  }

  // ------------ DRAW ------------- //

  // Draw walls
  drawWalls();

  // Draw Hearts
  for (let i = 0; i < heartGameObjects.length; i++) {
    const heartGameObject = heartGameObjects[i];
    if (
      timestamp - heartGameObject.lastFrameTime >
      heartGameObject.sprites[heartGameObject.currentSprite][
        heartGameObject.currentFrame
      ].duration
    ) {
      // Update last frame time.
      heartGameObject.lastFrameTime = timestamp;

      if (
        heartGameObject.currentFrame <
        heartGameObject.sprites[heartGameObject.currentSprite].length - 1
      )
        heartGameObject.currentFrame += 1;
      else heartGameObject.currentFrame = 0;
    }
    // Draw heart hitboxes
    drawHitboxes(heartGameObject, ctx);

    ctx.drawImage(
      heartGameObject.sprites[heartGameObject.currentSprite][
        heartGameObject.currentFrame
      ].image,
      heartGameObject.x,
      heartGameObject.y,
      heartGameObject.width,
      heartGameObject.height
    );
  }

  // Draw ghost
  spriteAnimation(ghostGameObject, timestamp);
  drawGameObject(ghostGameObject);

  // Draw NPCs
  if (npcBoss.isPresent) {
    spriteAnimation(npcBoss, timestamp);
    drawGameObject(npcBoss);
    drawHitboxes(npcBoss, ctx, "yellow");
  }

  if (npcPanic.isPresent) {
    spriteAnimation(npcPanic, timestamp);
    drawGameObject(npcPanic);
    drawHitboxes(npcPanic, ctx, "blue");
  }

  if (npcJolly.isPresent) {
    spriteAnimation(npcJolly, timestamp);
    drawGameObject(npcJolly);
    drawHitboxes(npcJolly, ctx, "green");
  }

  if (npcPrincess.isPresent) {
    spriteAnimation(npcPrincess, timestamp);
    drawGameObject(npcPrincess);
    drawHitboxes(npcPrincess, ctx, "pink");
  }

  // Draw ghost hitboxes (DEV-ONLY)
  drawHitboxes(ghostGameObject, ctx, "red");

  // Canvas inner-shadow
  drawCanvasShadow(canvas, ctx, "0.7");

  // Draw the boxes that hold the item icons
  drawItemBoxes(ctx);

  drawItemBoxes();
  // Draw items:
  if (items.ticket) {
    drawInventoryItem(ticket);
  }

  // Draw the speech bubble
  if (showTextInitPrompt && !isDisplayTextPrompt) {
    const radius = 30;
    const xOffset = ghostGameObject.x - 10;
    const yOffset = ghostGameObject.y - 10;
    ctx.beginPath();
    ctx.arc(xOffset, yOffset, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "yellow"; // Change the fill color as needed
    ctx.fill();
    ctx.closePath();
    ctx.font = "13px Arial"; // Set the font and size
    ctx.fillStyle = "black"; // Change the text color as needed
    ctx.textAlign = "center";
    ctx.fillText("Press T", xOffset, yOffset + 8);
  }

  // ------------ FRAME STUFF ------------ //

  // Update the last timestamp
  lastTimestamp = timestamp;

  // Update stats text.
  stats.innerHTML = `&Delta;: ${deltaTime.toFixed(3)} - #Keys: ${
    Object.keys(keyboard.getKeys()).length
  } -- FPS: ${fps.toFixed(1)} -- Avg FPS: ${averageFrameRate.toFixed(3)}`;

  // Request the next animation frame
  if (!keyboard.getKeys().Escape) {
    requestAnimationFrame(update);
  }
};

// Main menu
const showMainMenu = () => {
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#000000";
  //  ctx.strokeWidth = 3;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
  ctx.strokeWidth = 2;
  ctx.strokeRect(10, 10, gameWidth - 20, gameHeight - 20);
  ctx.strokeWidth = 1;
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "30px Arial";
  ctx.fillText("Ghost Game", gameWidth / 2, 300);
  ctx.font = "15px Arial";
  ctx.fillText("Press Enter to begin...", gameWidth / 2, 400);

  document.addEventListener("keydown", startGame); // @TODO: remove duplicate event listener.
};

const startGame = (event) => {
  if (event.key === "Enter") {
    console.log("Start Game!");
    document.removeEventListener("keydown", startGame);
    // Start the animation loop by requesting the first frame
    requestAnimationFrame(update);
  }
};

showMainMenu();

// TODO:
/*
  Closing speech bubble resets text
  Game won screen -> back to Main menu
  Organize code for various screens: menu, game loop, won, lost
  Proper modules and inheritance for objects.
*/
