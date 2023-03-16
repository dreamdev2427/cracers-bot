export interface Account {
  id: string;
}

export interface Bid {
  id: string;
  amount: string;
  bidder: Account;
}

export interface AuctionBids {
  id: number;
  endTime: number;
  bids: Bid[];
}

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
}

export interface AuctionSettled {
  id: number;
  gnarId: string;
  winner: string;
  amount: string;
  endTime: number;
}

export interface IAuctionLifecycleHandler {
  handleNewAuction(auctionId: number): Promise<boolean>;
  handleNewBid(auctionId: number, bid: Bid): Promise<void>;
  handleAuctionEndingSoon(auctionId: number, restBN: number): Promise<void>;
  handleNewSettledAuction(
    auctionId: number,
    auctionSettled: AuctionSettled
  ): Promise<void>;
  handleMinBidIncrementPercentageUpdated(auctionId: number): Promise<void>;
  handleReservePriceUpdated(auctionId: number): Promise<void>;
}
