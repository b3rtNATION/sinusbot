registerPlugin(
  {
    name: "TwitchLiveButler",
    version: "0.1",
    description: "Manages Twitch Live state",
    author: "rob",
    requiredModules: ["http"],
    vars: [
      {
        name: "TwitchClientID",
        title: "The client id from your app in the Twitch dev console",
        type: "string",
        placeholder: "Looks like this: e9asdn80nlrsxl0fdsh8uxfym6wr",
      },
      {
        name: "TwitchClientSecret",
        title: "The client secret from your app in the Twitch dev console",
        type: "string",
        placeholder: "Looks like this: e9asdn80nlrsxl0fdsh8uxfym6wr",
      },
      {
        name: "UpdateTime",
        title: "Time between the checks if the user is live (in milliseconds)",
        type: "number",
        placeholder: "Default = 10000ms = 30s",
        default: 30000,
      },
      {
        name: "TwitchGroupID",
        title: "The twitch group id from your Teamspeak",
        type: "number",
      },
    ],
  },
  function (sinusbot, config) {
    const backend = require("backend");
    const http = require("http");

    const setTwitchStatus = (client) => {
      const clientGroups = client.getServerGroups();

      // get user description, transform it into an array and search for the "TWITCH" tag
      const userdescription = client.description();
      if (!userdescription.includes("TWITCH")) {
        return;
      }
      let twitchName = "";
      const userDescriptionArray = userdescription.split(" ");
      for (const description of userDescriptionArray) {
        // remove the TWITCH tag from the description and set the remaining name as twitch name
        if (description.includes("TWITCH")) {
          twitchName = description.substring(6, description.length).trim();
        }
      }

      //authorize to get the OAuth Token
      let accessToken = "";
      http.simpleRequest(
        {
          method: "POST",
          url:
            "https://id.twitch.tv/oauth2/token?client_id=" +
            config.TwitchClientID +
            "&client_secret=" +
            config.TwitchClientSecret +
            "&grant_type=client_credentials",
          timeout: 6000,
          body: "",
        },
        (err, res) => {
          if (err) console.log(err);
          const responseAsObject = JSON.parse(res.data);
          accessToken = responseAsObject.access_token;
          // get the channel info
          http.simpleRequest(
            {
              method: "GET",
              url:
                "https://api.twitch.tv/helix/search/channels?query=" +
                twitchName,
              timeout: 6000,
              headers: {
                "Client-ID": config.TwitchClientID,
                Authorization: "Bearer " + accessToken,
              },
            },
            (err, res) => {
              if (err) console.log(err);
              let hasGroup = false;
              let isOff = true;
              const twitchnameResponseAsObject = JSON.parse(res.data);

              // check if client is already in Twitch live group
              for (const group of clientGroups) {
                if (group.id() == config.TwitchGroupID) {
                  hasGroup = true;
                }
              }

              // check the responded data if the user is offline
              for (const broadcaster of twitchnameResponseAsObject.data) {
                if (
                  broadcaster.display_name.toLowerCase() ===
                  twitchName.toLowerCase()
                ) {
                  if (broadcaster.is_live && hasGroup) {
                    isOff = false;
                    break;
                  } else if (broadcaster.is_live && !hasGroup) {
                    // add the user to the TwitchLive group
                    isOff = false;
                    client.addToServerGroup(config.TwitchGroupID);
                    backend.chat(`${client.name()} is live on Twitch! Join the stream on https://www.twitch.tv/${twitchName} !`)
                    break;
                  }
                }
              }
              if (isOff && hasGroup) {
                client.removeFromServerGroup(config.TwitchGroupID);
              }
            }
          );
        }
      );
    };

    setInterval(() => {
      let allClients = backend.getClients();
      for (const client of allClients) {
        setTwitchStatus(client);
      }
    }, config.UpdateTime);
  }
);
