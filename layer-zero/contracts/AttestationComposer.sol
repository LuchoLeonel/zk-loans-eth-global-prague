// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttestationComposer
 * @notice Stores a signature and scoreHash after cross-chain approval
 */
contract AttestationComposer is IOAppComposer, Ownable {
    address public immutable endpoint;
    address public immutable oApp;

    struct Metadata {
        bytes signature;
        bytes32 scoreHash;
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
        require(msg.sender == endpoint, "Unauthorized sender");
        require(_oApp == oApp, "Invalid source OApp");

        // Suponiendo que el mensaje fue encodeado así:
        (address user, bytes memory signature, bytes32 scoreHash) =
            abi.decode(_message, (address, bytes, bytes32));

        userMetadata[user] = Metadata(signature, scoreHash);
        emit MetadataStored(user, scoreHash);
    }

    function getMetadata(address user) external view returns (bytes memory signature, bytes32 scoreHash) {
        Metadata memory data = userMetadata[user];
        return (data.signature, data.scoreHash);
    }
}