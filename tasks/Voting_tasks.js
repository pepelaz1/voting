task("addVoting", "Adds new voting")
  .addParam("address","Address of the contract")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const { address: contractAddress } = taskArgs;
    const { abi } = await hre.artifacts.readArtifact("Voting");

    const contract = new hre.ethers.Contract(
        contractAddress, abi, signer
    )
    await contract.addVoting()
 });


 task("vote", "Vote for specific candidate")
  .addParam("address","Address of the contract")
  .addParam("number","Number of existing voting")
  .addParam("who","Address that voted")
  .addParam("whom","Account being voted to")
  .setAction(async (taskArgs, hre) => {
    const { address: contractAddress, number: votingNumber, who: who, whom: whom } = taskArgs;
    const { abi } = await hre.artifacts.readArtifact("Voting");
    const [signer] = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
        contractAddress, abi, signer
    )
    const whoSigner = await contract.provider.getSigner(who)
    await contract.connect(whoSigner).vote(votingNumber, whom)
 });


 task("finish", "Finish specific voting")
 .addParam("address","Address of the contract")
 .addParam("number","Number of existing voting")
 .addParam("who","Address that wants to finish")
 .setAction(async (taskArgs, hre) => {
   const [signer] = await hre.ethers.getSigners();
   const { address: contractAddress, number: votingNumber, who: who } = taskArgs;
   const { abi } = await hre.artifacts.readArtifact("Voting");

   const contract = new hre.ethers.Contract(
       contractAddress, abi, signer
   )
   const whoSigner = await contract.provider.getSigner(who)
   await contract.connect(whoSigner).finish(votingNumber)
});

task("withdrawComission", "Withdraw comission to owner")
.addParam("address","Address of the contract")
.addParam("who","Address that wants to withdrawn")
.setAction(async (taskArgs, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const { address: contractAddress,  who: who } = taskArgs;
  const { abi } = await hre.artifacts.readArtifact("Voting");

  const contract = new hre.ethers.Contract(
      contractAddress, abi, signer
  )
  const whoSigner = await contract.provider.getSigner(who)
  await contract.connect(whoSigner).withdrawComission()
});

task("getCandidates", "Show existing candidates for specific voting")
.addParam("address","Address of the contract")
.addParam("number","Number of existing voting")
.setAction(async (taskArgs, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const { address: contractAddress, number: votingNumber } = taskArgs;
  const { abi } = await hre.artifacts.readArtifact("Voting");

  const contract = new hre.ethers.Contract(
      contractAddress, abi, signer
  )
  await contract.getCandidates(votingNumber)
});

task("getCount", "Show count for specific candidate of specific voting")
.addParam("address","Address of the contract")
.addParam("number","Number of existing voting")
.addParam("candidate","Candidate")
.setAction(async (taskArgs, hre) => {
  const { address: contractAddress, number: votingNumber, candidate: candidate } = taskArgs;
  const { abi } = await hre.artifacts.readArtifact("Voting");
  const [signer] = await hre.ethers.getSigners();

  const contract = new hre.ethers.Contract(
      contractAddress, abi, signer
  )
  await contract.getCount(votingNumber, candidate)
});
