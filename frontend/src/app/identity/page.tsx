'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProofStore } from '@/hooks/useProofStore';
import { keccak256, toBytes } from 'viem';
import { ArrowRight, User } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export default function MockIdentityScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [mockedData, setMockedData] = useState<any>(null);
  const router = useRouter();

  const setIdentityProof = useProofStore((state) => state.setIdentityProof);

  useEffect(() => {
    if (!videoRef.current) return;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleMockScan = () => {
    const mockPassportData = {
      documentType: 'Passport',
      documentNumber: 'X1234567',
      name: 'John',
      lastName: 'Doe'
    };

    setMockedData(mockPassportData);
    setIdentityProof(mockPassportData);
    setScanning(false);
  };
return (
  <div className="min-h-screen w-full flex flex-col p-6 bg-gray-900">
    {/* Breadcrumb arriba */}
    <div className="flex flex-col items-center">
      <Breadcrumb active="identity" />
       <div className="max-w-fit group p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 mb-6">
        <div className="flex items-start space-x-5">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
          <User className="w-6 h-6 text-blue-300" />
        </div>
       <div className="flex-1 max-w-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Identity</h1>
          <p className="text-purple-200 text-sm">
            Use this section to <strong>verify your identity</strong> and generate a <strong>KYC proof</strong> to ensure you meet compliance requirements.
          </p>
          </div>
          </div>
          </div>
    </div>

    {/* Contenido central en grid */}
    <div className="flex-1 w-full grid grid-cols-[1fr_auto_1fr] items-start justify-center">
      {/* Left spacer */}
      <div></div>

      {/* Center column (scanner + button) */}
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-md aspect-video border-4 border-blue-500 rounded-xl overflow-hidden z-10">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-4 border-dashed border-green-400 m-8 rounded-lg pointer-events-none" />
        </div>

        <button
          onClick={handleMockScan}
          className="cursor-pointer mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
        >
          Scan ID
        </button>
      </div>

      {/* Right column (info block) */}
      {mockedData && (
        <div className="ml-10 mb-15 bg-white text-black rounded-lg shadow p-6 w-72">
          <h2 className="text-xl font-bold mb-4">Identity Details</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Document Type:</span> {mockedData.documentType}</p>
            <p><span className="font-semibold">Document Number:</span> {mockedData.documentNumber}</p>
            <p><span className="font-semibold">Name:</span> {mockedData.name}</p>
            <p><span className="font-semibold">Last Name:</span> {mockedData.lastName}</p>
          </div>
          <button
            onClick={() => router.push('/scoring')}
            className="cursor-pointer mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Continue <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  </div>
);



}
