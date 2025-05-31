"use client";

import { useMemo } from "react";
import { useProofStore } from "@/hooks/useProofStore";
import { CheckCircle, FileText, Mail, Clock, Zap, BadgeDollarSign } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { RedirectFromForm } from "@/components/Redirections";

export default function ClaimLoanPage() {
  const emailProof = useProofStore((state) => state.emailProof);
    const timeTravelProof = useProofStore((state) => state.timeTravelProof);
    const teleportProof = useProofStore((state) => state.teleportProof);
    const identityHash = useProofStore((state) => state.identityHash);

  const loanScore = useMemo(() => {
    if (!emailProof || !timeTravelProof || !teleportProof) return null;

    const bankBalance = emailProof[2];
    const timeTravelAvg = 1000;
    const teleportTotalBigInt = teleportProof[2].reduce(
        (acc, token) => acc + BigInt(token.balance),
        BigInt(0)
    );
    const teleportTotal = Number(teleportTotalBigInt);

    const bankScore = Math.min(bankBalance / 1000, 1) * 30;
    const timeScore = Math.min(timeTravelAvg / 500, 1) * 30;
    const teleportScore = Math.min(teleportTotal / 10000, 1) * 40;

    const score = bankScore + timeScore + teleportScore;

    let probability = 0;
    if (score >= 90) probability = 90;
    else if (score >= 70) probability = 70;
    else if (score >= 50) probability = 50;
    else probability = 0;

    const maxLoan = Math.min(
      bankBalance * 0.2,
      timeTravelAvg * 0.3,
      teleportTotal * 0.1
    );

    return {
      score: Math.round(score),
      probability,
      maxLoan: Math.floor(maxLoan),
    };
  }, [emailProof, timeTravelProof, teleportProof]);

  return (
    <div className="min-h-screen max-h-screen overflow-auto scrollbar-thin scrollbar-thumb-purple-600 p-4 max-w-5xl mx-auto space-y-6">
      <RedirectFromForm />
      <Breadcrumb active="claim-loan" />

      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/30 backdrop-blur-xl shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Loan Summary</h1>
        <p className="text-purple-200 text-sm mb-4">
          We’ve analyzed your proofs and calculated your <strong>credit score</strong>.
          Below is a detailed breakdown.
        </p>

        {loanScore && (
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
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProofCard
          title="Email Proof"
          icon={<Mail className="w-5 h-5" />}
          valid={!!emailProof}
          data={emailProof ? emailProof[2] : null}
        />
        <ProofCard
          title="Time Travel Proof"
          icon={<Clock className="w-5 h-5" />}
          valid={!!timeTravelProof}
          data={timeTravelProof ? 1000 : null}
        />
        <ProofCard
          title="Teleport Proof"
          icon={<Zap className="w-5 h-5" />}
          valid={!!teleportProof}
          data={teleportProof ? teleportProof[2] : null}
        />
        <ProofCard
          title="Identity Hash"
          icon={<FileText className="w-5 h-5" />}
          valid={!!identityHash}
          data={identityHash}
        />
      </div>
    </div>
  );
}

function ProofCard({ title, icon, valid, data }: any) {
  return (
    <div className={`p-4 rounded-xl shadow-md border ${valid ? 'border-green-400 bg-green-900/20' : 'border-red-400 bg-red-900/20'}`}>
      <div className="flex items-center mb-2">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
      </div>
      {valid ? (
        <pre className="text-xs overflow-x-auto max-h-32 scrollbar-thin scrollbar-thumb-purple-600">
          {typeof data === 'string' ? data : JSON.stringify(data, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
                2
                )}
        </pre>
      ) : (
        <p className="text-sm text-red-300">No data available.</p>
      )}
    </div>
  );
}
