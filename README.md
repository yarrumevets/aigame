# 👻 AI Adventure Game

A simple adventure game that utilizes the GPT API to enhance NPC (non-palyer character) interactions, making them more dynamic and engaging.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Roadmap](#roadmap)
- [Installation](#installation)
- [Tech](#tech)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)
- [Media Sources](#media-sources)
- [Live Demo](#live-demo)

## Introduction

I developed this game as a proof of concept for using the GPT API to improve NPC interactions. The main challenges were:

- Ensuring NPCs stay on-script and provide enough information to encourage players to engage in conversations necessary for game progression.
- Integrating GPT responses with codes that the game logic can parse to update the game state.

## Tech

- GPT API
- Node.js / Express.js
- HTML Canvas animation
- Game mechanics: Movement, keyboard input, collision detection

## Features

- User interaction with GPT taking on various NPC roles
- GPT integration with the app logic to affect game state in order to progress the game

## Roadmap

Features I plan to include:

- Refined system prompts that ensure NPCs deliver more predictable responses.
- A complex and challenging storyline that demands increased interaction once NPCs offer consistent feedback.
- Additional game mechanics such as a health meter, enemies, and hearts for health replenishment.
- Game over/won logic that provides end-game feedback and loops back to the start screen.

## Installation

Step-by-step instructions on how to get the development environment running.

```bash
git clone https://github.com/yarrumevets/aigame.git
cd aigame
yarn
```

## Setup

Create file in root `openaiApiCreds.json` with your OpenAi api key in this format:

```
{
  "openaiApiKey": "xx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

## Usage

```bash
node server.js
```

Gameplay:

- Press enter at the start screen
- Use arrow keys to navigate the player
- Press 'T' when prompted to talk to the NPC

Go to `http://localhost:<PORT>` in your browser.

## License

Distributed under the MIT License. See the LICENSE file for more information.

## Media Sources

Images were created using Midjourney

## Live Demo

&#128073; [Live Game Demo](https://yarrumevets.com/aigame) &#128072;
