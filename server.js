const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const {
  default: connectToSolana,
} = require("./client/src/utils/connectToSolana");
const { PublicKey } = require("@solana/web3.js");
// Sentry.init({
//   dsn: 'https://1c2161c3355341099251260800b07f16@sentry.io/5188534',
// })

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

  let pk = new PublicKey(getData.programId);
  let account = await connection.getAccountInfo(pk);
  const data = await Buffer.from(account.data);
  let corectdata = data.toString();
  console.log(corectdata, "DATA");
  //   const accountDataLayout = BufferLayout.struct([
  //     BufferLayout.u32("vc1"),
  //     BufferLayout.u32("vc2"),
  //   ]);

  res.json("test");
});

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "localhost:3000"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept",
//   );
//   next();
// });

app.use(function (err, req, res, next) {
  console.log(err);
  return res
    .status(err.status || 500)
    .send(err.message || GENERIC_ERROR_MESSAGE());
});

app.listen(4000, function () {
  console.log(`Server starting on port 4000!`);
});
