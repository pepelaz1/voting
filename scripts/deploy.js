const hre = require('hardhat')
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const Voting = await ethers.getContractFactory('Voting', signer)
    const voting = await Voting.deploy()
    await voting.deployed()

    console.log("Deployed to:", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
