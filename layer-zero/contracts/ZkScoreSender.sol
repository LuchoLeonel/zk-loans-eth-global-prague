// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

interface IVerifier {
    function claim(
        Proof calldata proof,
        address claimer,
        uint256 average
    ) external;
}

struct Seal {
    bytes32 dummy;
}

struct CallAssumptions {
    bytes32 dummy;
}

struct Proof {
    Seal seal;
    bytes32 callGuestId;
    uint256 length;
    CallAssumptions callAssumptions;
}

contract ZkScoreSender is Ownable, OApp{
    IVerifier public verifier;

    struct ScoreData {
        uint256 score;
        uint256 probability;
        uint256 maxLoan;
    }

    mapping(address => ScoreData) public userScores;

    event ScoreSubmitted(address indexed claimer, uint256 score, uint256 probability, uint256 maxLoan);
    event ScoreSent(address indexed user, uint256 score, uint256 probability, uint256 maxLoan, uint32 dstEid);

    constructor(address _endpoint, address _delegate)
        OApp(_endpoint, _delegate)
        Ownable(_delegate) {}


    function submitScore(
            uint256 score,
            uint256 probability,
            uint256 maxLoan,
            Proof calldata proof,
            address claimer,
            uint256 average
        ) external {
            verifier.claim(proof, claimer, average);

            userScores[claimer] = ScoreData({
                score: score,
                probability: probability,
                maxLoan: maxLoan
            });

            emit ScoreSubmitted(claimer, score, probability, maxLoan);
        }

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