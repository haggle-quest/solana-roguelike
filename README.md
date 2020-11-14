# solana-roguelike

Run server using command:
`node -r esm server.js`

Available endpoints
```
localhost:4000/create-account

localhost:4000/fetch-votes

localhost:4000/burn-token
```

**Create Account**
Makes the player a new account — public and private key — for our [SPL](https://spl.solana.com/token) voting token, initialised with a small number of vote tokens.

**Fetch votes**
Returns a list of github issues with the *voting* tag and the number of votes each issue has.

**Burn Tokens**
The game sends back the issue number voted on, we burn the requisite number of vote tokens and increase the vote count in a solana smart contract.
