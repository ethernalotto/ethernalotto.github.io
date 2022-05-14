import Web3 from 'web3';
import {provider} from 'web3-core';
import {Subscription} from 'web3-core-subscriptions';
import {BlockHeader} from 'web3-eth';
import {Contract} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

import {abi as ABI} from './Lottery.json';


export interface Options {
  web3?: Web3;
  provider?: provider;
  address: string;
}


export class LotterySubscription<SubscriptionType> {
  public constructor(private readonly _subscription: Subscription<SubscriptionType>) {}

  public cancel(): void {
    this._subscription.unsubscribe();
  }
}


export interface Receipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
}

export interface Ticket {
  date: Date;
  round: number;
  player: string;
  numbers: number[];
}

export interface Draw {
  date: Date;
  round: number;
  numbers: number[];
  jackpot: string;
}


export class Lottery {
  public static readonly ABI: AbiItem[] = ABI as AbiTem[];

  private readonly _address: string;
  private readonly _web3: Web3;
  private readonly _contract: Contract;

  public constructor(options: Options) {
    if (!options.address) {
      throw new Error('the `address` option is required');
    }
    if (!options.web3 && !options.provider) {
      throw new Error('either a Web3 instance or a `provider` must be specified in the options');
    }
    this._address = options.address;
    if (options.web3) {
      this._web3 = options.web3;
    } else {
      this._web3 = new Web3(options.provider!);
    }
    this._contract = new this._web3.eth.Contract(Lottery.ABI, this._address);
  }

  public get address(): string {
    return this._address;
  }

  public get web3(): Web3 {
    return this._web3;
  }

  public setProvider(p: provider): void {
    this._web3.setProvider(p);
  }

  public async isPaused(): Promise<boolean> {
    return await this._contract.methods.paused().call();
  }

  public async getJackpot(): Promise<string> {
    return await this._web3.eth.getBalance(this._address);
  }

  public subscribeToJackpot(
      callback: (jackpot: string) => unknown): LotterySubscription<BlockHeader>
  {
    const fetch = async () => callback(await this.getJackpot());
    const subscription = this._web3.eth.subscribe('newBlockHeaders').on('data', () => fetch());
    fetch();
    return new LotterySubscription<BlockHeader>(subscription);
  }

  public async getBaseTicketPrice(): Promise<string> {
    return await this._contract.methods.baseTicketPrice().call();
  }

  public async getMaxNumbers(): Promise<number> {
    const priceMultipliers = await this._contract.methods.priceMultipliers().call();
    return priceMultipliers.length + 5;
  }

  public async getTicketPrice(numbers: number[]): Promise<string> {
    return await this._contract.methods.getTicketPrice(numbers).call();
  }

  public async buyTicket(numbers: number[], account?: string): Promise<Receipt> {
    const value = await this._contract.methods.getTicketPrice(numbers).call();
    return await this._contract.methods.buyTicket(numbers).send({from: account, value});
  }

  public async getCurrentRound(): Promise<number> {
    const round = await this._contract.methods.currentRound().call();
    return parseInt(round, 10);
  }

  public async isRoundClosing(): Promise<boolean> {
    return await this._contract.methods.state().call() !== 0;
  }

  public async getDrawnNumbers(): Promise<number[]> {
    const state = await this._contract.methods.state().call();
    if (state !== 2) {
      throw new Error('the current round is not closing yet');
    }
    const round = await this._contract.methods.currentRound().call();
    return await Promise.all([
      this._contract.methods.drawnNumbers(round, 0).call(),
      this._contract.methods.drawnNumbers(round, 1).call(),
      this._contract.methods.drawnNumbers(round, 2).call(),
      this._contract.methods.drawnNumbers(round, 3).call(),
      this._contract.methods.drawnNumbers(round, 4).call(),
      this._contract.methods.drawnNumbers(round, 5).call(),
    ]);
  }

  public async getTickets(account: string, round?: number): Promise<Ticket[]> {
    const currentRound = await this.getCurrentRound();
    if (!round && round !== 0) {
      round = currentRound;
    }
    if (round < 0) {
      round = currentRound - round;
    }
    const ids = await this._contract.methods.getTickets(account, round).call();
    const data = await Promise.all(ids.map(id =>
        this._contract.methods.getTicket(round, parseInt(id, 10)).call()));
    return data.map(({timestamp, numbers}) => ({
      date: new Date(parseInt(timestamp, 10) * 1000),
      round: round,
      player: account,
      numbers: numbers.map(number => parseInt(number, 10)),
    }));
  }
}
