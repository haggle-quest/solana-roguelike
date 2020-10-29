import { Account } from "@solana/web3.js";
import storage from "./storage";

export default async function createAccount() {
  //   const keypairFile = "./keypair.json";

  //   if (!fs.existsSync(keypairFile)) {
  //     console.log("The expected keypair file", keypairFile, "was not found");
  //     process.exit(1);
  //   }

  //   const secret = JSON.parse(await fs.readFile(keypairFile));

  if (!storage.get("secretKey")) {
    const account = await new Account();

    storage.set("publicKey", JSON.stringify(account.publicKey));
    storage.set("secretKey", JSON.stringify(account.secretKey));

    return account;
  } else {
    const secretKey = Object.values(JSON.parse(storage.get("secretKey")));
    const account = await new Account(secretKey);

    console.log(account.publicKey.toBase58(), account.secretKey, "???");

    return account;
  }
}
