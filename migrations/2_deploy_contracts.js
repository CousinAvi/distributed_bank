var Token = artifacts.require("./Token.sol");
var dBank = artifacts.require("./dBank.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Token);
  await deployer.deploy(dBank, Token.address);
  token = await Token.deployed();
  await token.passMinterRole(dBank.address);
};
