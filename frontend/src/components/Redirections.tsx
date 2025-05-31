'use client'
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, SkipForward } from "lucide-react"
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { handleRequestBankSummary } from "@/lib/utils"

export function RedirectFromHome() {
  const router = useRouter()
  const isLoggedIn = useIsLoggedIn()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      setShowDialog(true)
    }
  }, [isLoggedIn])

  const handleEmailSummary = () => {
    setShowDialog(false)
    handleRequestBankSummary();
  }

  const handleSkipStep = () => {
    setShowDialog(false)
    router.replace("/teleporter")
  }

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
  )
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