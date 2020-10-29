import { useEffect, useState } from "react";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import AccountInfo from "./components/AccountInfo";
import GameClient from "./components/GameClient";
import connectToSolana from "./utils/connectToSolana";
import createAccount from "./utils/createAccount";

// import Home from "pages/HomePage";
// import Game from "pages/GamePage";
// import Setup from "pages/SetupPage";
// import Results from "pages/ResultsPage";
// import Wallet from "pages/WalletPage";

// import ClusterModal from "components/ClusterModal";
// import { LoadingModal } from "components/LoadingModal";
// import { useGameState } from "providers/game";
// import { useClusterModal } from "providers/server";

export default function App() {
  const [account, setAccount] = useState(null);
  const [solana, setSolana] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const asyncFunc = async () => {
      const connection = await connectToSolana();
      const newAccount = await createAccount();

      console.log(
        await connection.getBalance(newAccount.publicKey),
        "get balance",
      );

      setSolana(connection);
      setAccount(newAccount);
    };

    setLoading(true);
    asyncFunc();
    setLoading(false);
  }, []);
  // const isHomePage = !!useRouteMatch("/")?.isExact;
  // const isSetupPage = !!useRouteMatch("/setup")?.isExact;
  // const gameState = useGameState();
  // const [showClusterModal] = useClusterModal();
  // const showLoadingModal =
  //   !isHomePage && !isSetupPage && gameState === "loading";

  return (
    <div className="main-content">
      <header>
        <li>Header</li>
        <li>Game</li>
        <li>About</li>
        <li>Contact</li>
      </header>
      {account && <AccountInfo solana={solana} account={account} />}
      <Switch>
        {/* {account && (
        )} */}
        <Route path="/" exact component={GameClient} />
        {/* <Route path="/" exact component={Home} />
        <Route path="/game" exact component={Game} />
        <Route path="/setup" exact component={Setup} />
        <Route path="/results" exact component={Results} />
        <Route path="/wallet" exact component={Wallet} /> */}
        <Redirect from="*" to="/" exact />
      </Switch>
      {/* <LoadingModal show={showLoadingModal} /> */}
      {/* <ClusterModal /> */}
      {/* <Overlay show={showLoadingModal || showClusterModal} /> */}
    </div>
  );
}
