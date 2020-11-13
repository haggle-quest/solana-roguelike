const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const axios = require("axios");
const {
  default: connectToSolana,
} = require("./client/src/utils/connectToSolana");
const {
  PublicKey,
  Account,
  TransactionInstruction,
  Transaction,
} = require("@solana/web3.js");
require("dotenv");

import * as BufferLayout from "buffer-layout";
import {
  burnTokens,
  createAccount,
  createTokenAccount,
  mintToken,
  makeAccount,
  sendAndConfirmTransaction,
} from "./utils";

const getData = {
  programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  voteProgramId: "6JrnmBqz5H5VqFVT6ep6pvVasV9iMFwLzkB74Y3LJmry",
  accountId: "2KFnnyTdPm6y1zhtUrSAqn7JbqoVnj683GbEV3E96DYn",
  mintAuthority: "G5Qhd8KnMm7iLbTkseuZdsAbrP9V71eqizQgenHQw8vb",
};

const tokenPublicKey = new PublicKey(
  // "H9KuqhhuuPaFuhjScjFvWMeksmnZ3n5s6M6WdA9nb4Sk",
  "A8kuHURfz6YorYQBsxd4HrSx5GyhAUST722tunzPFwna",
);

const TOKEN_PROGRAM_ID = new PublicKey(getData.programId);
const VOTE_PROGRAM_ID = new PublicKey(getData.voteProgramId);

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

  const privateAccount = await createAccount(process.env.PRIVATE_KEY);
  const owner = req.query.owner || "facebook";
  const repo = req.query.repo || "react";

  const issue_number = 55;

  // find all accounts owned by 6JrnmBqz5H5VqFVT6ep6pvVasV9iMFwLzkB74Y3LJmry
  // loop over them and decode them, and check if the issue number already exists
  // if so update s.accountId with that accountId
  // else create new account id and pass the issue number in the instruction data

  const votingProgram = new PublicKey(getData.voteProgramId);
  const getVotingResults = await connection.getProgramAccounts(votingProgram);

  const getCorrectItem = getVotingResults.find((githubIssues) => {
    const issue = Buffer.from(githubIssues.account.data);
    const accountDataLayout = BufferLayout.struct([
      BufferLayout.u32("issueId"),
      BufferLayout.u32("numberOfVotes"),
    ]);

    const counts = accountDataLayout.decode(issue);
    if (counts.issueId.toString() === issue_number.toString()) return true;
  });

  if (getCorrectItem) {
    // cool
    console.log(getCorrectItem, "correct item");
  } else {
    const numBytes = 8;
    const accountId = await makeAccount(
      connection,
      privateAccount,
      numBytes,
      VOTE_PROGRAM_ID,
    );

    const instruction_data = Buffer.from([issue_number]);

    const instruction = new TransactionInstruction({
      keys: [{ pubkey: accountId, isSigner: false, isWritable: true }],
      programId: VOTE_PROGRAM_ID,
      data: instruction_data,
    });

    await sendAndConfirmTransaction(
      "vote",
      connection,
      new Transaction().add(instruction),
      privateAccount,
    );
  }

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

  res.send("test");
});

export const mintTokensToAccount = async (createdMintAccount) => {
  const privateAccount = await createAccount(process.env.PRIVATE_KEY);

  const connection = await connectToSolana();
  await mintToken({
    connection,
    createdMintAccount,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    amount: 10,
    privateAccount,
  });
};

app.post("/burn-token", async (req, res) => {
  const connection = await connectToSolana();

  const userAccount = new Account(
    Object.values(req.body.newAccount._keypair.secretKey),
  );

  const tokenAccount = new PublicKey(req.body.createdMintAccount);

  const privateAccount = await createAccount(process.env.PRIVATE_KEY);

  try {
    await burnTokens({
      connection,
      userAccount,
      tokenPublicKey,
      TOKEN_PROGRAM_ID,
      privateAccount,
      tokenAccount,
    });
  } catch (e) {
    console.error(e);
  }

  res.send("burnt token");
});

app.get("/create-account", async (req, res) => {
  const newAccount = await new Account();
  const connection = await connectToSolana();
  const privateAccount = await createAccount(process.env.PRIVATE_KEY);

  const privateKeyPair = await new PublicKey(privateAccount._keypair.publicKey);

  await connection.requestAirdrop(privateKeyPair, 100000000);

  const createdMintAccount = await createTokenAccount({
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    feePayer: privateAccount,
    owner: newAccount,
  });

  const tokenAccount = await mintTokensToAccount(createdMintAccount);

  console.log(tokenAccount, "Token account");

  res.send({
    newAccount,
    createdMintAccount,
  });
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
