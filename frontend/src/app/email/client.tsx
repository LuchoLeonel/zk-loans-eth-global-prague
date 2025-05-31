"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProofStore } from "@/hooks/useProofStore";
import pLimit from "p-limit";
import { isEmpty } from "lodash";
import { Mail, ArrowRight } from 'lucide-react';
import Breadcrumb from "@/components/Breadcrumb";
import { vlayerClient } from "@/lib/vlayerTeleporterClient";
import proverSpec from "@/contracts/BankSummaryProver.json";
import { Abi } from "viem";
import { preverifyEmail } from "@vlayer/sdk";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RedirectFromForm } from "@/components/Redirections";

const EmailTable = ({ emails, handleEmailProof, status }: any) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const router = useRouter();
  const [dotCount, setDotCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false)
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null)

  useEffect(() => {
      const interval = setInterval(() => setDotCount((prev) => (prev + 1) % 4), 300);
      return () => clearInterval(interval);
    }, []);


  const toggleSelection = (id: string) => {
    setSelectedEmails((prev) =>
      prev.includes(id)
        ? prev.filter((emailId) => emailId !== id)
        : [...prev, id]
    );
  };

  function decodeQuotedPrintable(input: string) {
    return input
      .replace(/=(\r?\n)/g, "") // quita los saltos soft line breaks
      .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
  }

  const handleShowContent = async () => {
    const res = await fetch("/eml/bank_summary.eml")
    let emlContent = await res.text()
    emlContent = decodeQuotedPrintable(emlContent)
    const htmlPart = extractHtmlPart(emlContent)
    setFetchedHtml(htmlPart)
    setModalOpen(true)
  }

  function extractHtmlPart(emlContent: any) {
    const htmlMatch = emlContent.match(/<html[\s\S]*<\/html>/i)
    return htmlMatch ? htmlMatch[0] : "<p>No HTML part found</p>"
  }


  const handleNext = () => {
    const selected = emails.filter((email: any) => selectedEmails.includes(email.id));
    handleEmailProof(selected[0]);
  };

  const handleSkip = () => {
    router.push("/time-travel");
  };

  return (
    <div className="space-y-4 mb-20">
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-white/10 backdrop-blur-lg">
        <table className="w-full text-left border-collapse text-white">
          <thead>
            <tr className="bg-white/10 text-blue-200 text-sm">
              <th className="p-4 border-b border-white/10 font-semibold">Select</th>
              <th className="p-4 border-b border-white/10 font-semibold">Validity</th>
              <th className="p-4 border-b border-white/10 font-semibold">Sent on</th>
              <th className="p-4 border-b border-white/10 font-semibold">Subject</th>
              <th className="p-4 border-b border-white/10 font-semibold">Content</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email: any, idx: number) => (
              <tr
                key={email.id}
                className={`${
                  idx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'
                } hover:bg-blue-500/10 transition-colors`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="accent-blue-400 w-5 h-5 rounded border-gray-300 cursor-pointer"
                    disabled={!email.valid}
                    checked={selectedEmails.includes(email.id)}
                    onChange={() => toggleSelection(email.id)}
                  />
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      email.valid
                        ? 'bg-green-600/20 text-green-300 border border-green-400/20'
                        : 'bg-yellow-600/20 text-yellow-300 border border-yellow-400/20'
                    }`}
                  >
                    {email.valid ? 'Valid' : 'Invalid'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="block font-semibold text-white">
                    {email.sentAt.toLocaleDateString()}
                  </span>
                  <span className="block text-xs text-blue-200">
                    {email.sentAt.toLocaleTimeString()}
                  </span>
                </td>
                <td className="p-4 font-mono text-white">{email.subject}</td>
                <td className="p-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleShowContent()}
                      >
                        Show Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[90vw] max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>Bank Summary HTML Content</DialogTitle>
                      </DialogHeader>
                      <div className="p-2 overflow-auto max-h-[80vh] border rounded bg-white text-black">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: fetchedHtml || "<p>Loading...</p>",
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    <div className="flex justify-between mt-4 mx-1">
        <button
          onClick={handleSkip}
          className="px-6 py-2 cursor-pointer rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all"
        >
          Skip
        </button>


        {status === "finish" ?
            (
              <button
                onClick={() => router.replace("/time-travel")}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
              >
                Next
                <ArrowRight className="inline-block w-4 h-4 ml-2" />
              </button>
            ) 
            :
            (
            <button
              onClick={handleNext}
              disabled={status === "generating" || selectedEmails.length === 0}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                status === "generating" || selectedEmails.length === 0
                  ? 'bg-gray-300 cursor-not-allowed !text-gray-800'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              <span className="inline-flex items-center min-w-[200px] justify-center">
                {status === "generating"
                  ? (
                    <>
                      Generating Email Proof
                      <span className="inline-block w-[6px] text-left">
                        {".".repeat(dotCount)}{" ".repeat(3 - dotCount)}
                      </span>
                      <span className="w-4 h-4 ml-2 inline-block" />
                    </>
                  )
                  : 
                  (
                    <>
                      Generate Email Proof
                      <Mail className="inline-block w-4 h-4 ml-2" />
                    </>
                  )
                }
              </span>
            </button>
            )}
      </div>
    </div>
  );
};

export default function InboxPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const router = useRouter();
  const { setEmailProof } = useProofStore.getState();
  const [dotCount, setDotCount] = useState(0);
  const [emails, setEmails] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "generating" | "finish" | "error">("loading");

  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => setDotCount((prev) => (prev + 1) % 4), 300);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const isDemo = searchParams.get("demo") === "true";
  
    const fetchAndVerifyEmails = async () => {
      setStatus("loading");
      try {
  
        if (isDemo) {
          const demoFiles = ["bank_summary_3.eml"];
           const fetched = await Promise.all(
            demoFiles.map(async (filename, index) => {
              const res = await fetch(`/eml/${filename}`);
              const emlContent = await res.text();
              const subjectMatch = emlContent.match(/^Subject: (.+)$/m);
              const dateMatch = emlContent.match(/^Date: (.+)$/m);
              return {
                id: `demo-${index}`,
                subject: subjectMatch?.[1] ?? "(No subject)",
                sentAt: dateMatch ? new Date(dateMatch[1]) : new Date(),
                valid: true,
                emlContent,
              };
            })
          );

          setEmails(fetched);
          setStatus("idle");
          return;
        }
  
        if (!code) return;
        const tokenRes = await fetch("/api/exchange-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (!tokenRes.ok) throw new Error("Token exchange failed");
        const { access_token } = await tokenRes.json();
  
        const listRes = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:Bank Summary",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const { messages } = await listRes.json();
        if (!messages || messages.length === 0) {
          setEmails([]);
          setStatus("idle");
          return;
        }
  
        const limit = pLimit(4);
        const fetched = await Promise.all(
          messages.map((msg: any) =>
            limit(async () => {
              const emlRes = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=raw`,
                { headers: { Authorization: `Bearer ${access_token}` } }
              );
              const { raw } = await emlRes.json();
              const emlContent = Buffer.from(raw, "base64").toString("utf-8");
               const subjectMatch = emlContent.match(/^Subject: (.+)$/m);
              const dateMatch = emlContent.match(/^Date: (.+)$/m);
              return {
                id: msg.id,
                subject: subjectMatch?.[1] ?? "(No subject)",
                sentAt: dateMatch ? new Date(dateMatch[1]) : new Date(),
                valid: true,
                emlContent,
              };
            })
          )
        );
        setEmails(fetched);
        setStatus("idle");
      } catch (err) {
        console.error("Error:", err);
        setStatus("error");
      }
    };
  
    fetchAndVerifyEmails();
  }, [code, searchParams]);
  

  const handleEmailProof = async (eml: any) => {
      setStatus("generating");
      const proverAddress = process.env.NEXT_PUBLIC_EMAIL_PROVER_ADDRESS;

      if (!proverAddress) {
        throw new Error("Prover address is not set in environment variables");
      }

      const object = {
        mimeEmail: eml.emlContent,
        dnsResolverUrl: "https://test-dns.vlayer.xyz/dns-query",
        token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN,
      }
      const unverifiedEmail = await preverifyEmail(object);
     
      const proofHash = await vlayerClient.prove({
        address: proverAddress as `0x${string}`,
        proverAbi: proverSpec.abi as Abi,
        functionName: "main",
        args: [unverifiedEmail],
        chainId: 11155111, // por ejemplo Sepolia
        gasLimit: 1_000_000,
      });

      console.log("Proof hash:", proofHash);
      const result = await vlayerClient.waitForProvingResult({
        hash: proofHash,
        numberOfRetries: 100,
        sleepDuration: 2000, 
      });
      console.log("✅ Proof result:", result);

      // Guardar en tu store, redirigir, etc.
      setEmailProof(result);
      setStatus("finish");
  };


  return (
    <div className="h-screen overflow-auto p-2 max-w-5xl mx-auto scrollbar-thin scrollbar-thumb-blue-500">
      <RedirectFromForm />
      <Breadcrumb active="email-proof" />

      <div className="group p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 mb-6">
        <div className="flex items-start space-x-5">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
            <Mail className="w-6 h-6 text-blue-300" />
          </div>
          <div className="flex-1 max-w-xl">
            <h1 className="text-2xl font-bold text-white mb-2">Emails</h1>
            <p className="text-blue-200 text-sm">
              Your email will be used to verify your <strong>banking activity</strong> without disclosing any personal information.
              <br /><br />
              This allows you to prove financial facts without sharing sensitive details.
            </p>
          </div>
        </div>
        </div>

      {status === "loading" && <p className="text-blue-500 text-lg font-medium animate-pulse">Loading emails{".".repeat(dotCount)}</p>}
      {status === "error" && <p className="text-red-500">Failed to fetch emails.</p>}

      <div className="flex-1 overflow-auto">
        {emails.length > 0 ? (
          <Suspense fallback={<p className="text-gray-400">Loading table...</p>}>
            <EmailTable emails={emails} handleEmailProof={handleEmailProof} status={status} />
          </Suspense>
        ) : (
          status === "idle" && <p className="text-blue-300 text-lg">No matching emails found.</p>
        )}
      </div>

    </div>
  );
}
