"use client";

import { useEffect, useMemo, useState } from "react";
import { useProofStore } from "@/hooks/useProofStore";
import { CheckCircle, User, Mail, Clock, Zap, BadgeDollarSign, Target, ShieldCheck } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { RedirectFromForm } from "@/components/Redirections";
import { ethers, InterfaceAbi, BrowserProvider } from "ethers";
import proverSpec from "@/contracts/ZkScoreSender.json";
import { useDynamicContext, useRpcProviders } from '@dynamic-labs/sdk-react-core';
import { getWeb3Provider,getSigner, } from '@dynamic-labs/ethers-v6'
import { useRouter } from 'next/navigation';
import { EndpointId } from '@layerzerolabs/lz-definitions'
import {Options} from '@layerzerolabs/lz-v2-utilities';

export default function ClaimLoanPage() {
  const [dotCount, setDotCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const emailProof = useProofStore((state) => state.emailProof);
  const timeTravelProof = useProofStore((state) => state.timeTravelProof);
  const teleportProof = useProofStore((state) => state.teleportProof);
  const identityProof = useProofStore((state) => state.identityProof);
  const { user, primaryWallet } = useDynamicContext();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setDotCount((prev) => (prev + 1) % 4), 300);
    return () => clearInterval(interval);
  }, []);

  const loanScore = useMemo(() => {
    let bankBalance = 0;
    let timeTravelAvg = 0;
    let teleportTotal = 0;

    let bankScore = 0;
    let timeScore = 0;
    let teleportScore = 0;

    if (emailProof) {
        bankBalance = emailProof[2];
        bankScore = Math.min(bankBalance / 1000, 1) * 30;
    }

    if (timeTravelProof) {
        timeTravelAvg = 1000; // Acá ponés tu lógica real si no es fijo
        timeScore = Math.min(timeTravelAvg / 500, 1) * 30;
    }

    if (teleportProof) {
        const teleportTotalBigInt = teleportProof[2].reduce(
        (acc: any, token: any) => acc + BigInt(token.balance),
        BigInt(0)
        );
        teleportTotal = Number(teleportTotalBigInt);
        teleportScore = Math.min(teleportTotal / 10000, 1) * 40;
    }

    const score = bankScore + timeScore + teleportScore;

    let probability = 0;
    if (score >= 90) probability = 90;
    else if (score >= 70) probability = 70;
    else if (score >= 50) probability = 50;

    const maxLoan = Math.min(
        bankBalance ? bankBalance * 0.2 : Infinity,
        timeTravelAvg ? timeTravelAvg * 0.1 : Infinity,
        teleportTotal ? teleportTotal * 0.1 : Infinity
    );

    return {
        score: Math.round(score),
        probability,
        maxLoan: Math.floor(maxLoan === Infinity ? 0 : maxLoan),
    };
    }, [emailProof, timeTravelProof, teleportProof]);


  async function handleSaveScoring() {
      try {
          setLoading(true);

          const signer = await getSigner(primaryWallet!)
          const contractAddress = process.env.NEXT_PUBLIC_ETH_SEPOLIA_SCORING_ADDRESS!;
          const abi = proverSpec.abi as InterfaceAbi;

          const contract = new ethers.Contract(contractAddress, abi, signer);

          const proof = timeTravelProof[0];
          const claimer = timeTravelProof[1];
          const average = timeTravelProof[2];
          const enid = EndpointId.ROOTSTOCK_V2_TESTNET;

          const options = Options.newOptions().addExecutorLzReceiveOption(80000).toHex();

          const tx = await contract.submitScore(
              loanScore.score,
              loanScore.probability,
              loanScore.maxLoan,
              proof,
              claimer,
              average,
              enid,
              options
          );

          console.log("Transaction sent:", tx.hash);
          await tx.wait();
          console.log("Transaction confirmed!");

            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/score`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                address: claimer,
                score: loanScore.score,
                probability: loanScore.probability,
                maxLoan: loanScore.maxLoan,
                firstName: 'John',            // <-- estos podés armarlos dinámicamente si tenés los datos
                lastName: 'Doe',
                documentType: 'Passport',
                documentNumber: 'A12345678',
              }),
            })
            .then((res) => {
              if (!res.ok) throw new Error('Failed to save score in backend');
              return res.json();
            })
            .then((data) => {
              console.log('Backend response:', data);
            })
            .catch((err) => {
              console.error('Error saving to backend:', err);
              alert('Error saving to backend. Check console.');
            });

          router.push("/loans");
      } catch (error) {
          console.error("Error submitting score:", error);
          alert("Error submitting score. Check console.");
      } finally {
          setLoading(false);
      }
  }


  return (
    <div className="min-h-screen max-h-screen overflow-auto scrollbar-thin scrollbar-thumb-purple-600 p-4 max-w-5xl mx-auto space-y-6">
      <RedirectFromForm />
      <Breadcrumb active="scoring" />

      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/30 backdrop-blur-xl shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2 flex flex-row justify-center items-center">
          <Target className="w-8 h-8 mr-2" /> Credit Score
        </h1>
        <p className="text-blue-100 text-sm mb-4">
          We’ve analyzed your proofs and calculated your <strong>credit score</strong>.
          Below is a detailed breakdown.
        </p>

      {loanScore && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-purple-700/20 text-purple-100 shadow-inner">
                <div className="flex items-center mb-2">
                  <BadgeDollarSign className="w-6 h-6 mr-2" />
                  <span className="font-bold">Credit Score</span>
                </div>
                <div className="text-4xl font-extrabold">{loanScore.score}/100</div>
                <div className="mt-1 text-sm">
                  Probability of Repayment: <strong>{loanScore.probability}%</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-700/20 text-purple-100 shadow-inner">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <span className="font-bold">Max Loan Eligible</span>
                </div>
                <div className="text-4xl font-extrabold">${loanScore.maxLoan} USDC</div>
                <div className="mt-1 text-sm">Fixed rate as per contract</div>
              </div>
            </div>

            {loanScore.score >= 50 ? (
              <div className="flex justify-center items-center">
              <button
                onClick={handleSaveScoring}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${'bg-purple-600 hover:bg-purple-700 cursor-pointer'}`}
              >
                {loading
                  ? `Creating Scoring${dotCount > 0 ? ".".repeat(dotCount) : " "}`
                  : (
                    <>
                      Generate Cross Chain Scoring
                      <ShieldCheck className="inline-block w-4 h-4 ml-2" />
                    </>
                  )
                }
              </button>
              </div>
            )
          :
          <p className="text-red-500 font-semibold mt-2 flex justify-center items-center">
            You are not eligible for a loan.
          </p>
          }
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProofCard
          title="Email Proof"
          icon={<Mail className="w-5 h-5" />}
          valid={!!emailProof}
        />
        <ProofCard
          title="Time Travel Proof"
          icon={<Clock className="w-5 h-5" />}
          valid={!!timeTravelProof}
        />
        <ProofCard
          title="Teleport Proof"
          icon={<Zap className="w-5 h-5" />}
          valid={!!teleportProof}
        />
       <ProofCard
          title="Identity Proof"
          icon={<User className="w-5 h-5" />}
          valid={!!identityProof}
        />
      </div>
    </div>
  );
}

function ProofCard({ title, icon, valid }: any) {
  return (
    <div className={`p-2 rounded-xl shadow-md border ${valid ? 'border-green-400 bg-green-900/20' : 'border-red-400 bg-red-900/20'}`}>
      <div className="flex items-center">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
      </div>
    </div>
  );
}
