registerPlugin(
  {
    name: "Apex Rank-Butler",
    version: "1.0",
    description: "Manages apex ranks automatically",
    author: "Robert Toenne <b3rrr7@gmail.com>",
    requiredModules: ["http"],
    vars: [
      {
        name: "ApexDeveloperApiKey",
        title: "Official Apex Developer API Key needed",
        type: "string",
        placeholder: "Looks like this: He77QuyEgliRE4pbOO56",
      },
      {
        name: "Bronze",
        title: "Input GroupID of Apex Bronze",
        type: "string",
      },
      {
        name: "Silver",
        title: "Input GroupID of Apex Silver",
        type: "string",
      },
      {
        name: "Gold",
        title: "Input GroupID of Apex Gold",
        type: "string",
      },
      {
        name: "Platin",
        title: "Input GroupID of Apex Platin",
        type: "string",
      },
      {
        name: "Diamond",
        title: "Input GroupID of Apex Diamond",
        type: "string",
      },
      {
        name: "Master",
        title: "Input GroupID of Apex Master",
        type: "string",
      },
      {
        name: "Predator",
        title: "Input GroupID of Apex Predator",
        type: "string",
      },
    ],
  },
  function (sinusbot, config) {
    const event = require("event");
    const backend = require("backend");
    const http = require("http");

    const apexRankGroups = [
      { id: config.Bronze, level: 1, name: "Bronze" },
      { id: config.Silver, level: 2, name: "Silver" },
      { id: config.Gold, level: 3, name: "Gold" },
      { id: config.Platin, level: 4, name: "Platinum" },
      { id: config.Diamond, level: 5, name: "Diamond" },
      { id: config.Master, level: 6, name: "Master" },
      { id: config.Predator, level: 7, name: "Predator" },
    ];

    event.on("clientVisible", (ev) => {
      verifyApexRank(ev.client);
    });

    event.on("chat", (ev) => {
      if (ev.text.startsWith("!rankupdate")) {
        // update faceit rank of all clients
        updateAllApexRanks();
      }
    });

    const updateAllApexRanks = () => {
      const allClients = backend.getClients();
      allClients.forEach((client) => {
        setTimeout(() => {
          verifyApexRank(client)
        }, 500);
      });
    };

    const verifyApexRank = (client) => {
      const apexName = getApexNameFromDescription(client);
      if(apexName) {
        fetchApexRank(apexName).then((apexRank) => {
          setApexRank(client, apexRank);
        });
      }
    };

    const getApexNameFromDescription = (client) => {
      const userdescription = client.description();
      if (!userdescription.includes("APEX")) {
        return false;
      }
      const userDescriptionArray = userdescription.split(" ");
      for (const description of userDescriptionArray) {
        if (description.includes("APEX")) {
          return description.substring(4, description.length).trim();
        }
      }
    };

    const fetchApexRank = (apexName) => {
      return new Promise((resolve, reject) => {
        http.simpleRequest(
          {
            method: "GET",
            url:
              "https://api.mozambiquehe.re/bridge?version=5&platform=PC&player=" +
              apexName +
              "&auth=" +
              config.ApexDeveloperApiKey,
            timeout: 6000,
          },
          (error, response) => {
            if (error) {
              console.log(error);
              reject(error);
            }
            const responseData = JSON.parse(response.data)
            let fetchedApexRank = responseData.global.rank.rankName;
            resolve(fetchedApexRank);
          }
        );
      });
    };

    const setApexRank = (client, fetchedApexRankName) => {
      const currentApexRankName = getCurrentApexRankName(client);
      if (!currentApexRankName) {
        setNewApexRankGroup(client, rankNameToGroupID(fetchedApexRankName));
      } else if (currentApexRankName === fetchedApexRankName) {
        return;
      } else {
        setNewApexRankGroup(client, rankNameToGroupID(fetchedApexRankName));
        removeCurrentApexRankGroup(client, rankNameToGroupID(currentApexRankName));
      }
    };

    const getCurrentApexRankName = (client) => {
      const clientServerGroups = client.getServerGroups();
      for (const serverGroup of clientServerGroups) {
        for (const rank of apexRankGroups) {
          if (rank.level === groupIDToValue(serverGroup.id())) return rank.name;
        }
      }
      return false;
    };

    const groupIDToValue = (id) => {
      for (const group of apexRankGroups) {
        if (group.id === id) return group.level;
      }
    };

    const rankNameToGroupID = (apexRank) => {
      for (const group of apexRankGroups) {
        if (group.name === apexRank) return group.id;
      }
    };

    const setNewApexRankGroup = (client, groupID) => {
      client.addToServerGroup(groupID);
    };

    const removeCurrentApexRankGroup = (client, groupID) => {
      client.removeFromServerGroup(groupID);
    };

    const startAutoRefresh = () => {
      setTimeout(() => {
        updateAllApexRanks();
      }, 300000);
    };

    startAutoRefresh();
  }
);
