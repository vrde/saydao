const { compile, deploy } = require("etherea/lib/solidity");

async function deployAll(wallet) {
  const sayDao = await deploy(
    await compile("./contracts/SayDAO.sol"),
    wallet,
    "0x0000000000000000000000000000000000000000"
  );
  wallet.loadContracts(sayDao);
  const sayToken = await deploy(
    await compile("./contracts/SayToken.sol"),
    wallet,
    wallet.contracts.SayDAO.address
  );
  const contracts = { ...sayDao, ...sayToken };
  wallet.loadContracts(contracts);
  await wallet.contracts.SayDAO.setTokenAddress(
    wallet.contracts.SayToken.address
  );
  return contracts;
}

module.exports = {
  deployAll,
};
