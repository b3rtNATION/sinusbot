registerPlugin(
  {
    name: "Musicbot Home-Alone",
    version: "1.0",
    description: "Regelt das Verhalten des Bots wenn er alleine ist.",
    author: "Robert Toenne <b3rrr7@gmail.com>",
    vars: [
      {
        name: "homebase",
        title:
          "Defaultchannel des Bots.",
        type: "channel",
      },
      {
        name: "moveMessage",
        title:
          "Die Nachricht die der Bot in den Channel schreibt, in welchen er gemoved wird.",
        placeholder: "Ich befinde mich nun im Channel: CHANNELNAME",
        type: "string",
      },
      {
        name: "timeToGo",
        title:
          "Wie lange der Bot alleine im Channel wartet bis er nach Hause geht (in Sekunden).",
        placeholder: "Default: 20s",
        type: "number",
      },
      {
        name: "timeWithoutMusic",
        title:
          "Wie lange der warten soll, bis er einen Radio-Stream startet, wenn keine Musik läuft (in Sekunden).",
        placeholder: "Default: 20s",
        type: "number",
      },
      {
        name: "defaultStream",
        title:
          "URL des Streams der abspielen soll, wenn X-Sekunden keine Musik läuft",
        type: "string",
      },
    ],
  },
  function (sinusbot, config) {
    const event = require("event");
    const backend = require("backend");
    const audio = require("audio");
    const media = require("media");

    let timeoutUntilBotLeaves;
    let timeoutUntilBotStartsDefaultMusic;

    event.on("clientMove", (ev) => {
      handleBot();
      checkMusic();

      if (ev.client.isSelf()) {
        botWasMoved();
      }
    });

    event.on("chat", function (ev) {
      if (ev.text === "!komm") {
        moveBotToClient(ev);
      }
      if (ev.text === "!bye") {
        moveBotBackToHome();
      }
    });

    event.on("trackEnd", (ev) => {
      console.log('track end');
      checkMusic();
    });

    const moveBotToClient = (event) => {
      const bot = backend.getBotClient();
      bot.moveTo(event.channel);
    };

    const botWasMoved = () => {
      const currentChannel = backend.getCurrentChannel();
      let moveMessage =
        "Ich befinde mich nun im Channel: " + currentChannel.name();
      if (config.moveMessage) {
        moveMessage = config.moveMessage;
      }
      currentChannel.chat(moveMessage);
    };

    const handleBot = () => {
      checkIfBotAlone() ? setBotTimeoutToGo() : clearBotTimeoutToGo();
    };

    const setBotTimeoutToGo = () => {
      timeoutUntilBotLeaves = setTimeout(() => {
        moveBotBackToHome();
      }, getTimeUntilBotLeavesWhenAlone());
    };

    const clearBotTimeoutToGo = () => {
      clearTimeout(timeoutUntilBotLeaves);
    };

    const moveBotBackToHome = () => {
      backend.getBotClient().moveTo(getHomeChannel());
    };

    const getHomeChannel = () => {
      return backend.getBotClient().moveTo(backend.getChannelByID("81"));
    };

    const checkIfBotAlone = () => {
      return backend.getCurrentChannel().getClientCount() > 1 ? false : true;
    };

    const getTimeUntilBotLeavesWhenAlone = () => {
      return config.timeToGo ? config.timeToGo * 1000 : 20000;
    };

    const checkMusic = () => {
      audio.isPlaying()
        ? clearBotTimeoutToPlayDefaultMusic()
        : setBotTimeoutToPlayDefaultMusic();
    };

    const startDefaultMusicStream = () => {
      media.playURL(getMusicStreamURL());
    };

    const getTimeUntilBotStartsDefaultStream = () => {
      return config.timeWithoutMusic ? config.timeWithoutMusic * 1000 : 20000;
    };

    const getMusicStreamURL = () => {
      return config.defaultStream
        ? config.defaultStream
        : "http://streaming307.radionomy.com:80/00000";
    };

    const setBotTimeoutToPlayDefaultMusic = () => {
      timeoutUntilBotStartsDefaultMusic = setTimeout(() => {
        startDefaultMusicStream();
      }, getTimeUntilBotStartsDefaultStream());
    };

    const clearBotTimeoutToPlayDefaultMusic = () => {
      clearTimeout(timeoutUntilBotStartsDefaultMusic);
    };
  }
);
