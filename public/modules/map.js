// Rules per room:
// - Max 16 x 12 tiles.
// - Must contain at least 1 door; 2+ connected floor tiles at an edge, ex:
//        ['#','#','#','#','#','#','#','#','#','#','-','-','#','#','#','#',]
// Rules for overall map:

// Legend:
/*
    #   Wall
    -   Floor
    %   Player (start)
    @   Heart
    A-Z NPC ( B = boss , J = jolly , P = panic , L = princess )
*/

// Room layouts
// Top-left
const a = [
  "################",
  "#--------------#",
  "#--------------#",
  "#-#-#-#-###-#--#",
  "###-#-###-####-#",
  "#-#-#-#---#--#--",
  "#---#--------#--",
  "#---#---#----###",
  "#-##########---#",
  "#--------------#",
  "#--------------#",
  "#######--#######",
];

// Top-right
const b = [
  "################",
  "#---------x----#",
  "#---------x----#",
  "#---------x----#",
  "#---------x----#",
  "--------###----#",
  "--------#@#-P--#",
  "#-------###----#",
  "#---------#----#",
  "#---------#----#",
  "#---------#----#",
  "#######--#######",
];

// Bottom-left
const c = [
  "#######--#######",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#--#####---%---#",
  "#--#-J-#--------",
  "#--#---#--------",
  "#--#---#-------#",
  "#--##-##-------#",
  "#--------------#",
  "#--------------#",
  "################",
];

// Bottom-right
const d = [
  "#######--#######",
  "#-----#--#-----#",
  "#-----#--#####-#",
  "#-----#----B-#-#",
  "###---#------#-#",
  "--#---########-#",
  "--#------------#",
  "###------------#",
  "#----L---------#",
  "#--------------#",
  "#--------------#",
  "################",
];

// Bottom-right
const d2 = [
  "#######--#######",
  "#-----#--#-----#",
  "#-----#--#####-#",
  "#-----#------#-#",
  "###---#------#-#",
  "------#####--#-#",
  "----------#--#-#",
  "###------------#",
  "#----L---------#",
  "#--------------#",
  "#--------------#",
  "################",
];

// Top-blocked
const e = [
  "################",
  "#--------------#",
  "#--------------#",
  "#-----------####",
  "#-----------#--#",
  "------------#@--",
  "------------#@--",
  "#-----------#--#",
  "#-----------####",
  "#--------------#",
  "#--------------#",
  "#######--#######",
];

// Left-blocked
const f = [
  "#######--#######",
  "####--------####",
  "###----------###",
  "##------------##",
  "#--------------#",
  "#---------------",
  "#---------------",
  "#--------------#",
  "##------------##",
  "###-----------##",
  "####---------###",
  "#######--#######",
];

// Right-blocked
const g = [
  "#######--#######",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "----########---#",
  "----########---#",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#######--#######",
];

// Bottom-blocked
const h = [
  "#######--#######",
  "#----#----#----#",
  "#--------------#",
  "##------------##",
  "#--------------#",
  "----------------",
  "----------------",
  "#--------------#",
  "##------------##",
  "#--------------#",
  "#-----####-----#",
  "#######--#######",
];

// All-4 directions
const i = [
  "#######--#######",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#-----####-----#",
  "------#@@#------",
  "------#@@#------",
  "#-----#xx#-----#",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#######--#######",
];

// PLAYER-START
const j = [
  "################",
  "#--------------#",
  "#--------------#",
  "#--------------#",
  "#-----#####----#",
  "------#---------",
  "------#-@-------",
  "#-----#--------#",
  "#-----#####----#",
  "#-@----------@-#",
  "#--------------#",
  "#######--#######",
];

// All-4 - top-blocked off.
const k = [
  "#######--#######",
  "#-#-##----#-#-##",
  "#----#----#----#",
  "##-#-#######-#-#",
  "#--------------#",
  "------#-#-#-----",
  "----------------",
  "##---#-#-----#-#",
  "#--------------#",
  "#-#-------#-#-##",
  "#--------------#",
  "#######--#######",
];

// Util functions
const iterateMap = (map, cb) => {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      cb(map[y][x], x, y);
    }
  }
};
const iterateRoom = (room, cb) => {
  for (let y = 0; y < room.length; y++) {
    for (let x = 0; x < room[y].length; x++) {
      cb(room[y][x], x, y);
    }
  }
};

// Check ever tile of every room of the map: @TODO - fix checking duplicate rooms
const validateMap = (map) => {
  let numPlayerStarts = 0;
  const startRoom = {};
  iterateMap(map, (room, rX, rY) => {
    iterateRoom(room, (tile, tX, tY) => {
      if (tile === "%") {
        numPlayerStarts += 1;
        if (numPlayerStarts > 1) {
          console.error("Error: More than one player start location found.");
          return false;
        }
        startRoom.x = rX;
        startRoom.y = rY;
      }
    });
  });
  // Check for no player start.
  if (numPlayerStarts < 1) {
    console.error("Error: No player start location found.");
  }
  // Map is valid.
  return startRoom;
};

export const generateGameMap = () => {
  const roomLayout = [
    [a, j, e, b],
    [f, k, i, g],
    [f, i, i, g],
    [c, h, h, d],
  ];

  const startRoom = validateMap(roomLayout);
  if (!startRoom) {
    console.error("Aborting due to map errors.");
  }

  // Make each a unique object so they can be updated as needed.
  // Done this way in 2 steps to make the original array more readable.
  for (let i = 0; i < roomLayout.length; i++) {
    roomLayout[i] = { ...roomLayout[i] };
  }

  const mapWidth = roomLayout.length;
  const mapHeight = roomLayout[0].length;

  let roomX = startRoom.x;
  let roomY = startRoom.y;

  let currentRoom = roomLayout[roomY][roomX]; // starting room must contain '%'

  // Setter @TODO clean this up a lot!
  const setRoom = (room) => {
    if ((room = "endgameRoom")) {
      currentRoom = d2;
    }
  };

  // Setter.
  const changeRooms = (direction) => {
    switch (direction) {
      case "up":
        roomY = roomY === 0 ? mapHeight - 1 : roomY - 1;
        break;
      case "down":
        roomY = roomY === mapHeight - 1 ? 0 : roomY + 1;
        break;
      case "left":
        roomX = roomX === 0 ? mapWidth - 1 : roomX - 1;
        break;
      case "right":
        roomX = roomX === mapWidth - 1 ? 0 : roomX + 1;
        break;
      default:
        break;
    }
    currentRoom = roomLayout[roomY][roomX];
  };

  // Getter.
  const getCurrentRoom = () => {
    return currentRoom;
  };

  return {
    getCurrentRoom,
    changeRooms,
    setRoom,
  };
};
