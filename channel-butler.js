registerPlugin(
  {
    name: "ChannelButler",
    version: "1.0",
    description:
      "Creates dynamically channels if the channel to overwatch is full or a new one with limited users is requested.",
    author: "Robert Toenne <b3rrr7@gmail.com>",
    vars: [
      {
        name: "ChannelToOverwatch1Name",
        title: "Name of the Category / Game 1",
        type: "string",
      },
      {
        name: "ChannelToOverwatch1Parent",
        title: "Parent channel of the overwatched channel 1",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch1",
        title: "Channel to overwatch 1",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch2Name",
        title: "Name of the Category / Game 2",
        type: "string",
      },
      {
        name: "ChannelToOverwatch2Parent",
        title: "Parent channel of the overwatched channel 2",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch2",
        title: "Channel to overwatch 2",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch3Name",
        title: "Name of the Category / Game 3",
        type: "string",
      },
      {
        name: "ChannelToOverwatch3Parent",
        title: "Parent channel of the overwatched channel 3",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch3",
        title: "Channel to overwatch 3",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch4Name",
        title: "Name of the Category / Game 4",
        type: "string",
      },
      {
        name: "ChannelToOverwatch4Parent",
        title: "Parent channel of the overwatched channel 4",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch4",
        title: "Channel to overwatch 4",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch5Name",
        title: "Name of the Category / Game 5",
        type: "string",
      },
      {
        name: "ChannelToOverwatch5Parent",
        title: "Parent channel of the overwatched channel 5",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch5",
        title: "Channel to overwatch 5",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch6Name",
        title: "Name of the Category / Game 6",
        type: "string",
      },
      {
        name: "ChannelToOverwatch6Parent",
        title: "Parent channel of the overwatched channel 6",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch6",
        title: "Channel to overwatch 6",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch7Name",
        title: "Name of the Category / Game 7",
        type: "string",
      },
      {
        name: "ChannelToOverwatch7Parent",
        title: "Parent channel of the overwatched channel 7",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch7",
        title: "Channel to overwatch 7",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch8Name",
        title: "Name of the Category / Game 8",
        type: "string",
      },
      {
        name: "ChannelToOverwatch8Parent",
        title: "Parent channel of the overwatched channel 8",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch8",
        title: "Channel to overwatch 8",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch9Name",
        title: "Name of the Category / Game 9",
        type: "string",
      },
      {
        name: "ChannelToOverwatch9Parent",
        title: "Parent channel of the overwatched channel 9",
        type: "channel",
      },
      {
        name: "ChannelToOverwatch9",
        title: "Channel to overwatch 9",
        type: "channel",
      },
    ],
  },
  function (sinusbot, config) {
    const event = require("event");
    const backend = require("backend");

    const gameChannel = [];

    let initialConnect = true;

    // if a user requests manually a channel
    event.on("chat", (e) => {
      if (e.text.startsWith("!cc")) {
        handleChatEvent(e);
      }
    });

    // check if after a client moved if a overwatched channel got full and if the naming is still right
    event.on("clientMove", () => {
      // if the bot just connected on the TS, he needs time find all channel to overwatch
      // the first check is 2 seconds delayed, otherwise he will run into an error
      if (initialConnect) {
        setTimeout(() => {
          getUserInDefaultChannel();
          initialConnect = false;
        }, 2000);
      } else {
        getUserInDefaultChannel();
        checkChannelNameOrder();
      }
    });

    // if the bot connects, populate the gamechannel arrays with the TS Gamechannel to watch
    event.on("connect", () => {
      populateGameChannelArrays();
    });

    // if a channel got deleted, check if the naming of the other channels is still right
    event.on("channelDelete", () => {
      checkChannelNameOrder();
    });

    // find all channels to overwatch
    const populateGameChannelArrays = () => {
      if (config.ChannelToOverwatch1Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch1Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch1.toString()),
          ],
          parentChannel: config.ChannelToOverwatch1Parent,
        });
      }
      if (config.ChannelToOverwatch2Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch2Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch2.toString()),
          ],
          parentChannel: config.ChannelToOverwatch2Parent,
        });
      }
      if (config.ChannelToOverwatch3Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch3Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch3.toString()),
          ],
          parentChannel: config.ChannelToOverwatch3Parent,
        });
      }
      if (config.ChannelToOverwatch4Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch4Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch4.toString()),
          ],
          parentChannel: config.ChannelToOverwatch4Parent,
        });
      }
      if (config.ChannelToOverwatch5Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch5Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch5.toString()),
          ],
          parentChannel: config.ChannelToOverwatch5Parent,
        });
      }
      if (config.ChannelToOverwatch6Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch6Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch6.toString()),
          ],
          parentChannel: config.ChannelToOverwatch6Parent,
        });
      }
      if (config.ChannelToOverwatch7Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch7Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch7.toString()),
          ],
          parentChannel: config.ChannelToOverwatch7Parent,
        });
      }
      if (config.ChannelToOverwatch8Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch8Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch8.toString()),
          ],
          parentChannel: config.ChannelToOverwatch8Parent,
        });
      }
      if (config.ChannelToOverwatch9Parent) {
        gameChannel.push({
          gameName: config.ChannelToOverwatch9Name,
          gameArray: [
            backend.getChannelByID(config.ChannelToOverwatch9.toString()),
          ],
          parentChannel: config.ChannelToOverwatch9Parent,
        });
      }
    };

    // check if the channel names are in ascending order
    const checkChannelNameOrder = () => {
      // loop through all known games
      for (const game of gameChannel) {
        if (game.gameArray.length > 1) {
          // loop though all know game channels
          for (let i = 1; i < game.gameArray.length; i++) {
            const clientCount = game.gameArray[i].getClientCount();
            // get the index of the channel room number
            const roomNumberIndex = game.gameArray[i].name().search(/(#\d)/g);
            // filter the room number from the channel name
            const roomNumber = parseInt(
              game.gameArray[i]
                .name()
                .substring(roomNumberIndex + 1, roomNumberIndex + 2)
            );

            let maxUser = "";
            // check if the room is a MAX room
            const isMaxRoom = game.gameArray[i].name().includes("MAX");
            if (isMaxRoom) {
              // get the index of the MAX number
              const maxUserIndex = game.gameArray[i].name().search(/(MAX)/g);
              // filter the MAX number from the channel name
              maxUser = game.gameArray[i]
                .name()
                .substring(maxUserIndex + 3, maxUserIndex + 4);
            }

            // check if the current roomnumber is different through the expected one (second channel should have #2, third #3, ...)
            // or if an empty channel is a max channel
            if (roomNumber !== i + 1 || (isMaxRoom && clientCount === 0)) {
              let newRoomName = "";
              if ((isMaxRoom && clientCount === 0) || !isMaxRoom) {
                newRoomName = `~ Raum #${i + 1}`;
                game.gameArray[i].update({ name: newRoomName, maxClients: -1 });
              } else {
                newRoomName = `~ Raum #${i + 1} MAX${maxUser}`;
                game.gameArray[i].update({ name: newRoomName });
              }
            }
          }
        }
      }
    };

    // checks if the default game channels are full or if there are more than one free channel
    const getUserInDefaultChannel = () => {
      // loop through all the games and perform a check on free channel
      for (const game of gameChannel) {
        let emptyChannels = 0;
        // check if all channels are full
        for (const channel of game.gameArray) {
          if (channel.getClientCount() === 0) {
            emptyChannels++;
          }
        }
        // if all channels are full, create a new one
        if (emptyChannels === 0) {
          generateChannel({
            parentChannel: game.parentChannel,
            gameArray: game.gameArray,
            game: game.gameName,
          });
        }
        // if there is more than one empty channel, delete it (overwatched channels are ignored)
        else if (emptyChannels > 1) {
          for (let i = 1; i < game.gameArray.length; i++) {
            if (game.gameArray[i].getClientCount() === 0) {
              game.gameArray[i].delete();
              game.gameArray.splice(i, 1);
              // break prevents multiple channel deletions
              break;
            }
          }
        }
      }
    };

    // creates new channels with the arguments provided
    const generateChannel = ({
      parentChannel,
      maxClients = -1,
      creator = null,
      gameArray,
    }) => {
      let channelName = "";
      let newRoomNumber = gameArray.length + 1;

      // check if a MAX client channel is requested
      if (maxClients === -1) {
        channelName = `~ Raum #${newRoomNumber} `;
      } else {
        channelName = `~ Raum #${newRoomNumber} MAX${maxClients}`;
      }
      const channelParams = {
        name: channelName,
        parent: parentChannel,
        maxClients: maxClients,
        permanent: true,
      };
      // create the new channel and add it to the channels to overwatch
      const newChannel = backend.createChannel(channelParams);
      gameArray.push(newChannel);

      // if the channel creation was requested by a user, move the user into the channel
      if (creator) {
        creator.moveTo(newChannel);
      }
    };

    // handles the user request for a new channel
    const handleChatEvent = (event) => {
      // check if the request comes from a valid user
      const clientServerGroups = event.client.getServerGroups();
      for (const serverGroup of clientServerGroups) {
        if (serverGroup.id() === "8") {
          event.client.chat("You don't have the permission to do a request.");
          event.client.chat(
            "If you want to talk to an admin, please go into our support channel"
          );
          return;
        }
      }

      // convert die text into an array
      const msgArray = event.text.split(" ");
      const client = event.client;
      const gameNames = [];
      let requestedGame = "";
      let requestedMaxUser = "";

      // loop through all games/categories
      for (const game of gameChannel) {
        gameNames.push(game.gameName);
      }
      // throw error if too many arguments are provided
      if (msgArray.length !== 3) {
        event.client.chat(
          "Wrong request! Please try again or read the description of the channel: Channelbot Commands"
        );
      }
      // if the request has the correct length, check if the request is valid
      else if (msgArray.length === 3) {
        // stores the given arguments
        const firstArg = msgArray[1];
        const secondArg = msgArray[2];

        // first argument was game
        if (
          gameNames.includes(firstArg) &&
          parseInt(secondArg) !== NaN
        ) {
          requestedGame = firstArg;
          requestedMaxUser = secondArg;
        }
        // first argument was max clients
        else if (
          parseInt(firstArg) !== NaN &&
          gameNames.includes(secondArg)
        ) {
          requestedGame = secondArg;
          requestedMaxUser = firstArg;
        }
        // wrong arguments provided
        else {
          event.client.chat(
            "Wrong request! Please try again or read the description of the channel: Channelbot Commands"
          );
          return
        }
        // find the requested game/category from the overwatched
        const game = gameChannel.find(
          (game) => game.gameName === requestedGame
        );
        generateChannel({
          parentChannel: game.parentChannel,
          maxClients: requestedMaxUser,
          creator: client,
          gameArray: game.gameArray,
        });
      }
    };
  }
);
