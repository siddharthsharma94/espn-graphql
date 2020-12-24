const { parseConfig } = require("@graphql-mesh/config");
const { getMesh } = require("@graphql-mesh/runtime");
const path = require("path");
const { ApolloServer } = require("apollo-server-micro");
import "@graphql-mesh/json-schema";
import "@graphql-mesh/transform-rename";
// In a production environment we would want to secure this endpoint

const apiKey = process.env.FINNHUB_API_KEY;

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

module.exports = async (req, res) => {
  const { body } = req;
  const now = new Date();
  const parsedConfig = await parseConfig({
    sources: [
      {
        name: "ESPN API",
        handler: {
          jsonSchema: {
            baseUrl: "http://site.web.api.espn.com",
            operations: [
              {
                field: "nflScoreboard",
                description: "Get the nfl scores",
                path: `/apis/site/v2/sports/football/nfl/scoreboard?dates={args.date}`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  date: "String",
                  description: "Scores",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nfl/scoreboard.json"
                ),
              },
              {
                field: "nflGameStats",
                description: "Get the nfl stats of an indiviual game",
                path: `/apis/site/v2/sports/football/nfl/summary?event={args.gameId}`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  gameId: "String",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nfl/game.json"
                ),
              },
              {
                field: "nflPlayerStats",
                description: "Get the nfl stats of an indiviual game",
                path: `/apis/common/v3/sports/football/nfl/athletes/{args.playerId}`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  playerId: "String",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nfl/player.json"
                ),
              },
              {
                field: "nbaScoreboard",
                description: "Get the nba scores",
                path: `/apis/site/v2/sports/basketball/nba/scoreboard?dates={args.date}`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  date: "String",
                  description: "Scores",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nba/scoreboard.json"
                ),
              },
              {
                field: "nbaTeam",
                description: "Get the nba team information",
                path: `/apis/site/v2/sports/basketball/nba/teams/{args.teamId}`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  teamId: "String",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nba/team.json"
                ),
              },
              {
                field: "nbaNews",
                description: "Get the nba news",
                path: `/apis/site/v2/sports/basketball/nba/news`,
                type: "Query",
                method: "GET",
                argTypeMap: {
                  teamId: "String",
                },
                responseSchema: path.join(
                  __dirname,
                  "..",
                  "./json-samples/nba/news.json"
                ),
              },
            ],
          },
        },
      },
    ],
    serve: {
      exampleQuery: path.join(__dirname, "..", "example-query.graphql"),
    },
  });

  const { schema, contextBuilder: context } = await getMesh(parsedConfig);

  return new ApolloServer({
    schema,
    context,
    introspection: true,
    playground: true,
  }).createHandler({ path: "/api/graphql" })(req, res);
};
