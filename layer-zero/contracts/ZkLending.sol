// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OApp, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";

contract ZkLending is Ownable, OApp, OAppOptionsType3  {
    uint256 public minScore;
    address public composer;

    mapping(address => bool) public hasWithdrawn;
    mapping(address => uint256) public approvedLoanAmount;

    constructor(address _endpoint, address _delegate, uint256 _minScore)
        OApp(_endpoint, _delegate)
        Ownable(_delegate)
    {
        minScore = _minScore;
    }

    function _lzReceive(
        Origin calldata origin,
        bytes32 guid,
        bytes calldata payload,
        address executor,
        bytes calldata extraData
    ) internal override {
        // Decode the payload to extract the loan approval data and the user's passport hash
        (address user, uint256 maxLoan, bytes32 scoreHash) =
            abi.decode(payload, (address, uint256, bytes32));

        approvedLoanAmount[user] = maxLoan;

        // Compose message to Composer with user address and scoreHash
        bytes memory composePayload = abi.encode(user, scoreHash);

        // Send composed message to the Composer with hash to store
        endpoint.sendCompose(
            composer, // destination OApp (Composer)
            guid,     // same GUID from the original message
            0,        // compose index (0 for single compose)
            composePayload
        );
    }

    function withdrawLoan() external {
        uint256 amount = approvedLoanAmount[msg.sender];
        require(amount > 0, "No approved loan");
        require(!hasWithdrawn[msg.sender], "Already withdrawn");
        require(address(this).balance >= amount, "Insufficient contract balance");

        hasWithdrawn[msg.sender] = true;
        payable(msg.sender).transfer(amount);
    }

    function setComposer(address _composer) external onlyOwner {
    composer = _composer;
    }

    receive() external payable {}

    function fundVault() external payable {}

    function setMinScore(uint256 _score) external onlyOwner {
        minScore = _score;
    }

    function withdrawAll() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}