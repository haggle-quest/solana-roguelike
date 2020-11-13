const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const axios = require("axios");
const {
  default: connectToSolana,
} = require("./client/src/utils/connectToSolana");
const { PublicKey, Account } = require("@solana/web3.js");
require("dotenv");

import * as BufferLayout from "buffer-layout";
import { burnTokens, createAccount, mintToken } from "./utils";

const getData = {
  programId: "7qRP43DEvp1NRGXu76bMzbj5rzYmrJi1AYrXueyYMYHh",
  accountId: "2KFnnyTdPm6y1zhtUrSAqn7JbqoVnj683GbEV3E96DYn",
  mintAuthority: "G5Qhd8KnMm7iLbTkseuZdsAbrP9V71eqizQgenHQw8vb",
};

const tokenPublicKey = new PublicKey(
  "A8kuHURfz6YorYQBsxd4HrSx5GyhAUST722tunzPFwna",
);

const app = express();

app.use(morgan("tiny"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(
  bodyParser.json({
    extended: true,
  }),
);

app.get("/fetch-organizations", async (req, res) => {
  const connection = await connectToSolana();

  const owner = req.query.owner || "facebook";
  const repo = req.query.repo || "react";
  let pk = new PublicKey(getData.accountId);
  let account = await connection.getAccountInfo(pk);
  const data = await Buffer.from(account.data);

  const accountDataLayout = BufferLayout.struct([
    BufferLayout.u32("issueId"),
    BufferLayout.u32("numberOfVotes"),
  ]);

  const fetchList = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=all`,
  );

  const filteredList = [];
  fetchList.data.forEach((listItem) => {
    if (listItem.labels && listItem.labels.length) {
      listItem.labels.forEach((label) => {
        if (label.name === "Type: Bug") {
          filteredList.push(listItem);
        }
      });
    }
  });

  res.json("test");
});

export const createTokenAccount = async (account) => {
  const TOKEN_PROGRAM_ID = new PublicKey(getData.programId);
  const privateAccount = await createAccount(process.env.PRIVATE_KEY);

  const connection = await connectToSolana();

  const zebra = await mintToken({
    connection,
    account,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    amount: 10,
    privateAccount,
  });

  return zebra;
};

app.post("/burn-token", async (req, res) => {
  const userAccount = new Account(req.body.privateKey);

  const connection = await connectToSolana();

  try {
    await burnTokens({
      connection,
      account,
      tokenPublicKey,
      TOKEN_PROGRAM_ID,
      privateAccount,
    });
  } catch (e) {
    console.error(e);
  }

  const tokenPublicKey = new PublicKey(account._keypair.publicKey);
});

app.get("/create-account", async (req, res) => {
  const newAccount = await new Account();

  const connection = await connectToSolana();
  const privateAccount = await createAccount(process.env.PRIVATE_KEY);

  const privateKeyPair = await new PublicKey(privateAccount._keypair.publicKey);

  await connection.requestAirdrop(privateKeyPair, 100000000);

  const tokenAccount = await createTokenAccount(newAccount);

  res.send({ newAccount, tokenAccount });
});

app.put("update-account");

app.use(function (err, req, res, next) {
  console.log(err);
  return res
    .status(err.status || 500)
    .send(err.message || GENERIC_ERROR_MESSAGE());
});

app.listen(4000, function () {
  console.log(`Server starting on port 4000!`);
});
