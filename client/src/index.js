import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

// import "styles/index.scss";

import App from "./App";
// import { WalletProvider } from "providers/wallet";
// import { TransactionsProvider } from "providers/transactions";
// import { GameStateProvider } from "providers/game";
// import { ServerProvider } from "providers/server";
// import { RpcProvider } from "providers/rpc";

// if (process.env.NODE_ENV === "production") {
//   Sentry.init({
//     dsn:
//       "https://727cd3fff6f949449c1ce5030928e667@o434108.ingest.sentry.io/5411826",
//     integrations: [new Integrations.BrowserTracing()],
//     tracesSampleRate: 1.0,
//   });
// }

ReactDOM.render(
  <BrowserRouter>
    <App />
    {/* <WalletProvider>
      <ServerProvider>
        <RpcProvider>
          <TransactionsProvider>
            <GameStateProvider>
              <App />
            </GameStateProvider>
          </TransactionsProvider>
        </RpcProvider>
      </ServerProvider>
    </WalletProvider> */}
  </BrowserRouter>,
  document.getElementById("root"),
);
