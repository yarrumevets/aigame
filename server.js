const express = require("express");
const app = express();
const port = process.env.PORT || 4322;
const openaiApiCreds = require("./openaiApiCreds.json");

// // Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`Incoming Request: ${req.method} ${req.url}`);
//   next();
// });

// Serve static files from the "public" folder
app.use(express.static("public"));
app.use(express.json());

app.post("/api/send", (req, res) => {
  console.log("[POST]");
  const message = req.body.message;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${openaiApiCreds.openaiApiKey}`);

  const items = req.body.items;
  const npc = req.body.npc;

  let systemPersona = "";
  switch (npc) {
    case "Jolly":
      systemPersona =
        "You are a jolly, happy ghost named Jonny. Speak in a way that is upbeat, joyful, and happy. " +
        "If the user asks you what he should do, like 'what do I do?' or 'I am lost?' or any similar inquiry of help, you will instruct the user to ask the ghost in the north east for a ticket, and that the room has passable walls in it somewhere. " +
        "If the user asks or talks about anything other than asking advice, just give a typeical ghost response like 'Booo!' or 'Mwahahah!' etc.";
      break;
    case "Panic":
      systemPersona =
        "You are a ghost named Patrick. You talk frantically and with a worrisome tone. " +
        "Whenever the user mentions the word 'ticket', or asks for a ticket in any way, you will respond by telling them you are giving them a ticket, and include this exact string '<ticketGiven>' at the end of the reply. " +
        "DO NOT offer the ticket if the user does not allude to knowing of its existence. " +
        "If there are any other unrelated inquiries or comments, simply ignore them and suggest that the user go seek a different ghost in the far south west.";
      break;
    case "Boss":
      systemPersona = "You are a wise and serious ghost named Bob. ";
      if (items.ticket) {
        systemPersona +=
          "If the user asks you why you are blocking him or if he can get by or mentions that he's holding a ticket, like 'hey, you're in my way' or 'can I pass?' or 'hey I have a ticket', etc, you reply by telling them that they may pass as you noticed they are holding a ticket, and include the exact string '<accessGranted>' at the end of the reply." +
          "As an example, if the user asks 'Can I get past you?' or 'I have a ticket now.', you reply with something like 'Ah, I see you have a ticket! <accessGranted>', or 'Please, right this way... <accessGranted>', etc. ";
      } else {
        systemPersona +=
          "If the user asks you why you are blocking him or if he can get by, like 'hey, you're in my way' or 'can I pass?' or 'please me', etc, you reply by telling the user that they must obtain a certain item in order to pass, ex: 'You do not have what you need to pass.'. " +
          "If the user asks what they need to get past, you do not tell them the answer nor do you make up anything. Example prompt 'What item do you require for my passing?'. You simply reply something like 'You must go figure that out by yourself.' " +
          "Do not mention a key or any specific item, as you do not know what the required item is, and that will be misleading.";
      }
      systemPersona +=
        "If the user asks about anything else or any other topic, reply with a typical ghost reply, like 'BOO!' or something scary like that.";
      break;
    case "Princess":
      systemPersona =
        "You are a princess ghost. You are worried but also relieved to have been rescued by your hero." +
        "The mission is now over and you are just relieved to be going home.";
      break;
    default:
  }

  const systemBaseContent =
    "You are the conversation bot for an NPC in a video game." +
    "Stay in character and don't mention the game or the fact that you are a bot or NPC. " +
    "The player is prompting you for information on how to progress through the game. " +
    "You do not refer to this game as a game, but instead you say 'adventure' or 'journey', etc. " +
    "Keep sentences to 1 to 3 sentences.";

  const systemContent = `${systemBaseContent} ${systemPersona}`;

  const raw = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemContent,
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.7,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const startFetchTime = process.hrtime();

  console.log("fetch....", requestOptions);

  fetch("https://api.openai.com/v1/chat/completions", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      jsonResult = JSON.parse(result);
      if (jsonResult && jsonResult.choices && jsonResult.choices[0]) {
        let responseMessage = jsonResult.choices[0].message.content;

        // Display the time it took to receive a response from GPT API:
        const end = process.hrtime(); // Record the end time
        const durationInNanoseconds =
          end[0] * 1e9 + end[1] - (startFetchTime[0] * 1e9 + startFetchTime[1]);
        const durationInSeconds = durationInNanoseconds / 1e9; // Convert to seconds

        let item = "";

        if (responseMessage.includes("<ticketGiven>")) {
          responseMessage = responseMessage.replace("<ticketGiven>", "");
          item = "ticket"; // @TODO: change to object ?
        } else if (responseMessage.includes("<accessGranted>")) {
          responseMessage = responseMessage.replace("<accessGranted>", "");
          item = "accessGranted";
        }

        res.send({
          response: responseMessage,
          usage: jsonResult.usage,
          item: item,
        });
      } else {
        res.send({ response: "" });
      }
    })
    .catch((error) => console.log("error", error));
});

app.get("/", (req, res) => {
  // Send the HTML file as the response
  res.sendFile("public/game.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
