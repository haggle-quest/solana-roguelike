# github-drone-server

Run server using command:
`node -r esm server.js`

Available endpoints
```
GET - localhost:4000/create-account

GET - localhost:4000/fetch-votes

POST - localhost:4000/burn-token
```

**Create Account**
Returns: Makes the player a new account — public and private key — for our [SPL](https://spl.solana.com/token) voting token, initialised with a small number of vote tokens.



**Fetch votes**
Returns: a list of github issues with the *voting* tag and the number of votes each issue has.

**Burn Tokens**
Body: The spl token account, the token creators key, and the github issue to vote on.

Returns: The Github issue number voted on.

What it does: Burns the requisite number of vote tokens and increase the vote count in a solana smart contract that contains a list of all votes and their corresponding issues.
