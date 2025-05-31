// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract ZkScoreSender is Ownable, OApp{
    constructor(address _endpoint, address _delegate)
        OApp(_endpoint, _delegate)
        Ownable(_delegate) {}

    /// @notice Send (user, score) to Rootstock
    function sendScore(
        uint32 _dstEid,
        address user,
        uint256 score,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory payload = abi.encode(user, score);
        receipt = _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    function _lzReceive(
    Origin calldata,
    bytes32,
    bytes calldata,
    address,
    bytes calldata
) internal pure override {
    revert("ZkScoreSender does not support receiving");
}
}