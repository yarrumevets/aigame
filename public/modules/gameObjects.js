// Utility functions:
// - Create an Image object and set its source in one function call.
const createImage = (src, w, h) => {
  const img = new Image(w, h);
  img.src = src;
  return img;
};

// Inventory Items
export const ticket = {
  image: createImage("./images/items/ticket.png", 64, 64),
  x: 803,
  y: 12,
};

// Game Object:
// - Ghost
export const ghostGameObject = {
  sprites: {
    front: [
      {
        image: createImage("./images/ghost/ghost_front.png", 174, 170), // width x height expected based on file info.
        duration: 3000, // long pause...
      },
      {
        image: createImage("./images/ghost/ghost_front_blink.png", 174, 170),
        duration: 40, // ...blink!
      },
    ],
    left: [
      {
        image: createImage("./images/ghost/ghost_left.png", 174, 170),
        duration: 500,
      },
    ],
    right: [
      {
        image: createImage("./images/ghost/ghost_right.png", 174, 170),
        duration: 500,
      },
    ],
    back: [
      {
        image: createImage("./images/ghost/ghost_back.png", 174, 170),
        duration: 500,
      },
    ],
    // die: [],
    // spawn: [],
    // etc...
  },
  currentSprite: "front",
  currentFrame: 0,
  lastFrameTime: 0,
  x: 0,
  y: 0,
  width: 96, // width to render.
  height: 96,
  hitboxes: [
    {
      // Pixel distance from top-left of image
      x1: 20,
      y1: 7,
      // Pixel distance from top-left of hitbox
      x2: 55,
      y2: 88,
    },
  ],
};

export const createHeartGameObject = (x, y) => {
  const sprites = {
    default: [
      {
        image: createImage("./images/heart/heart_1.png", 124, 113),
        duration: 200,
      },
      {
        image: createImage("./images/heart/heart_2.png", 124, 113),
        duration: 500,
      },
    ],
  };
  const currentSprite = "default";
  const currentFrame = 0;
  const lastFrameTime = 0;
  // const x = 100;
  // const y = 600;
  const width = 64;
  const height = 64;
  const hitboxes = [
    {
      // Pixel distance from top-left of image
      x1: 0,
      y1: 2,
      // Pixel distance from top-left of hitbox
      x2: 64,
      y2: 30,
    },
    {
      // Pixel distance from top-left of image
      x1: 10,
      y1: 33,
      // Pixel distance from top-left of hitbox
      x2: 46,
      y2: 30,
    },
  ];

  return {
    sprites,
    currentSprite,
    currentFrame,
    lastFrameTime,
    x,
    y,
    width,
    height,
    hitboxes,
  };
};

export const npcBoss = {
  isPresent: false,
  sprites: {
    default: [
      {
        image: createImage("./images/npc/boss_1.png", 96, 132),
        duration: 500,
      },
      {
        image: createImage("./images/npc/boss_2.png", 96, 132),
        duration: 500,
      },
    ],
  },
  currentSprite: "default",
  currentFrame: 0,
  lastFrameTime: 0,
  x: 100,
  y: 600,
  width: 96,
  height: 132,
  hitboxes: [
    {
      // Pixel distance from top-left of image
      x1: 0,
      y1: -30,
      // Pixel distance from top-left of hitbox
      x2: 96,
      y2: 192,
    },
  ],
};

export const npcPanic = {
  isPresent: false,
  sprites: {
    default: [
      {
        image: createImage("./images/npc/ghost_panic_1.png", 96, 132),
        duration: 300,
      },
      {
        image: createImage("./images/npc/ghost_panic_2.png", 96, 132),
        duration: 300,
      },
    ],
  },
  currentSprite: "default",
  currentFrame: 0,
  lastFrameTime: 0,
  x: 100,
  y: 600,
  width: 96,
  height: 132,
  hitboxes: [
    {
      // Pixel distance from top-left of image
      x1: -30,
      y1: -30,
      // Pixel distance from top-left of hitbox
      x2: 156,
      y2: 192,
    },
  ],
};

export const npcJolly = {
  isPresent: false,
  sprites: {
    default: [
      {
        image: createImage("./images/npc/ghost_jolly_1.png", 96, 132),
        duration: 900,
      },
      {
        image: createImage("./images/npc/ghost_jolly_2.png", 96, 132),
        duration: 200,
      },
    ],
  },
  currentSprite: "default",
  currentFrame: 0,
  lastFrameTime: 0,
  x: 100,
  y: 600,
  width: 96,
  height: 132,
  hitboxes: [
    {
      // Pixel distance from top-left of image
      x1: -10,
      y1: -10,
      // Pixel distance from top-left of hitbox
      x2: 116,
      y2: 172,
    },
  ],
};

export const npcPrincess = {
  isPresent: false,
  sprites: {
    default: [
      {
        image: createImage("./images/npc/princess_1.png", 96, 96),
        duration: 900,
      },
    ],
  },
  currentSprite: "default",
  currentFrame: 0,
  lastFrameTime: 0,
  x: 300, // <--------------------------- do these matter any more ??? they should really come from the map coords.
  y: 700,
  width: 96,
  height: 96,
  hitboxes: [
    {
      // Pixel distance from top-left of image
      x1: -10,
      y1: -10,
      // Pixel distance from top-left of hitbox
      x2: 116,
      y2: 116,
    },
  ],
};
