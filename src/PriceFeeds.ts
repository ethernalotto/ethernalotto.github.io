import Web3 from 'web3';
import {Contract} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

import PriceFeed from './PriceFeed.json';


export interface PriceFeedInterface {
  getLatestPrice(): Promise<number>;
}


export class USDPriceFeed implements PriceFeedInterface {
  private readonly _address: string;
  private readonly _web3: Web3;
  private readonly _contract: Contract;

  public constructor(web3: Web3, address: string = process.env.REACT_APP_MATIC_USD_PRICE_FEED!) {
    this._address = address;
    this._web3 = web3;
    this._contract = new this._web3.eth.Contract(PriceFeed as AbiItem[], this._address);
  }

  public async getLatestPriceRaw(): Promise<number> {
    const {answer} = await this._contract.methods.latestRoundData().call();
    return parseInt(answer, 10);
  }

  public async getLatestPrice(): Promise<number> {
    return (await this.getLatestPriceRaw()) / 100000000;
  }
}


export class NonUSDPriceFeed implements PriceFeedInterface {
  private readonly _address: string;
  private readonly _web3: Web3;
  private readonly _contract: Contract;
  private readonly _usdPriceFeed: USDPriceFeed;

  public constructor(web3: Web3, address: string) {
    this._address = address;
    this._web3 = web3;
    this._contract = new this._web3.eth.Contract(PriceFeed as AbiItem[], this._address);
    this._usdPriceFeed = new USDPriceFeed(web3);
  }

  public async getLatestPrice(): Promise<number> {
    const [usdPrice, {answer}] = await Promise.all([
      this._usdPriceFeed.getLatestPriceRaw(),
      this._contract.methods.latestRoundData().call(),
    ]);
    return usdPrice / parseInt(answer, 10);
  }
}
