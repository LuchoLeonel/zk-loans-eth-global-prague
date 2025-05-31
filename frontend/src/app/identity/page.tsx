'use client';

import { useEffect, useRef, useState } from 'react';
import { ZKPassport } from '@zkpassport/sdk';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useProofStore } from '@/hooks/useProofStore';
import { isEmpty } from 'lodash';
import { User, CheckCircle, ShieldCheck, SkipForward, ArrowRight } from "lucide-react";
import Breadcrumb from '@/components/Breadcrumb';
import { RedirectFromForm } from '@/components/Redirections';

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export default function ZKPassportPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dots, setDots] = useState('');

  const zkpassportRef = useRef<ZKPassport | null>(null);
  const proofRef = useRef<any | null>(null);

  const { proofs: zkEmailProofs } = useProofStore();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const runZkPassport = async () => {
      setLoading(true);

      try {
        if (!zkpassportRef.current) {
          zkpassportRef.current = new ZKPassport();
        }

        const queryBuilder = await zkpassportRef.current.request({
          name: 'ZK-Loans Demo',
          logo: `${NEXT_PUBLIC_BASE_URL}/logo-black.png`,
          purpose: 'Verify your identity using ZKPassport',
          scope: 'identity-verification',
          devMode: true,
        });

        const {
          url,
          requestId,
          onRequestReceived,
          onGeneratingProof,
          onProofGenerated,
          onResult,
          onReject,
          onError,
        } = queryBuilder
          .disclose('document_type')
          .disclose('document_number')
          .gte('age', 18)
          .done();

        setUrl(url);
        setRequestId(requestId);
        setLoading(false); // listo para mostrar QR

        onRequestReceived(() => console.log('📩 Request received by user'));
        onGeneratingProof(() => {
          console.log('🔄 Generating proof...');
          setLoading(true);
        });

        onProofGenerated((proof) => {
          console.log('✅ Proof generated');
          proofRef.current = proof;
        });

        onResult(async ({ verified, result }) => {
          console.log('🎯 Result received:', result);

          if (!verified || !proofRef.current) {
            console.error('❌ Proof verification failed or proof missing');
            setLoading(false);
            return;
          }

          try {
            const passportData = {
              documentType: result.document_type?.disclose?.result ?? '',
              documentNumber: result.document_number?.disclose?.result ?? '',
            };

          
            //router.push('/claim');
          } catch (err) {
            console.error('❌ Error al enviar datos al backend:', err);
            setLoading(false);
          }
        });

        onReject(() => {
          console.warn('❌ User rejected the request');
          setLoading(false);
        });

        onError((err) => {
          console.error('💥 Error:', err);
          setLoading(false);
        });
      } catch (e) {
        console.error('💥 Init error:', e);
        setLoading(false);
      }
    };

    runZkPassport();
  }, [zkEmailProofs, router]);

 return (
  <div className="min-h-screen p-2 max-w-5xl mx-auto flex flex-col">
    <RedirectFromForm />
    <Breadcrumb active="identity" />

    <div className="flex-1 overflow-auto space-y-4">
      <div className="group p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 mb-6">
        <div className="flex items-start space-x-5">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
            <User className="w-6 h-6 text-blue-300" />
          </div>

          <div className="flex-1 max-w-xl">
            <h1 className="text-2xl font-bold text-white mb-4">Identity Verification</h1>
            <p className="text-purple-200 text-sm">
              We hash your <strong>document type</strong> and <strong>number</strong> on-chain to prevent anyone who has already taken or repaid a <strong>loan</strong> from requesting another with a different wallet — without revealing identity.
            </p>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <p className="text-blue-300 font-semibold">
            ⏳ Processing. Please wait{dots}
            {Array(3 - dots.length).fill('.').map((d, i) => (
              <span key={i} className="invisible">{d}</span>
            ))}
          </p>
        ) : url ? (
          <div className="flex justify-center ">
            <QRCode className="p-2 bg-white" value={url} size={256} />
          </div>
        ) : (
          <p className="text-gray-300">Loading request...</p>
        )}
      </div>
    </div>
  </div>
);

}
