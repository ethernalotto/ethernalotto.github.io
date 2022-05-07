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


export interface Ticket {
  date: Date;
  round: number;
  player: string;
  numbers: number[];
  receipt: Receipt;
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

  private readonly _address: string;
  private readonly _web3: Web3;
  private readonly _contract: Contract;
  private readonly _deployBlock: number;

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

  public async getDraws(): Promise<Draw[]> {
    return (await this._web3.eth.getPastLogs({
      fromBlock: this._deployBlock,
      address: this._address,
      topics: [this._web3.eth.abi.encodeEventSignature(Lottery.DRAW_EVENT_ABI)],
    })).map(log => this._parseDraw(log));
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

  public async getTickets(account: string, round?: number): Promise<Ticket[]> {
    const currentRound = await this.getCurrentRound();
    if (!round && round !== 0) {
      round = currentRound;
    }
    if (round < 0) {
      round = currentRound - round;
    }
    return (await this._web3.eth.getPastLogs({
      fromBlock: this._deployBlock,
      address: this._address,
      topics: [
        this._web3.eth.abi.encodeEventSignature(Lottery.TICKET_EVENT_ABI),
        this._web3.eth.abi.encodeParameter('uint', round),
        this._web3.eth.abi.encodeParameter('address', account),
      ],
    })).map(log => this._parseTicket(log));
  }
}
