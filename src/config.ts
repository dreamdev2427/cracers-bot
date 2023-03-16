const dotenv = require("dotenv");

dotenv.config();

const config = {
  SkateContract: {
    1: "0xC28e0d3c00296dD8c5C3F2E9707361920f92a209", // old 0x494715B2a3C75DaDd24929835B658a1c19bd4552
  },
  SkateSettleContract: {
    1: "0x465a677f7BA1D804B092065e2464d86D0790071b",
  },
  Events: {
    AuctionCreated: "AuctionCreated",
    AuctionBid: "AuctionBid",
    AuctionSettled: "AuctionSettled",
    // MinBidIncrementPercentageUpdated: "MinBidIncrementPercentageUpdated",
    MinBidIncrementPercentageUpdated: "AuctionMinBidIncrementPercentageUpdated",
    // ReservePriceUpdated: "ReservePriceUpdated",
    ReservePriceUpdated: "AuctionReservePriceUpdated",
  },
  BlockExplorerURL: {
    1: "https://etherscan.io",
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
  },
  RpcURL: {
    wss: {
      1: "wss://mainnet.infura.io/ws/v3/9254bae6432742babcfc7d367c7e77cd",
    },
    https: {
      1: "https://mainnet.infura.io/v3/9254bae6432742babcfc7d367c7e77cd",
      56: "https://bsc-dataseed1.defibit.io/",
      97: "https://speedy-nodes-nyc.moralis.io/03eb35954a0b7ed092444a8e/bsc/testnet",
    },
  },
  chainHexID: {
    1: "0x1",
    56: "0x38",
    97: "0x61",
  },
  chainID: 1,
  startBlock: 14211104,
  SNIPER_ROLE: process.env.DISCORD_SNIPER_ROLE,
  eth_api_key: process.env.ETH_API_KEY,
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  redisHost: process.env.REDIS_HOST ?? "localhost",
  redisDb: Number(process.env.REDIS_DB ?? 0),
  redisPassword: process.env.REDIS_PASSWORD,
  nounsSubgraph:
    process.env.NOUNS_SUBGRAPH_URL ??
    "https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph",
  twitterEnabled: process.env.TWITTER_ENABLED === "true",
  twitterAppKey: process.env.TWITTER_APP_KEY ?? "",
  twitterAppSecret: process.env.TWITTER_APP_SECRET ?? "",
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET ?? "",
  nounsTokenAddress:
    process.env.NOUNS_TOKEN_ADDRESS ??
    "0x494715B2a3C75DaDd24929835B658a1c19bd4552",
  jsonRpcUrl:
    process.env.JSON_RPC_URL ??
    "wss://mainnet.infura.io/ws/v3/9254bae6432742babcfc7d367c7e77cd",
  discordEnabled: process.env.DISCORD_ENABLED === "true",
  discordWebhookToken: process.env.DISCORD_WEBHOOK_TOKEN ?? "",
  discordWebhookId: process.env.DISCORD_WEBHOOK_ID ?? "",
  discordPublicWebhookToken: process.env.DISCORD_PUBLIC_WEBHOOK_TOKEN ?? "",
  discordPublicWebhookId: process.env.DISCORD_PUBLIC_WEBHOOK_ID ?? "",
  pinataEnabled: process.env.PINATA_ENABLED === "true",
  pinataApiKey: process.env.PINATA_API_KEY ?? "",
  pinataApiSecretKey: process.env.PINATA_API_SECRET_KEY ?? "",
};

export default config;
