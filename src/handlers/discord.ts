import Discord from "discord.js";
import {
  formatEndingSoonMessageText,
  formatSettledMessageText,
  formatBidMessageText,
  getNounPngBuffer,
} from "../utils";
import { AuctionSettled, Bid, IAuctionLifecycleHandler } from "../types";

import config from "../config";

export class DiscordAuctionLifecycleHandler
  implements IAuctionLifecycleHandler {
  constructor(public readonly discordClients: Discord.WebhookClient[]) { }

  /**
   * Send Discord message with an image of the current noun alerting users
   * @param auctionId The current auction ID
   */
  async handleNewAuction(auctionId: number): Promise<boolean> {
    try {
      // console.log(`handleNewAuction ${auctionId}`);
      const png = await getNounPngBuffer(auctionId.toString());
      if (png) {
        const attachmentName = `Auction-${auctionId}.png`;
        const attachment = new Discord.MessageAttachment(png, attachmentName);
        const message = new Discord.MessageEmbed()
          .setTitle(`New Auction Discovered`)
          .setURL("https://gnars.wtf/")
          .setDescription(`An auction has started for Gnar #${auctionId}`)
          .addField("Gnars ID", auctionId, true)
          .attachFiles([attachment])
          .setImage(`attachment://${attachmentName}`);
        // .setTimestamp();
        console.log("new auction msg with png");
        await Promise.all(this.discordClients.map((c) => c.send(message)));
        return true;
      } else {
        const message = new Discord.MessageEmbed()
          .setTitle(`New Auction Discovered`)
          .setURL("https://gnars.wtf/")
          .setDescription(`An auction has started for Gnar #${auctionId}`)
          .addField("Gnars ID", auctionId, true)
        console.log("new auction msg without png");
        await Promise.all(this.discordClients.map((c) => c.send(message)));
        return false;
      }
      // console.log(`processed discord new auction ${auctionId}`);
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  /**
   * Send Discord message with new bid event data
   * @param auctionId Gnars auction number
   * @param bid Bid amount and ID
   */
  async handleNewBid(auctionId: number, bid: Bid) {
    try {
      const message = new Discord.MessageEmbed()
        .setTitle(`New Bid Placed`)
        .setURL("https://gnars.wtf/")
        .setDescription(await formatBidMessageText(auctionId, bid));
      // .setTimestamp();
      await Promise.all(this.discordClients.map((c) => c.send(message)));
      // console.log(`processed discord new bid ${auctionId}:${bid.id}`);
    } catch (error) {
      console.log(error);
    }
  }

  async handleAuctionEndingSoon(auctionId: number, restBN: number) {
    try {
      const png = await getNounPngBuffer(auctionId.toString());
      if (png) {
        const attachmentName = `Auction-${auctionId}.png`;
        const attachment = new Discord.MessageAttachment(png, attachmentName);
        const message = new Discord.MessageEmbed()
        .setTitle(`Auction Ending Soon`)
        .setURL("https://gnars.wtf/")
        .setDescription(await formatEndingSoonMessageText(auctionId, restBN))
        .attachFiles([attachment])
        .setImage(`attachment://${attachmentName}`);
      // .setTimestamp();
      await Promise.all(this.discordClients.map((c) => c.send(`<@&${config.SNIPER_ROLE}>`, message)));
      } else {
        const message = new Discord.MessageEmbed()
          .setTitle(`Auction Ending Soon`)
          .setURL("https://gnars.wtf/")
          .setDescription(await formatEndingSoonMessageText(auctionId, restBN));
        // .setTimestamp();
        await Promise.all(this.discordClients.map((c) => c.send(`<@&${config.SNIPER_ROLE}>`, message)));
      }
      console.log(`processed discord auction ending soon ${auctionId}`)
    } catch (error) {
      console.log(error);
    }
  }

  async handleNewSettledAuction(
    auctionId: number,
    auctionSettled: AuctionSettled
  ): Promise<void> {
    try {
      const message = new Discord.MessageEmbed()
        .setTitle(`Auction is Settled.`)
        .setURL("https://gnars.wtf/")
        .setDescription(
          await formatSettledMessageText(auctionId, auctionSettled)
        )
        .setTimestamp();
      await Promise.all(this.discordClients.map((c) => c.send(message)));
      // console.log(`processed discord new settled auction ${auctionId}:${auctionSettled.id}`);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async handleMinBidIncrementPercentageUpdated(
    auctionId: number
  ): Promise<void> {
    return;
  }

  async handleReservePriceUpdated(auctionId: number): Promise<void> {
    return;
  }
}
