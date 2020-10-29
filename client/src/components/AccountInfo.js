const AccountInfo = ({ account, solana }) => {
  return account ? (
    <div>
      <div>{account.publicKey.toBase58()}</div>
      <div>{JSON.stringify(account.secretKey)}</div>
    </div>
  ) : null;
};

export default AccountInfo;
