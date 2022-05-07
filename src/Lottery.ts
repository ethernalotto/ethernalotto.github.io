import Web3 from 'web3';
import {Log, provider} from 'web3-core';
import {Subscription} from 'web3-core-subscriptions';
import {BlockHeader} from 'web3-eth';
import {Contract} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';


export interface Options {
  web3?: Web3;
  provider?: provider;
  address: string;
  deployBlock: number;
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


export interface Draw {
  date: Date;
  round: number;
  numbers: number[];
  jackpot: string;
  receipt: Receipt;
}

interface DrawSearchBoundary {
  blockNumber: number;
  round: number;
}


export interface Ticket {
  date: Date;
  round: number;
  player: string;
  numbers: number[];
  receipt: Receipt;
}


// Cached tickets for a given account.
class TicketCache {
  // Invariant: all blocks between previousBlock and nextBlock exclusive have already been queried
  // and all detected tickets are stored in the _tickets array.
  public previousBlock: number;
  public nextBlock: number;

  // Tickets are ordered from newest to oldest based on transaction block timestamp. If a user
  // bought more than one ticket in the same block, their order is undefined.
  public readonly tickets: Ticket[] = [];

  public constructor(currentBlockNumber: number) {
    this._previousBlock = currentBlockNumber;
    this._nextBlock = currentBlockNumber;
  }
}


export class Lottery {
  public static readonly ABI: AbiItem[] = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64[5]",
          "name": "numberOfWinningTickets",
          "type": "uint64[5]"
        },
        {
          "indexed": false,
          "internalType": "uint256[5]",
          "name": "prizes",
          "type": "uint256[5]"
        }
      ],
      "name": "CloseRound",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8[6]",
          "name": "numbers",
          "type": "uint8[6]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentBalance",
          "type": "uint256"
        }
      ],
      "name": "Draw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "NewTicketPrice",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8[]",
          "name": "numbers",
          "type": "uint8[]"
        }
      ],
      "name": "Ticket",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "VRFRequest",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "baseTicketPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8[]",
          "name": "playerNumbers",
          "type": "uint8[]"
        }
      ],
      "name": "buyTicket",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "closeRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentRound",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8[]",
          "name": "playerNumbers",
          "type": "uint8[]"
        }
      ],
      "name": "getTicketPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "numbers",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "dest",
          "type": "address"
        }
      ],
      "name": "payments",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "playersByTicket",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "priceMultipliers",
      "outputs": [
        {
          "internalType": "uint256[20]",
          "name": "",
          "type": "uint256[20]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "state",
      "outputs": [
        {
          "internalType": "enum Lottery.State",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ticketsByNumber",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "payee",
          "type": "address"
        }
      ],
      "name": "withdrawPayments",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  public static readonly TICKET_EVENT_ABI: AbiItem = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8[]",
        "name": "numbers",
        "type": "uint8[]"
      }
    ],
    "name": "Ticket",
    "type": "event"
  };

  public static readonly DRAW_EVENT_ABI: AbiItem = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8[6]",
        "name": "numbers",
        "type": "uint8[6]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentBalance",
        "type": "uint256"
      }
    ],
    "name": "Draw",
    "type": "event"
  };

  public static readonly CLOSE_ROUND_EVENT_ABI: AbiItem = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64[5]",
        "name": "numberOfWinningTickets",
        "type": "uint64[5]"
      },
      {
        "indexed": false,
        "internalType": "uint256[5]",
        "name": "prizes",
        "type": "uint256[5]"
      }
    ],
    "name": "CloseRound",
    "type": "event"
  };

  private static readonly _MAX_LOG_FETCH_SIZE = 1000;

  private readonly _address: string;
  private readonly _web3: Web3;
  private readonly _contract: Contract;
  private readonly _deployBlock: number;

  private readonly _blockCache: {[numberOrHash: number|string]: BlockHeader} = Object.create(null);
  private readonly _drawCache: Draw[] = [];
  private readonly _ticketCache: {[account: string]: TicketCache} = Object.create(null);

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
    this._deployBlock = parseInt(options.deployBlock, 10);
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
    if (await this.isRoundClosing()) {
      const numbers = (await this._contract.methods.numbers().call()) as string[];
      return numbers.map(number => parseInt(number, 10));
    } else {
      throw new Error('the current round is still open');
    }
  }

  private async _getBlock(numberOrHash?: number|string): Promise<BlockHeader> {
    if (!numberOrHash && numberOrHash !== 0) {
      const block = await this._web3.eth.getBlock('latest');
      this._blockCache[block.number] = block;
      this._blockCache[block.hash] = block;
      return block;
    }
    if (!this._blockCache[numberOrHash]) {
      const block = await this._web3.eth.getBlock(numberOrHash);
      this._blockCache[block.number] = block;
      this._blockCache[block.hash] = block;
    }
    return this._blockCache[numberOrHash];
  }

  private async _parseDraw(log: Log): Promise<Draw> {
    const block = await this._getBlock(log.blockHash);
    const data = this._web3.eth.abi.decodeLog(
        Lottery.DRAW_EVENT_ABI.inputs, log.data, log.topics.slize(1));
    return {
      date: new Date(block.timestamp),
      round: data.round,
      numbers: data.numbers,
      jackpot: data.currentBalance,
      receipt: {
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex,
        blockHash: block.hash,
        blockNumber: block.number,
      },
    };
  }

  private async _searchDraw(
      round: number, min: DrawSearchBoundary, max: DrawSearchBoundary): Promise<Draw|null>
  {
    const topics = [
      this._web3.eth.abi.encodeEventSignature(Lottery.DRAW_EVENT_ABI),
      this._web3.eth.abi.encodeParameter('uint', round),
    ];
    const guess = max.round > min.round ?
        min.blockNumber + Math.floor((max.blockNumber - min.blockNumber) * (round - min.round) /
            (max.round - min.round)) :
        min.blockNumber;
    const halfFetchSize = Lottery._MAX_LOG_FETCH_SIZE >>> 1;
    let toBlock = Math.min(guess + halfFetchSize, max.blockNumber);
    while (toBlock <= max.blockNumber) {
      const logs = await this._web3.eth.getPastLogs({
        fromBlock: toBlock - Lottery._MAX_LOG_FETCH_SIZE,
        toBlock: toBlock,
        address: this._address,
        topics: topics,
      });
      if (logs.length > 0) {
        return await this._parseDraw(logs[0]);
      }
      toBlock = Math.min(toBlock + Lottery._MAX_LOG_FETCH_SIZE, max.blockNumber);
    }
    return this._searchDraw(round, min, {
      blockNumber: guess - halfFetchSize,
      round: max.round,
    });
  }

  private async getDraw(round: number): Promise<Draw> {
    const cache = this._drawCache;
    let i = 0;
    let min: DrawSearchBoundary = {
      blockNumber: this._deployBlock,
      round: 0,
    };
    let j = cache.length;
    const [{number: currentBlockNumber}, currentRound] = await Promise.all([
      this._getBlock(),
      this.getCurrentRound(),
    ]);
    let max: DrawSearchBoundary = {
      blockNumber: currentBlockNumber,
      round: currentRound,
    };
    while (j > i) {
      const k = i + ((j - i) >>> 1);
      const draw = cache[k];
      if (round < draw.round) {
        j = k;
        max.blockNumber = draw.receipt.blockNumber;
        max.round = draw.round;
      } else if (round > draw.round) {
        i = k + 1;
        min.blockNumber = draw.receipt.blockNumber;
        min.round = draw.round;
      } else {
        return draw;
      }
    }
    const draw = await this._searchDraw(round, min, max);
    if (draw) {
      this._drawCache.push(draw);
      this._drawCache.sort((draw1, draw2) => draw1.round - draw2.round);
    }
    return draw;
  }

  private subscribeToDraw(callback: (draw: Draw) => any): LotterySubscription<Log> {
    return new LotterySubscription<Log>(this._web3.eth.subscribe('logs', {
      address: this._address,
      topics: [this._web3.eth.abi.encodeEventSignature(Lottery.DRAW_EVENT_ABI)],
    }, async (error, log) => {
      if (!error) {
        callback(await this._parseDraw(log));
      }
    }));
  }

  private async _parseTicket(log: Log): Promise<Ticket> {
    const block = await this._getBlock(log.blockHash);
    const data = this._web3.eth.abi.decodeLog(
        Lottery.TICKET_EVENT_ABI.inputs, log.data, log.topics.slize(1));
    return {
      date: new Date(block.timestamp),
      round: data.round,
      player: data.player,
      numbers: data.numbers,
      receipt: {
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex,
        blockHash: block.hash,
        blockNumber: block.number,
      },
    };
  }

  private async _fetchTickets(
      account: string, fromBlock: number, toBlock: number): Promise<Ticket[]>
  {
    let tickets: Ticket[] = [];
    for (let block = toBlock; block >= fromBlock; block -= Lottery._MAX_LOG_FETCH_SIZE) {
      const logs = await this._web3.eth.getPastLogs({
        fromBlock: toBlock - Lottery._MAX_LOG_FETCH_SIZE,
        toBlock: toBlock,
        address: this._address,
        topics: [
          this._web3.eth.abi.encodeEventSignature(Lottery.TICKET_EVENT_ABI),
          /*round=*/null,
          this._web3.eth.abi.encodeParameter('address', account),
        ],
      });
      tickets = tickets.concat(await Promise.all(logs.map(log => this._parseTicket(log))));
    }
    return tickets;
  }

  public async getTickets(account: string, round?: number): Promise<Ticket[]> {
    const currentRound = await this.getCurrentRound();
    if (!round && round !== 0) {
      round = currentRound;
    }
    if (round < 0) {
      round = currentRound - round;
    }
    const {number: currentBlockNumber} = await this._getBlock();
    if (!this._ticketCache[account]) {
      this._ticketCache[account] = new TicketCache(currentBlockNumber);
    }
    const draw = await this.getDraw(round);
    const toBlock = draw ? draw.receipt.blockNumber : currentBlockNumber;
    const fromBlock = await (async () => {
      if (round > 0) {
        const previousDraw = await this.getDraw(round - 1);
        if (previousDraw) {
          return previousDraw.receipt.blockNumber;
        }
      }
      return this._deployBlock;
    })();
    const cache = this._ticketCache;
    if (fromBlock <= cache.previousBlock) {
      cache.tickets = cache.tickets.concat(
          await this._fetchTickets(account, fromBlock, cache.previousBlock));
      cache.previousBlock = fromBlock - 1;
    }
    if (toBlock >= cache.nextBlock) {
      cache.tickets = cache.tickets.concat(
          await this._fetchTickets(account, cache.nextBlock, toBlock));
      cache.nextBlock = toBlock + 1;
    }
    cache.tickets.sort((ticket1, ticket2) => ticket2.date - ticket1.date);
    return cache.tickets.filter(ticket => ticket.round === round);
  }
}
