'use client'

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { DynamicWidget, useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useRouter, usePathname } from "next/navigation"
import { Lock, Github, Twitter } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isLoggedIn = useIsLoggedIn()
  const { handleLogOut } = useDynamicContext()

  const [voiceprintPresent, setVoiceprintPresent] = useState(false)

  const checkVoiceprint = () => {
    const vp = localStorage.getItem("voiceprint")
    const isValid = vp && vp !== 'undefined' && vp !== 'null'
    setVoiceprintPresent(!!isValid)
  }

  useEffect(() => {
    checkVoiceprint()
  }, [])

  useEffect(() => {
    checkVoiceprint()
  }, [pathname])

  const handleRestartDemo = () => {
    localStorage.removeItem("voiceprint")
    handleLogOut()
    router.push("/")
  }

  const shouldShowButton = isLoggedIn && voiceprintPresent

  return (
      <header className="flex items-center justify-between p-2 lg:p-2">
          <div className="flex items-center space-x-3 px-4">
            <Image src="/logo-transparent.png" width={140} height={100} alt="logo" />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-blue-200 hover:text-white transition-colors relative group">
              Protocol
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors relative group">
              Docs
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors relative group">
              Security
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
          </nav>

          <div className="flex items-center space-x-4 px-4">
            <DynamicWidget />
          </div>
        </header>
  )
}

export default Header
