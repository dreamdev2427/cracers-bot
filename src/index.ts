import Web3 from "web3";
import config from "./config";
const SkateABI = require("./abis/SkateContract");

import { internalDiscordWebhook } from "./clients";
import { IAuctionLifecycleHandler, AuctionBids } from "./types";
import { TwitterAuctionLifecycleHandler } from "./handlers/twitter";
import { DiscordAuctionLifecycleHandler } from "./handlers/discord";
import {
  getNounPngBuffer,
} from "./utils";

// @ts-ignore
const web3WSS = new Web3(config.RpcURL.wss[config.chainID]);
const SkateContract = new web3WSS.eth.Contract(
  SkateABI,
  // @ts-ignore
  config.SkateContract[config.chainID]
);

let auctionBid: AuctionBids = {
  id: 0,
  endTime: 0,
  bids: [
    {
      id: " ",
      amount: " ",
      bidder: { id: " " },
    },
  ],
};
let curBN = config.startBlock;
let lastBN = curBN;
let counter = 0;
let endingSoonFlag = true;
let lastGnarID = 0;

/**
 * Create configured `IAuctionLifecycleHandler`s
 */
const auctionLifecycleHandlers: IAuctionLifecycleHandler[] = [];
if (config.twitterEnabled) {
  auctionLifecycleHandlers.push(new TwitterAuctionLifecycleHandler());
}
if (config.discordEnabled) {
  auctionLifecycleHandlers.push(
    new DiscordAuctionLifecycleHandler([internalDiscordWebhook])
  );
}

/**
 * Process the last auction, update cache and push socials if new auction or respective bid is discovered
 */
async function processAuctionTick() {
  console.log("=========== start");
  counter++;
  try {
    lastBN = await web3WSS.eth.getBlockNumber();
    lastBN = lastBN - 1;
    // lastBN = ((curBN + 665) > lastBN) ? lastBN : (curBN + 665);
    console.log("curBN: ", curBN);
    console.log("lastBN: ", lastBN);
    console.log("counter: ", counter);
    console.log("endingSoonFlag: ", endingSoonFlag);
    console.log("lastGnarID: ", lastGnarID);
    console.log("=========== middle");
    if (lastBN > curBN) {
      const auction = await SkateContract.methods.auction().call();
      console.log("restBN: ", auction.endBlock - lastBN);
      console.log("gnarID: ", auction.gnarId);

      if (auction.gnarId > lastGnarID) {
        if (lastBN > auction.startBlock && lastBN - auction.startBlock < 50) {
          const png = await getNounPngBuffer(auction.gnarId.toString());
          if (png) {
            console.log("get png success");
            const createAuctionEvents = await SkateContract.getPastEvents("AuctionCreated", {
              fromBlock: auction.startBlock,
              toBlock: lastBN,
            });
            console.log("AuctionCreated length : ", createAuctionEvents.length);
            if (createAuctionEvents.length > 0) {
              for (let i = 0; i < createAuctionEvents.length; i++) {
                if (auction.gnarId == createAuctionEvents[i].returnValues.gnarId) {
                  console.log(`     AuctionCreated: gnarID: ${createAuctionEvents[i].returnValues.gnarId}`);
                  endingSoonFlag = true;
                  await Promise.all(
                    auctionLifecycleHandlers.map((h) =>
                      h.handleNewAuction(createAuctionEvents[i].returnValues.gnarId)
                    )
                  );
                }
              }
              lastGnarID = auction.gnarId;
            }
          } else {
            console.log("get png fail");
          }
        }
      }

      if (
        auction.gnarId == lastGnarID &&
        auction.startBlock < lastBN &&
        auction.endBlock > lastBN &&
        auction.endBlock - lastBN < 45
      ) {
        if (endingSoonFlag == true) {
          endingSoonFlag = false;
          await Promise.all(
            auctionLifecycleHandlers.map((h) =>
              h.handleAuctionEndingSoon(auction.gnarId, auction.endBlock - lastBN)
            )
          );
          console.log(`Auction ending soon: gnarID: ${auction.gnarId}`);
        }
      }

      if (auction.gnarId == lastGnarID) {
        const bidEvents = await SkateContract.getPastEvents("AuctionBid", {
          fromBlock: curBN,
          toBlock: lastBN,
        });
        console.log("AuctionBid length: ", bidEvents.length);
        if (bidEvents.length > 0) {
          for (let i = 0; i < bidEvents.length; i++) {
            console.log(`     AuctionBid: gnarID: ${bidEvents[i].returnValues.gnarId}`);
            auctionBid.id = bidEvents[i].returnValues.gnarId;
            auctionBid.endTime = bidEvents[i].returnValues.timestamp;
            auctionBid.bids[0].id = bidEvents[i].returnValues.gnarId;
            auctionBid.bids[0].bidder.id = bidEvents[i].returnValues.sender;
            auctionBid.bids[0].amount = bidEvents[i].returnValues.value;
            await Promise.all(
              auctionLifecycleHandlers.map((h) =>
                h.handleNewBid(auctionBid.id, auctionBid.bids[0])
              )
            );
          }
        }

        curBN = lastBN + 1;
      }
    } else {
      console.log("lastBN < curBN");
    }
  } catch (error) {
    console.log(error);
  }
  console.log("=========== end");
  console.log(" ");
}

async function init() {
  try {
    console.log("start init");
    curBN = await web3WSS.eth.getBlockNumber();
    const auction = await SkateContract.methods.auction().call();
    lastGnarID = (curBN - auction.startBlock < 50) ? auction.gnarId - 1 : auction.gnarId;
    // curBN = 14420000;
    console.log("curBN: ", curBN);
    console.log("auction.startBlock: ", auction.startBlock);
    console.log("diff: ", curBN - auction.startBlock);
    console.log("auction.GnarID: ", auction.gnarId);
    console.log("lastGnarID: ", lastGnarID);
    processAuctionTick().then();
    setInterval(async () => processAuctionTick(), 30000);
  } catch (error) {
    curBN = config.startBlock;
    console.log(error);
  }
}

console.log("start BOT");
init().then();
