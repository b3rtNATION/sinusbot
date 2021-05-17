registerPlugin(
  {
    name: "Faceit Rank-Butler",
    version: "1.0",
    description: "Manages faceit ranks automatically",
    author: "Robert Toenne <b3rrr7@gmail.com>",
    requiredModules: ["http"],
    vars: [
      {
        name: "FaceitDeveloperAppApiKey",
        title: "Official Faceit Developer API Key needed",
        type: "string",
        placeholder: "Looks like this: 5fD34sd2d-a634-3aOE-a4bc-48d53hh48392",
      },
      {
        name: "FaceitOne",
        title: "Input GroupID of Faceit Level 1 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitTwo",
        title: "Input GroupID of Faceit Level 2 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitThree",
        title: "Input GroupID of Faceit Level 3 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitFour",
        title: "Input GroupID of Faceit Level 4 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitFive",
        title: "Input GroupID of Faceit Level 5 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitSix",
        title: "Input GroupID of Faceit Level 6 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitSeven",
        title: "Input GroupID of Faceit Level 7 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitEight",
        title: "Input GroupID of Faceit Level 8 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitNine",
        title: "Input GroupID of Faceit Level 9 (Group ID)",
        type: "number",
      },
      {
        name: "FaceitTen",
        title: "Input GroupID of Faceit Level 10 (Group ID)",
        type: "number",
      },
    ],
  },
  function (sinusbot, config) {
    const event = require("event");
    const backend = require("backend");
    const http = require("http");

    const faceitRankGroups = [
      { id: config.FaceitOne, level: 1 },
      { id: config.FaceitTwo, level: 2 },
      { id: config.FaceitThree, level: 3 },
      { id: config.FaceitFour, level: 4 },
      { id: config.FaceitFive, level: 5 },
      { id: config.FaceitSix, level: 6 },
      { id: config.FaceitSeven, level: 7 },
      { id: config.FaceitEigent, level: 8 },
      { id: config.FaceitNine, level: 9 },
      { id: config.FaceitTen, level: 10 },
    ];

    // when a client connects, check if he has a faceit rank and if it's up to date
    event.on("clientVisible", (ev) => {
      verifyFaceitRank(ev.client);
    });

    event.on("chat", (ev) => {
      if (ev.text.startsWith("!rankupdate")) {
        // update faceit rank of all clients
        updateAllFaceitRanks();
      }
    });

    const updateAllFaceitRanks = () => {
      const allClients = backend.getClients();
      allClients.forEach((client) => verifyFaceitRank(client));
    };

    // main function to update faceit level
    const verifyFaceitRank = (client) => {
      const faceitName = getFaceitName(client);
      if (faceitName) {
        getFaceitLevel(faceitName).then((level) => {
          setFaceitRank(client, level);
        });
      }
    };

    const getFaceitName = (client) => {
      const userdescription = client.description();
      if (!userdescription.includes("FACEIT")) {
        return false;
      }
      const userDescriptionArray = userdescription.split(" ");
        for (const description of userDescriptionArray) {
          if (description.includes("FACEIT")) {
            return description.substring(6, description.length).trim();
          }
      }
    };

    const getFaceitLevel = (faceitNickname) => {
      return new Promise((resolve, reject) => {
        http.simpleRequest(
          {
            method: "GET",
            url:
              "https://open.faceit.com/data/v4/players?nickname=" +
              faceitNickname,
            timeout: 6000,
            headers: {
              accept: "application/json",
              Authorization: config.FaceitDeveloperAppApiKey,
            },
          },
          (error, response) => {
            if (error) {
              console.log(error);
              reject(error);
            }
            let responseData = JSON.parse(response.data);
            let fetchedFaceitLevel = responseData.games.csgo.skill_level;
            resolve(fetchedFaceitLevel);
          }
        );
      });
    };

    const getCurrentFaceitLevelGroupID = (client) => {
      const clientServerGroups = client.getServerGroups();
      for (const serverGroup of clientServerGroups) {
        for (const rank of faceitRankGroups) {
          if (serverGroup.id() == rank.id) {
            return serverGroup.id();
          }
        }
      }
      return false;
    };

    const setFaceitRank = (client, fetchedFaceitRank) => {
      const currentRank = getCurrentFaceitLevelGroupID(client);
      const newRank = faceitLevelToGroupID(fetchedFaceitRank);
      if (!currentRank) {
        setNewFaceitLevelGroup(client, newRank);
      }
      // set new faceit rank if current is not equal to fetched rank
      else if (currentRank != newRank) {
        setNewFaceitLevelGroup(client, newRank);
        removeCurrentFaceitLevelGroup(client, currentRank);
      }
    };

    const faceitLevelToGroupID = (faceitLevel) => {
      for (const faceitGroup of faceitRankGroups) {
        if (faceitGroup.level == faceitLevel) {
          return faceitGroup.id;
        }
      }
    };

    const setNewFaceitLevelGroup = (client, level) => {
      client.addToServerGroup(level);
    };

    const removeCurrentFaceitLevelGroup = (client, level) => {
      client.removeFromServerGroup(level);
    };

    const startAutoRefresh = () => {
      setTimeout(() => {
        updateAllFaceitRanks();
      }, 300000);
    };

    startAutoRefresh();
  }
);
