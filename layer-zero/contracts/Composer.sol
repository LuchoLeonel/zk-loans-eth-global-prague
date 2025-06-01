// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Composer
 * @notice Stores a signature and scoreHash after cross-chain approval
 */
contract Composer is IOAppComposer, Ownable {
    address public immutable endpoint;
    address public immutable oApp;

    struct Metadata {
        bytes32 docHash; // docHash of the user's that he signs
    }

    mapping(address => Metadata) public userMetadata;

    event MetadataStored(address indexed user, bytes32 scoreHash);

    constructor(address _endpoint, address _oApp) Ownable(msg.sender) {
        endpoint = _endpoint;
        oApp = _oApp;
    }

    function lzCompose(
        address _oApp,
        bytes32, // _guid
        bytes calldata _message,
        address, // _executor
        bytes calldata // _extraData
    ) external payable override {
        require(_oApp == oApp, "Invalid source OApp");

        // Guess the message format is (address user, bytes32 docHash)
        (address user, bytes32 docHash) =
            abi.decode(_message, (address, bytes32));

        userMetadata[user] = Metadata(docHash);
        emit MetadataStored(user, docHash);
    }

    function getMetadata(address user) external view returns (bytes32 docHash) {
        return userMetadata[user].docHash;
    }
}