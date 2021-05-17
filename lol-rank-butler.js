registerPlugin(
  {
    name: "League Of Legends Rank-Butler",
    version: "1.0",
    description: "Manages league of legends ranks automatically",
    author: "Robert Toenne <b3rrr7@gmail.com>",
    requiredModules: ["http"],
    vars: [
      {
        name: "LeagueApiKey",
        title: "Official League of Legends Developer API Key needed",
        type: "string",
        placeholder: "Looks like this: 5fD34sd2d-a634-3aOE-a4bc-48d53hh48392",
      },
      {
        name: "Unranked",
        title: "GroupID Unranked",
        type: "string",
      },
      {
        name: "Iron",
        title: "GroupID Iron",
        type: "string",
      },
      {
        name: "Bronze",
        title: "GroupID Bronze",
        type: "string",
      },
      {
        name: "Silver",
        title: "GroupID Silver",
        type: "string",
      },
      {
        name: "Gold",
        title: "GroupID Gold",
        type: "string",
      },
      {
        name: "Platin",
        title: "GroupID Platin",
        type: "string",
      },
      {
        name: "Diamond",
        title: "GroupID Diamond",
        type: "string",
      },
      {
        name: "Master",
        title: "GroupID Master",
        type: "string",
      },
      {
        name: "Grandmaster",
        title: "GroupID Grandmaster",
        type: "string",
      },
      {
        name: "Challenger",
        title: "GroupID Challenger",
        type: "string",
      },
    ],
  },
  function (sinusbot, config) {
    const event = require("event");
    const backend = require("backend");
    const http = require("http");

    const leagueRanks = [
      { id: config.Unranked, rank: 0, name: "UNRANKED" },
      { id: config.Iron, rank: 1, name: "IRON" },
      { id: config.Bronze, rank: 2, name: "BRONZE" },
      { id: config.Silver, rank: 3, name: "SILVER" },
      { id: config.Gold, rank: 4, name: "GOLD" },
      { id: config.Platinum, rank: 5, name: "PLATINUM" },
      { id: config.Diamond, rank: 6, name: "DIAMOND" },
      { id: config.Master, rank: 7, name: "MASTER" },
      { id: config.Grandmaster, rank: 8, name: "GRANDMASTER" },
      { id: config.Challenger, rank: 9, name: "CHALLENGER" },
    ];

    // when a client connects, check if he has a faceit rank and if it's up to date
    event.on("clientVisible", (ev) => {
      getLeagueRank(ev.client);
    });

    event.on("chat", (ev) => {
      if (ev.text.startsWith("!rankupdate")) {
        // update faceit rank of all clients
        updateAllLeagueRanks();
      }
    });

    // sets an autorefresh timer of 30min
    const startAutoRefresh = () => {
      setTimeout(() => {
        updateAllLeagueRanks();
      }, 300000);
    };

    const updateAllLeagueRanks = () => {
      const currentClients = backend.getClients();
      for (const client of currentClients) {
        getLeagueRank(client);
      }
    };

    // if the client got a server group for a LOL Rank, this functions returns it
    const getCurrentClientServerGroupLeagueRank = (client) => {
      const clientServerGroups = client.getServerGroups();
      for (const serverGroup of clientServerGroups) {
        for (const leagueRank of leagueRanks) {
          if (serverGroup.id() == leagueRank.id) {
            return leagueRank.name;
          }
        }
      }
      return false;
    };

    // converts the rankName into a matching value
    const rankNameToValue = (rankName) => {
      for (const leagueRank of leagueRanks) {
        if (leagueRank.name === rankName) return leagueRank.rank;
      }
    };

    // converts the value of a rank into a name
    const valueToRankName = (value) => {
      for (const leagueRank of leagueRanks) {
        if (leagueRank.rank === value) return leagueRank.name;
      }
    };

    // converts the rankname into the mathing group id
    const rankNameToGroupID = (rankName) => {
      for (const leagueRank of leagueRanks) {
        if (leagueRank.name === rankName) return leagueRank.id;
      }
    };

    const setNewLeagueRank = (client, groupID) => {
      client.addToServerGroup(groupID);
    };

    const removeOldLeagueRank = (client, groupID) => {
      client.removeFromServerGroup(groupID);
    };

    const getLeagueRank = (client) => {
      const summonerName = getSummonerName(client);
      if (summonerName) {
        getEncodedSummonerName(summonerName)
          .then(getSummonerRanks)
          .then((data) => {
            verifyRank(JSON.parse(data), client);
          });
      }
    };

    const getSummonerName = (client) => {
      let summonerName = "";
      // get user description, transform it into an array and search for the "LEAGUE" tag
      const userdescription = client.description();
      if (!userdescription.includes("LEAGUE")) {
        return false;
      }
      const userDescriptionArray = userdescription.split(" ");
      for (const description of userDescriptionArray) {
        if (description.includes("LEAGUE")) {
          summonerName = description.substring(6, description.length).trim();
        }
      }

      return summonerName;
    };

    const getEncodedSummonerName = (summonerName) => {
      return new Promise((resolve, reject) => {
        http.simpleRequest(
          {
            method: "GET",
            url:
              "https://euw1.api.riotgames.com/tft/summoner/v1/summoners/by-name/" +
              summonerName,
            timeout: 6000,
            headers: {
              accept: "application/json",
              "X-Riot-Token": config.LeagueApiKey,
            },
          },
          (err, res) => {
            if (err) {
              reject(err);
            }
            const data = JSON.parse(res.data);
            resolve(data.id);
          }
        );
      });
    };

    const getSummonerRanks = (encodedSummonerName) => {
      return new Promise((resolve, reject) => {
        http.simpleRequest(
          {
            method: "GET",
            url:
              "https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" +
              encodedSummonerName,
            timeout: 6000,
            headers: {
              accept: "application/json",
              "X-Riot-Token": config.LeagueApiKey,
            },
          },
          (err, res) => {
            if (err) {
              reject(err);
            }
            resolve(res.data);
          }
        );
      });
    };

    const verifyRank = (fetchedLeagueData, client) => {
      const currentRankName = getCurrentClientServerGroupLeagueRank(client); // returns the NAME of the current rank ||
      if (fetchedLeagueData.length === 0) {
        setNewLeagueRank(client, rankNameToGroupID("UNRANKED"));
        if (currentRankName)
          removeOldLeagueRank(client, rankNameToGroupID(currentRankName));
      } else if (fetchedLeagueData.length === 1) {
        const clientRankName = fetchedLeagueData[0].tier;
        if (!currentRankName) {
          setNewLeagueRank(client, rankNameToGroupID(clientRankName));
        }
        if (clientRankName === currentRankName) {
          return;
        } else {
          setNewLeagueRank(client, rankNameToGroupID(clientRankName));
          removeOldLeagueRank(client, rankNameToGroupID(currentRankName));
        }
      } else if (fetchedLeagueData.length > 1) {
        let rankValue = 0;
        for (const data of fetchedLeagueData) {
          let rank = rankNameToValue(data.tier);
          if (rank > rankValue) {
            rankValue = rank;
          }
        }
        const clientRankName = valueToRankName(rankValue);
        if (clientRankName === currentRankName) {
          return;
        } else {
          setNewLeagueRank(client, rankNameToGroupID(clientRankName));
          removeOldLeagueRank(client, rankNameToGroupID(currentRankName));
        }
      }
    };

    startAutoRefresh();
  }
);
