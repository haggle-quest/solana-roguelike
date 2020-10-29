import { Connection } from "@solana/web3.js";

import dotenv from "dotenv";

dotenv.config();

let url;

switch (process.env.CLUSTER) {
  case "mainnet-beta":
    console.log("attempting to connect to mainnet");

    url = "https://api.mainnet-beta.solana.com";
    break;

  case "testnet":
    console.log("attempting to connect to testnet");
    url = "http://testnet.solana.com:8899";
    break;

  case "devnet":
    console.log("attempting to connect to devnet");
    //url = 'http://34.82.57.86:8899'
    url = "http://devnet.solana.com";
    break;

  //   default:
  //     console.log("attempting to connect to local node");
  //     url = "http://localhost:8899";

  default:
    console.log("attempting to connect to local node");
    url = "https://api.mainnet-beta.solana.com";
}

export default async function connectToSolana() {
  const connection = new Connection(url, "recent");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", url, version);
  return connection;
}
