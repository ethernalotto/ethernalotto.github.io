---
id: first-drawing
title: First Drawing!
date: 28.05.22
---

# First Drawing!

It's been more than a month since we published [our first update][a-lottery-is-born]. At that point
we though EthernaLotto was pretty much ready to get launched, or at least that the smartcontracts
were done and only a few details in the frontend were missing. Boy, were we wrong...

It's been a month of intense development -- and steep learning curve! We migrated to ChainLink VRF
v2, discovered that compiled smartcontracts must not exceed 24 KB and reorganized all code in
smaller libraries, uncovered and fixed multiple bugs, overhauled the revenue distribution model
twice, learned that Polygon is so freakin' fast that listing a user's tickets via log analysis is
infeasible due to the enormous number of blocks (and therefore had to add additional stored state to
the main SC and provide proper ABI), and last but not least we managed to implement massive
optimizations in the drawing algorithm, which is the most critical part. We still don't know if it
can scale to something like a million tickets in a round, but I hope we find out soon!

Meanwhile we know it can scale to at least two tickets ([the][ticket1] [ones][ticket2] I bought
today), because we have just triggered the first drawing! We're proud to announce that the first 6
lucky numbers are:

TODO

(so I didn't win anything.)

Good luck, EthernaLotto!

Jim

[a-lottery-is-born]: /articles/a-lottery-is-born
[ticket1]: https://polygonscan.com/tx/0xe9b25f765cd8193b3524b66012b12760a5101a3085c1175b82b7126f76be6d53
[ticket2]: https://polygonscan.com/tx/0x9b2bedf3ffda61a374551633dc1e456a6581b2a93a4fe04b4db648e3ade6d4bb
