import { ethers } from "ethers";
import sharp from "sharp";
import { isError, tryF } from "ts-try";
import { AuctionSettled, Bid, TokenMetadata } from "./types";
import config from "./config";
import Web3 from "web3";
const SkateABI = require("./abis/SkateContract");
/**
 * Try to reverse resolve an ENS domain and return it for display,
 * If no result truncate the address and return it
 * @param address The address to ENS lookup or format
 * @returns The resolved ENS lookup domain or a formatted address
 */
export async function resolveEnsOrFormatAddress(address: string) {
  return (
    (await ethers.getDefaultProvider().lookupAddress(address)) ||
    `${address.substr(0, 4)}...${address.substr(address.length - 4)}`
  );
}

/**
 * Get tweet text for auction started.
 * @param auctionId The started auction id.
 * @param durationSeconds The duration of the auction in seconds.
 * @returns Text to be used in tweet when auction starts.
 */
export function formatAuctionStartedTweetText(auctionId: number) {
  return `＊Kick Push Coast＊
        
 An auction has started for Gnar #${auctionId}

 Learn more at https://gnars.wtf/`;
}

/**
 * Get the formatted text for a new bid.
 * @param id The auction/noun id
 * @param bid The amount of the current bid
 * @returns The bid update tweet text
 */
export async function formatBidMessageText(id: number, bid: Bid) {
  const bidder = await resolveEnsOrFormatAddress(bid.bidder.id);
  return `Gnar ${id} has received a bid of Ξ${ethers.utils.formatEther(
    bid.amount
  )} from ${bidder}`;
}

export async function formatSettledMessageText(
  id: number,
  auctionSettled: AuctionSettled
) {
  const winner = await resolveEnsOrFormatAddress(auctionSettled.winner);
  return `Auction of Gnars ${id} has just settled as Ξ${ethers.utils.formatEther(
    auctionSettled.amount
  )} ETH by ${winner}`;
}

export async function formatEndingSoonMessageText(id: number, restBN: number) {
  // return `Last chance to bid on Gnar ${id}... Don't miss out!`;
  return `Last chance to bid on Gnar ${id}... Don't miss out!`;
}

/**
 * Get the tweet text for an auction ending soon.
 * @returns The auction ending soon text
 */
export function getAuctionEndingSoonTweetText(id: number, restBN: number) {
  return `Auction for Gnar ${id} ending soon...

  Bid now at https://gnars.wtf/`;
}

/**
 * Get the PNG buffer data of a Gnars
 * @param tokenId The ERC721 token id
 * @returns The png buffer of the Gnars or undefined
 */
export async function getNounPngBuffer(
  tokenId: string
): Promise<Buffer | undefined> {
  // const dataURI = await tryF(() => nounsTokenContract.owner());
  // @ts-ignore
  const web3WSS = new Web3(config.RpcURL.wss[config.chainID]);
  // @ts-ignore
  const SkateContract = new web3WSS.eth.Contract(
    SkateABI,
    // @ts-ignore
    config.SkateContract[config.chainID]
  );

  const dataURI = await tryF(() =>
    SkateContract.methods.tokenURI(tokenId).call()
  );
  if (isError(dataURI)) {
    console.error(
      `Error fetching dataURI for token ID ${tokenId}: ${dataURI.message}`
    );
    return;
  }

  const data: TokenMetadata = JSON.parse(
    Buffer.from(dataURI.substring(29), "base64").toString("ascii")
  );
  const svg = Buffer.from(data.image.substring(26), "base64");
  return sharp(svg).png().toBuffer();
}

/**
 * Generate a counter name with the appropriate
 * prefix
 * @param counterName Counter name to prefix
 * @returns Prefixed counter name
 */
export const buildCounterName = (counterName: string) => `bots_${counterName}`;
