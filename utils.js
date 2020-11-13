import { Account, PublicKey } from "@solana/web3.js";
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

  const HappyFace = (
    await token.createAccount(new PublicKey(owner._keypair.publicKey))
  ).toString();

  console.log(HappyFace, "happy Face???!!");
  return HappyFace;
};
