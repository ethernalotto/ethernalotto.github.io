---
id: whitepaper
title: EthernaLotto
date: 25.04.22
---

# EthernaLotto

## Abstract

We hereby provide the design specification of EthernaLotto, a lottery game based on the Ethereum
Virtual Machine (“EVM” in the following).

The game will be managed as a Decentralized Autonomous Organization (“DAO” in the following).

For scalability reasons, the game will be deployed to the [Polygon PoS chain][polygon-pos-chain]
(aka Matic) at this time. In the future we will probably migrate to [Ethereum 2][ethereum-2].

## Motivations

Lottery games have ancient origins tracing back to the Chinese Han Dynasty, between years 205 and
187 BC. The core idea of the game is that every player pays a small amount and a randomly chosen
lucky winner gets the money from all contributions.

Unfortunately, classic operation of such games requires a central running authority and subjects
them to serious issues:

* **Unfair** censorship - some countries make some or all lotteries illegal.
* **Excessive taxation** - since lotteries are usually State-managed, the actual proceeds from a win
  are almost always significantly lower than the advertised jackpot.
* **Unfair taxation** - since taxation is decided by a central authority it may change over time,
  making the process unfair to all players who bought a ticket before a change if the draw happens
  after the change.
* **Outright scams** - classic operation provides little to no guarantees about the fairness of the
  drawing process, as well as the actual value of the ticket sale proceeds. The drawn numbers may be
  biased to favor specific players, and / or the lottery runner may advertise a jackpot that is
  significantly lower (but still attractive enough) than the actual proceeds.

Case in point, [Hot Lotto][hot-lotto] suffered one of the most famous lottery fraud scandals (not
necessarily the worst). Other frauds that might have occurred may never be uncovered.

We want to overcome all the above problems by implementing a new lottery game based on a
decentralized, trustless, censorship-resistant, and cryptographically verified platform, the EVM.

## Game Description

TODO

## Architecture

TODO

## Storage Structure

TODO

## Drawing Process

TODO

### Overview

TODO

### High-Level Algorithm Description

TODO

### Intersections

TODO

## DAO and Governance

TODO

## Deployment Sequence

TODO

## Alternatives Considered

TODO

### Choosing the winning addresses randomly

TODO

### Alternative indexing algorithm

TODO

### Sharded drawings

TODO

[ethereum-2]: https://ethereum.org/en/upgrades/
[hot-lotto]: https://en.wikipedia.org/wiki/Hot_Lotto_fraud_scandal
[polygon-pos-chain]: https://polygon.technology/solutions/polygon-pos/
