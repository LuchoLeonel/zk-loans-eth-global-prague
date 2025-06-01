// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OApp, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";

contract ZkLending is Ownable, OApp, OAppOptionsType3  {
    uint256 public minScore;

    mapping(address => bool) public hasWithdrawn;
    mapping(address => uint256) public approvedLoanAmount;

    constructor(address _endpoint, address _delegate, uint256 _minScore)
        OApp(_endpoint, _delegate)
        Ownable(_delegate) // 👈 esto estaba faltando
    {
        minScore = _minScore;
    }

    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata payload,
        address,
        bytes calldata
    ) internal override {
        (address user, uint256 maxLoan) = abi.decode(payload, (address, uint256));
        approvedLoanAmount[user] = maxLoan;
    }

    function withdrawLoan() external {
        uint256 amount = approvedLoanAmount[msg.sender];
        require(amount > 0, "No approved loan");
        require(!hasWithdrawn[msg.sender], "Already withdrawn");
        require(address(this).balance >= amount, "Insufficient contract balance");

        hasWithdrawn[msg.sender] = true;
        payable(msg.sender).transfer(amount);
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