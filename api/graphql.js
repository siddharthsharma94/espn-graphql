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
            baseUrl: "http://site.api.espn.com/apis/site/v2/sports",
            operations: [
              {
                field: "nflScoreboard",
                description: "Get the nfl scores",
                path: `/football/nfl/scoreboard?dates={args.date}`,
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
                path: `/football/nfl/summary?event={args.gameId}`,
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
                field: "nbaScoreboard",
                description: "Get the nba scores",
                path: `/basketball/nba/scoreboard?dates={args.date}`,
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
