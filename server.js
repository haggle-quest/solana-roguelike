const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const axios = require("axios");
const { includes } = require("lodash");
const {
  default: connectToSolana,
} = require("./client/src/utils/connectToSolana");
const { PublicKey, Account } = require("@solana/web3.js");
import { Token } from "@solana/spl-token";

require("dotenv");

import * as BufferLayout from "buffer-layout";
import { createAccount } from "./getAccount";

const getData = {
  programId: "7qRP43DEvp1NRGXu76bMzbj5rzYmrJi1AYrXueyYMYHh",
  accountId: "2KFnnyTdPm6y1zhtUrSAqn7JbqoVnj683GbEV3E96DYn",
};

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
  //   let corectdata = await data.toString();

  const accountDataLayout = BufferLayout.struct([
    BufferLayout.u32("zebra"),
    BufferLayout.u32("count2"),
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

  console.log(fetchList.data.length, filteredList.length);

  res.json("test");
});

const TOKEN_PROGRAM_ID = new PublicKey(getData.programId);

export const createTokenAccount = async (account) => {
  const tokenPublicKey = new PublicKey(account._keypair.publicKey);

  const account2 = await createAccount(process.env.PRIVATE_KEY);

  const connection = await connectToSolana();

  const poop = await connection.getBalance(account2.publicKey);
  console.log(poop);

  const token = await new Token(
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    account2,
  );

  console.log(token);
  return (await token.createAccount(tokenPublicKey)).toString();
};

app.get("/create-account", async (req, res) => {
  const newAccount = await new Account();

  const what = await createTokenAccount(newAccount);
  console.log(what);
  res.send(newAccount);
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
