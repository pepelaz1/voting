//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Voting {

    uint votingDuration = 24*60*60*3; // 3 days

    uint256 price = 10000000000000000; // 0.01 ether

    uint256 comission = 0;

    address public owner;

    struct Poll {
        uint deadline;
        bool isOver;
    }

    Poll[] polls;
 
    mapping(uint => mapping(address => uint)) candidateVotings;

    mapping(uint => mapping(address => bool)) addressesVoted;

    struct Max {
        uint count;
        uint256 value;
        address candidate;
    }

    mapping(uint => Max) maxVals;

    // for information

    mapping(uint => mapping(address => bool)) candidateExists;

    mapping(uint => address[]) candidates;

    constructor() {
        owner = msg.sender;
    }

    function addVoting() public {
        require(owner == msg.sender, 'Only owner can create a voting');
        polls.push(Poll({deadline: block.timestamp + votingDuration, isOver: false}));
    }

    function vote(uint _votingNumber, address _candidate) payable public {
         require( _votingNumber < polls.length, 'There is no voting with such number'); 
         require(!polls[_votingNumber].isOver, 'Voting is already over'); 
         require(addressesVoted[_votingNumber][msg.sender] == false, 'You have already participated in this poll'); 
         require(block.timestamp < polls[_votingNumber].deadline, 'Deadline has reached. Please manually stop the voting.'); 
         require(msg.value == price, 'To participate you need to transfer exact 0.01 ether');

         candidateVotings[_votingNumber][_candidate] += 1;
         if (candidateVotings[_votingNumber][_candidate] > maxVals[_votingNumber].count) {
             maxVals[_votingNumber].count = candidateVotings[_votingNumber][_candidate];
             maxVals[_votingNumber].value += price;
             maxVals[_votingNumber].candidate = _candidate;
         }
         addressesVoted[_votingNumber][msg.sender] = true;

         if (!candidateExists[_votingNumber][_candidate]) {
             candidateExists[_votingNumber][_candidate] = true;
             candidates[_votingNumber].push(_candidate);
         }
    }

    function finish(uint _votingNumber) public {
        require( _votingNumber < polls.length, 'There is no voting with such number'); 
        require(block.timestamp > polls[_votingNumber].deadline, 'Deadline has not reached yet.'); 

        polls[_votingNumber].isOver = true;

        // send  90% to winner 
         uint256 value = maxVals[_votingNumber].value / 100 * 90;
         address payable winner = payable(maxVals[_votingNumber].candidate);
         winner.transfer(value);

         // preserve 10% 
         comission += maxVals[_votingNumber].value / 100 * 10;
    }

    function withdrawComission() public {
        require(owner == msg.sender, 'Only owner can withdraw a comission');

        // transfer comission to owner
        payable(owner).transfer(comission);
        comission = 0;
    }

    // get candidates for specific voiting
    function getCandidates(uint _votingNumber) public view returns(address[] memory) {     
        require( _votingNumber < polls.length, 'There is no voting with such number'); 
        return candidates[_votingNumber];
    }

    // get count for specific candidate of specific voting
    function getCount(uint _votingNumber, address _candidate) public view returns(uint) {
        return candidateVotings[_votingNumber][_candidate];
    } 
}