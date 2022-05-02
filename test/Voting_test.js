const { expect } = require("chai");
const { utils, BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Voting", function () {
    let acc1
    let acc2
    let acc3
    let voting

    beforeEach(async function() {
        [acc1, acc2, acc3] = await ethers.getSigners()
        const Voting = await ethers.getContractFactory('Voting', acc1)
        voting = await Voting.deploy()
        await voting.deployed()  
        //console.log("deployed to:", voting.address);
    })

    it("should be deployed", async function(){
        expect(voting.address).to.be.properAddress
    })

    it("should be able to add voting", async function() {
        const tx = await voting.addVoting()
        await tx.wait()
    })

    it("should not be able to add voting not by owner", async function() {
       await expect(
         voting.connect(acc2).addVoting()
       ).to.be.revertedWith("Only owner can create a voting");
    })

    it("should be able to vote", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()
    })

    it("should fail if vote with wrong voting number", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        await expect(
            voting.connect(acc2).vote(1, acc3.address, {value: BigNumber.from("10000000000000000")})
          ).to.be.revertedWith("There is no voting with such number");
     })

     it("should fail if already participated", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await expect(
            voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
          ).to.be.revertedWith("You have already participated in this poll");
     })

     it("should fail if send wrong value", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        await expect(
            voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("20000000000000000")})
          ).to.be.revertedWith("To participate you need to transfer exact 0.01 ether");
     })

    it("should be able to detect max values", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        const tx3 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx3.wait()

        const tx4 = await voting.connect(acc3).vote(0, acc2.address, {value: BigNumber.from("10000000000000000")})
        await tx4.wait()
    })

    it("should be able to skip existing candidate and doesn't save it twice", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        const tx3 = await voting.connect(acc1).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx3.wait()
    })

    it("should be able to finish", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await network.provider.send("evm_increaseTime", [259200])
        
        const tx3 = await voting.finish(0)
        await tx3.wait()
    })

    it("should fail to finish if send wrong voting number", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await network.provider.send("evm_increaseTime", [259200])
        
        await expect(
            voting.finish(1)
        ).to.be.revertedWith("There is no voting with such number");
    })

    it("should fail to finish if deadline has not reached yey", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()
        
        await expect(
            voting.finish(0)
        ).to.be.revertedWith("Deadline has not reached yet.");
    })

    it("should fail if voting already over", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await network.provider.send("evm_increaseTime", [259200])
        
        const tx3 = await voting.finish(0)
        await tx3.wait()

        await expect(
            voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        ).to.be.revertedWith("Voting is already over");
     })

     it("should fail to vote if deadline has already reached", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        await network.provider.send("evm_increaseTime", [259200])

        await expect(
            voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        ).to.be.revertedWith("Deadline has reached. Please manually stop the voting.");
     })


    it("should be able to withdraw comission", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await network.provider.send("evm_increaseTime", [259200])
        
        const tx3 = await voting.finish(0)
        await tx3.wait()

        const tx4 = await voting.connect(acc1).withdrawComission()
        await tx4.wait()
    })

    it("should fail to withdraw comission not by owner", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await network.provider.send("evm_increaseTime", [259200])
        
        const tx3 = await voting.finish(0)
        await tx3.wait()

        await expect(
            voting.connect(acc2).withdrawComission()
        ).to.be.revertedWith("Only owner can withdraw a comission");
    })

    it("should be able to get candidates", async function() {
        const tx = await voting.addVoting()
        await tx.wait()

        candidates = await voting.getCandidates(0)
    })

    it("should fail to get candidates if use wrong voting number", async function() {
        const tx = await voting.addVoting()
        await tx.wait()

     
        await expect(
            voting.getCandidates(1)
        ).to.be.revertedWith("There is no voting with such number");

    })

    it("should be able to get candidate count", async function() {
        const tx1 = await voting.addVoting()
        await tx1.wait()

        const tx2 = await voting.connect(acc2).vote(0, acc3.address, {value: BigNumber.from("10000000000000000")})
        await tx2.wait()

        await voting.getCount(0, acc3.address)
    })
});
