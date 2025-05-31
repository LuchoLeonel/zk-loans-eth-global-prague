"use client";

import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { LoanCard } from '@/components/LoanCard';
import Breadcrumb from '@/components/Breadcrumb';

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
