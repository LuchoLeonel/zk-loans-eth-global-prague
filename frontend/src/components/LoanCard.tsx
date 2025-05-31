
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BadgeDollarSign, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LoanCardProps {
  maxLoan: number;
  probability: number;
  score: number;
}

export const LoanCard: React.FC<LoanCardProps> = ({ maxLoan, probability, score }) => {
  const router = useRouter();

  const handleClaimLoan = () => {
    router.push('/claim-loan');
  };

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
