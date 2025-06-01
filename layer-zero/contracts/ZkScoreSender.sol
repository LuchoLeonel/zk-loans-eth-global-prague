// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";

interface IVerifier {
    function claim(
        Proof calldata proof,
        address claimer,
        uint256 average
    ) external;
}

enum ProofMode {
    GROTH16,
    FAKE
}

struct Seal {
    bytes4 verifierSelector;
    bytes32[8] seal;
    ProofMode mode;
}

struct CallAssumptions {
    address proverContractAddress;
    bytes4 functionSelector;
    uint64 settleChainId;
    uint64 settleBlockNumber;
    bytes32 settleBlockHash;
}

struct Proof {
    Seal seal;
    bytes32 callGuestId;
    uint256 length;
    CallAssumptions callAssumptions;
}


contract ZkScoreSender is Ownable, OApp, OAppOptionsType3 {
    IVerifier public verifier;

    struct ScoreData {
        uint256 score;
        uint256 probability;
        uint256 maxLoan;
    }

    mapping(address => ScoreData) public userScores;

    event ScoreSubmitted(address indexed claimer, uint256 score, uint256 probability, uint256 maxLoan);
    event ScoreSent(address indexed user, uint256 score, uint256 probability, uint256 maxLoan, uint32 dstEid);

    constructor(address _endpoint, address _delegate, address _verifier)
        OApp(_endpoint, _delegate)
        Ownable(_delegate) {
            verifier = IVerifier(_verifier);
    }


    function getScoreDetails(address user) external view returns (uint256 score, uint256 probability, uint256 maxLoan) {
        ScoreData memory data = userScores[user];
        return (data.score, data.probability, data.maxLoan);
    }

    function submitScore(
        uint256 score,
        uint256 probability,
        uint256 maxLoan,
        Proof calldata proof,
        address claimer,
        uint256 average,
        uint32 dstEid,
        bytes calldata options
    ) external payable returns (MessagingReceipt memory receipt) {
        // Verificar el proof si es necesario
        // verifier.claim(proof, claimer, average);

        userScores[claimer] = ScoreData({
            score: score,
            probability: probability,
            maxLoan: maxLoan
        });

        emit ScoreSubmitted(claimer, score, probability, maxLoan);

        bytes memory payload = abi.encode(claimer, maxLoan);

        receipt = _lzSend(
            dstEid,
            payload,
            options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit ScoreSent(claimer, score, probability, maxLoan, dstEid);
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