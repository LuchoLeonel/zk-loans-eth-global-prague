'use client'
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, SkipForward } from "lucide-react"
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { handleRequestBankSummary } from "@/lib/utils"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";


export function RedirectFromHome() {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkScore = async () => {
      if (isLoggedIn && primaryWallet?.address) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/score/${primaryWallet.address}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.score) {
              router.replace("/loans");
              return;
            }
          }
          setShowDialog(true);
        } catch (error) {
          console.error("Error checking score:", error);
          setShowDialog(true);
        }
      }
    };

    checkScore();
  }, [isLoggedIn, primaryWallet?.address, router]);

  const handleEmailSummary = () => {
    setShowDialog(false);
    handleRequestBankSummary();
  };

  const handleSkipStep = () => {
    setShowDialog(false);
    router.replace("/teleporter");
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Next Step</DialogTitle>
        </DialogHeader>
        <p className="text-gray-400 mb-4">
          You’re logged in! Would you like to present your <strong>bank summary by email</strong> or skip this step?
        </p>
        <div className="flex justify-end space-x-4">
          <Button onClick={handleEmailSummary} className="cursor-pointer flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>Present Email</span>
          </Button>
          <Button onClick={handleSkipStep} variant="secondary" className="cursor-pointer flex items-center space-x-1">
            <SkipForward className="w-4 h-4" />
            <span>Skip Step</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function RedirectFromForm() {
  const router = useRouter()
  const isLoggedIn = useIsLoggedIn()
  const hasCheckedLoginOnce = useRef(false)


  useEffect(() => {
    if (isLoggedIn === undefined || isLoggedIn === null) return;

    if (isLoggedIn) hasCheckedLoginOnce.current = true

    if (!hasCheckedLoginOnce.current) return;

    if (!isLoggedIn) {
      console.log('[Redirect] going to /')
      router.replace('/')
      return
    }
  }, [isLoggedIn, router])

  return null
}