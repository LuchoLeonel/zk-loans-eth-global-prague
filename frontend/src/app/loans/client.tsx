"use client";

import { useEffect, useState } from 'react';
import { useDynamicContext, useSwitchNetwork } from '@dynamic-labs/sdk-react-core';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeDollarSign, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import proverSpec from "@/contracts/ZkLending.json";
import { getWeb3Provider,getSigner, } from '@dynamic-labs/ethers-v6'
import { ethers, InterfaceAbi, BrowserProvider } from "ethers";
import { rootstockTestnet } from "viem/chains";


export const LoanCard: React.FC<LoanCardProps> = ({ maxLoan, probability, score }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const rootstockChainId = "0x1254";
  const { primaryWallet,  } = useDynamicContext();
  const switchNetwork = useSwitchNetwork();

  async function handleClaimLoan() {
    try {
        setLoading(true);

        const provider = await getWeb3Provider(primaryWallet)
        const currentNetwork = await provider.getNetwork();

        if (currentNetwork.chainId !== parseInt(rootstockChainId, 16)) {
            console.log('Switching to Rootstock Testnet...');

            try {
                await switchNetwork({
                    wallet: primaryWallet!,
                    network: rootstockTestnet.id,
                });
                console.log('Successfully switched to Rootstock Testnet.');
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                alert('⚠ Rootstock Testnet is not added to your wallet.');
                } else {
                throw new Error('User rejected network switch or unknown error.');
                }
            }
            }

        const signer = await getSigner(primaryWallet);
        const contractAddress = process.env.NEXT_PUBLIC_ROOTSTOCK_LENDING_ADDRESS!;
        const abi = proverSpec.abi as InterfaceAbi;

        const contract = new ethers.Contract(contractAddress, abi, signer);

        console.log('Calling withdrawLoan()...');

        const tx = await contract.withdrawLoan();
        console.log('Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('Transaction confirmed!', receipt);

    } catch (error) {
        console.error('Error claiming loan:', error);
        alert('❌ Error claiming loan. Check console.');
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/30 backdrop-blur-xl shadow-md">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center">
          <ShieldCheck className="w-6 h-6 mr-2 text-white" />
          <CardTitle className="text-white text-2xl">Rootstock Loan Offer</CardTitle>
        </div>
        <Image
          src="/rootstock_logo.png" // Asegúrate de que esta ruta sea correcta y que el logo esté en la carpeta 'public/assets'
          alt="Rootstock Logo"
          width={40}
          height={40}
        />
      </CardHeader>
      <CardContent className="text-purple-200">
        <p className="mb-4">
          Based on your credit score, you're eligible for a loan through the Rootstock network.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-purple-700/20 text-purple-100 shadow-inner">
            <div className="flex items-center mb-2">
              <BadgeDollarSign className="w-6 h-6 mr-2" />
              <span className="font-bold">Credit Score</span>
            </div>
            <div className="text-4xl font-extrabold">{score}/100</div>
            <div className="mt-1 text-sm">
              Probability of Repayment: <strong>{probability}%</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-700/20 text-purple-100 shadow-inner">
            <div className="flex items-center mb-2">
              <BadgeDollarSign className="w-6 h-6 mr-2" />
              <span className="font-bold">Max Loan Eligible</span>
            </div>
            <div className="text-4xl font-extrabold">${maxLoan} USDC</div>
            <div className="mt-1 text-sm">Fixed rate as per contract</div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={handleClaimLoan}
            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Claim Loan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function ClaimLoanPage() {
  const { primaryWallet } = useDynamicContext();
  const [loanScore, setLoanScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoanScore = async () => {
      if (!primaryWallet?.address) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/score/${primaryWallet.address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch loan score');
        }
        const data = await response.json();
        setLoanScore({
          score: data.score,
          probability: data.probability,
          maxLoan: data.maxLoan,
        });
      } catch (error) {
        console.error('Error fetching loan score:', error);
        setLoanScore(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanScore();
  }, [primaryWallet?.address]);

  if (loading) {
    return <div>Loading...</div>; // Puedes reemplazar esto con un spinner o componente de carga
  }

  return (
    <div className="min-h-screen p-4 max-w-5xl mx-auto space-y-6">
    <Breadcrumb active="loans" />
      {loanScore ? (
        <LoanCard
          maxLoan={loanScore.maxLoan}
          probability={loanScore.probability}
          score={loanScore.score}
        />
      ) : (
        <div>No loan score available for this address.</div>
      )}
    </div>
  );
}


interface LoanCardProps {
  maxLoan: number;
  probability: number;
  score: number;
}
