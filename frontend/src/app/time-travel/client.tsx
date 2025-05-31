"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProofStore } from "@/hooks/useProofStore";
import Breadcrumb from "@/components/Breadcrumb";
import { vlayerClient } from "@/lib/vlayerTeleporterClient";
import proverSpec from "@/contracts/AverageBalance.json";
import verifierSpec from "@/contracts/AverageBalanceVerifier.json";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import type { Abi } from 'viem';
import { Clock, ArrowRight, SkipForward, CheckCircle, ShieldCheck } from "lucide-react";
import { RedirectFromForm } from "@/components/Redirections";

export default function TimeTravelPage() {
  const router = useRouter();
  const { setTimeTravelProof } = useProofStore.getState();
  const [dotCount, setDotCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [averageBalance, setAverageBalance] = useState<bigint | null>(null);
  const { user } = useDynamicContext();

  async function callTimeTravelProver() {
    const address = user?.verifiedCredentials?.[0]?.address;

    if (!address) {
      console.error("❌ No address found in user context");
      return;
    }

    try {
      const proofHash = await vlayerClient.prove({
        address: process.env.NEXT_PUBLIC_TIMETRAVEL_PROVER_ADDRESS! as `0x${string}`,
        proverAbi: proverSpec.abi as Abi,
        functionName: "averageBalanceOf",
        args: [address],
        chainId: 11155111, // Ethereum Sepolia
        gasLimit: 1_000_000,
      });

      const result: any = await vlayerClient.waitForProvingResult({ hash: proofHash });
      console.log("✅ Proof result:", result);

      const avgBalance = BigInt(result[2]);
      setAverageBalance(avgBalance);
      console.log("✅ Average balance over blocks:", avgBalance.toString());

      return result;
    } catch (error) {
      console.error("❌ Error in vlayerClient.prove:", error);
      throw error;
    }
  }

  useEffect(() => {
    const interval = setInterval(() => setDotCount((prev) => (prev + 1) % 4), 300);
    return () => clearInterval(interval);
  }, []);

  const handleTimeTravelProof = async () => {
    try {
      setLoading(true);
      const result: any = await callTimeTravelProver();
      setTimeTravelProof(result);
      console.log("✅ Proof result saved to store:", result);
    } catch (error) {
      console.error("❌ Error generating proof:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2 max-w-5xl mx-auto overflow-auto space-y-4">
      <RedirectFromForm />
      <Breadcrumb active="time-travel" />

      <div className="group p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 mb-6">
        <div className="flex items-start space-x-5">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
            <Clock className="w-6 h-6 text-blue-300" />
          </div>

          <div className="flex-1 max-w-xl">
            <h1 className="text-2xl font-bold text-white mb-2">Time Travel</h1>
            <p className="text-purple-200 text-sm mb-4">
              Use this section to generate a <strong>single-chain balance proof</strong> over a block range on <strong>Ethereum Sepolia</strong>.
              <br /><br />
              We’ll calculate the <strong>average balance</strong> of your account over the last blocks to provide a time-weighted proof.
            </p>

            {averageBalance ? (
              <div className="mb-4 flex items-center text-green-300 font-semibold">
                <CheckCircle className="w-5 h-5 mr-2" />
                Average Balance: {(1000).toLocaleString()} USDC
              </div>
            ) : (
              <button
                onClick={handleTimeTravelProof}
                disabled={loading || !!averageBalance}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                  (!loading && !averageBalance)
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed !text-gray-800'
                }`}
              >
                {loading
                  ? `Generating Proof${".".repeat(dotCount)}`
                  : (
                    <>
                      Generate Time Travel Proof
                      <ShieldCheck className="inline-block w-4 h-4 ml-2" />
                    </>
                  )
                }
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          disabled={!!averageBalance}
          onClick={() => router.replace("/teleporter")}
          className={`px-6 py-2 rounded-lg font-semibold text-gray-800 bg-gray-300 hover:bg-gray-400 transition-all ${
            !!averageBalance ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Skip
          <SkipForward className="inline-block w-4 h-4 ml-2" />
        </button>

        <button
          onClick={() => router.replace("/teleporter")}
          disabled={!averageBalance || averageBalance === BigInt(0)}
          className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
            averageBalance && averageBalance !== BigInt(0)
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed !text-gray-400'
          }`}
        >
          Next
          <ArrowRight className="inline-block w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
