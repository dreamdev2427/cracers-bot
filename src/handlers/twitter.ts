import { getAuctionReplyTweetId, updateAuctionReplyTweetId } from "../cache";
import { twitter } from "../clients";
import { AuctionSettled, IAuctionLifecycleHandler, Bid } from "../types";
import {
  getAuctionEndingSoonTweetText,
  formatAuctionStartedTweetText,
  formatBidMessageText,
  getNounPngBuffer,
} from "../utils";

export class TwitterAuctionLifecycleHandler
  implements IAuctionLifecycleHandler {
  /**
   * Tweet an image of the current noun alerting users
   * to the new auction and update the tweet reply id cache
   * @param auctionId The current auction ID
   */
  async handleNewAuction(auctionId: number): Promise<boolean> {
    try {
      const png = await getNounPngBuffer(auctionId.toString());
      if (png) {
        // console.log(`handleNewAuction tweeting discovered auction id ${auctionId}`);
        const mediaId = await twitter.v1.uploadMedia(png, { mimeType: "png" });
        const tweet = await twitter.v1.tweet(
          formatAuctionStartedTweetText(auctionId),
          {
            media_ids: mediaId,
          }
        );
        await updateAuctionReplyTweetId(tweet.id_str);
        console.log(`handleNewAuction tweeting discovered auction success`);
        return true;
      } else {
        console.log(`handleNewAuction tweeting discovered auction id ${auctionId} but not png`);
        const tweet = await twitter.v1.tweet(
          formatAuctionStartedTweetText(auctionId)
        );
        await updateAuctionReplyTweetId(tweet.id_str);
      }
      // console.log(`processed twitter new auction ${auctionId}`);
      return false;
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  /**
   * Tweet a reply with new bid information to the reply id cache
   * We intentionally update the bid cache before safety checks to ensure we do not double tweet a bid
   * @param auctionId The current auction id
   * @param bid The current bid
   */
  async handleNewBid(auctionId: number, bid: Bid) {
    try {
      const tweetReplyId = await getAuctionReplyTweetId();
      if (!tweetReplyId) {
        // console.error(`handleNewBid no reply tweet id exists: auction(${auctionId}) bid(${bid.id})`);
        // return;
        console.log(`handleNewBid no reply tweet id exists: auction(${auctionId}) bid(${bid.id})`);
        // const tweet = await twitter.v1.tweet(
        //   await formatBidMessageText(auctionId, bid)
        // );
        // await updateAuctionReplyTweetId(tweet.id_str);
      } else {
        const tweet = await twitter.v1.reply(
          await formatBidMessageText(auctionId, bid),
          tweetReplyId
        );
        await updateAuctionReplyTweetId(tweet.id_str);
        console.log(`processed twitter new bid ${bid.id}:${auctionId}`);
      }
      // console.log(`processed twitter new bid ${bid.id}:${auctionId}`);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Tweet a reply informing observers that the auction is ending soon
   * @param auctionId The current auction id
   */
  async handleAuctionEndingSoon(auctionId: number, restBN: number) {
    try {
      const tweetReplyId = await getAuctionReplyTweetId();
      if (!tweetReplyId) {
        // console.error(`handleAuctionEndingSoon no reply tweet id exists for auction ${auctionId}`);
        // return;
        console.log(`handleAuctionEndingSoon no reply tweet id exists for auction ${auctionId}`);
        // const tweet = await twitter.v1.tweet(getAuctionEndingSoonTweetText(auctionId, restBN));
        // await updateAuctionReplyTweetId(tweet.id_str);
      } else {
        const tweet = await twitter.v1.reply(
          getAuctionEndingSoonTweetText(auctionId, restBN),
          tweetReplyId
        );
        await updateAuctionReplyTweetId(tweet.id_str);
        console.log(`handleAuctionEndingSoon reply success: ${auctionId}`);
      }
      // console.log(`processed twitter auction ending soon update for auction ${auctionId}`);
    } catch (error) {
      console.log(error);
    }
  }

  async handleNewSettledAuction(
    auctionId: number,
    auctionSettled: AuctionSettled
  ): Promise<void> {
    return;
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
