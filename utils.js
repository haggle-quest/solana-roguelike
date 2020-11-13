import {
  Account,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction as realSendAndConfirmTransaction,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import * as bip32 from "bip32";
import nacl from "tweetnacl";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function mnemonicToSeed(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid seed phrase");
  }
  return await bip39.mnemonicToSeed(mnemonic);
}

function getAccountFromSeed(seed, walletIndex, accountIndex = 0) {
  const derivedSeed = bip32
    .fromSeed(seed)
    .derivePath(`m/501'/${walletIndex}'/0/${accountIndex}`).privateKey;
  return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
}

export const createAccount = async (secret) => {
  if (secret.includes(",")) {
    return new Account(
      secret
        .replace(/ /g, "")
        .split(",")
        .map((n) => parseInt(n)),
    );
  }
  const seed = await mnemonicToSeed(secret);
  return getAccountFromSeed(seed, 0, 0);
};

export const mintToken = async ({
  privateAccount,
  tokenPublicKey,
  amount,
  TOKEN_PROGRAM_ID,
  account,
  createdMintAccount,
  connection,
}) => {
  const token = await new Token(
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    privateAccount,
  );
  const privateKeyToMint = await new PublicKey(
    privateAccount._keypair.publicKey,
  );
  const userAccountFee = await new PublicKey(createdMintAccount);

  return await token.mintTo(userAccountFee, privateAccount, [], amount);
};

export const burnTokens = async ({
  privateAccount,
  userAccount,
  TOKEN_PROGRAM_ID,
  connection,
  tokenPublicKey,
  tokenAccount,
}) => {
  const token = await new Token(
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    privateAccount,
  );

  await token.burn(tokenAccount, userAccount, [], 1);
};

export const createTokenAccount = async ({
  connection,
  feePayer,
  tokenPublicKey,
  owner,
}) => {
  const token = new Token(
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    feePayer,
  );

  const happyFace = (
    await token.createAccount(new PublicKey(owner._keypair.publicKey))
  ).toString();

  console.log(happyFace, "happy Face???!!");
  return happyFace;
};

export const sendAndConfirmTransaction = async (
  title,
  connection,
  transaction,
  ...signers
) => {
  const when = Date.now();

  const signature = await realSendAndConfirmTransaction(
    connection,
    transaction,
    signers,
    {
      confirmations: 1,
      skipPreflight: true,
      commitment: "singleGossip",
    },
  );

  return signature;
  // const body = {
  //   time: new Date(when).toString(),
  //   signature,
  //   instructions: transaction.instructions.map((i) => {
  //     return {
  //       keys: i.keys.map((keyObj) => keyObj.pubkey.toBase58()),
  //       programId: i.programId.toBase58(),
  //       data: "0x" + i.data.toString("hex"),
  //     };
  //   }),
  // };

  // notify(title, YAML.stringify(body).replace(/"/g, ""));
};

export async function makeAccount(
  connection,
  payerAccount,
  numBytes,
  programId,
) {
  const dataAccount = new Account();

  const rentExemption = await connection.getMinimumBalanceForRentExemption(
    numBytes,
  );

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payerAccount.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: rentExemption,
      space: numBytes,
      programId: programId,
    }),
  );

  const confirm = await sendAndConfirmTransaction(
    "createAccount",
    connection,
    transaction,
    payerAccount,
    dataAccount,
  );

  console.log(confirm, "confirm");

  return dataAccount.publicKey;
}
