"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Lock, ArrowRight, Github, Twitter, Sparkles } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { RedirectFromHome } from "@/components/Redirections"

export default function ZKLoansLanding() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setShowAuthFlow } = useDynamicContext();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    const timer = setInterval(() => {
      setTime((prev) => prev + 0.01)
    }, 16)

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(timer)
    }
  }, [])

  // Canvas animation for the background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create nodes
    const nodeCount = 50
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(
        Math.random() * 55 + 200,
      )}, ${Math.random() * 0.5 + 0.2})`,
    }))

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 150)})`
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw and update nodes
      nodes.forEach((node) => {
        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Mouse interaction
        const dx = mousePosition.x - node.x
        const dy = mousePosition.y - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 100) {
          node.x -= (dx / distance) * 0.5
          node.y -= (dy / distance) * 0.5
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [mousePosition])

  return (
     <main className="flex-1 flex items-center px-6 lg:px-8">
        <RedirectFromHome />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-4 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="mt-4">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-2 relative" />
                  Zero-Knowledge Protocol
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight space-y-2">
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                    Borrow
                  </span>
                  <span className="block text-white">
                    without collateral
                  </span>
                </h1>
                </div>
                <p className="text-xl text-blue-100 leading-relaxed max-w-xl">
                  Experience true financial freedom with zero-knowledge privacy. No collateralized assets, no manual credit checks, no exposed personal data.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowAuthFlow(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 text-lg group shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  Get a Loan
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-blue-800/50">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    $4.2B+
                  </div>
                  <div className="text-sm text-blue-300 mt-1">Total Volume</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    25K+
                  </div>
                  <div className="text-sm text-blue-300 mt-1">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
                    100%
                  </div>
                  <div className="text-sm text-blue-300 mt-1">Privacy</div>
                </div>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="space-y-6">

              <div className="group p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
                    <Lock className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">No Collateral Required</h3>
                    <p className="text-blue-200">
                      Borrow based on your reputation from on-chain and off-chain proofs, not your assets. True DeFi lending for
                      everyone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-300">
                    <Shield className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Zero-Knowledge Privacy</h3>
                    <p className="text-blue-200">
                      Prove your creditworthiness without revealing personal information. Full financial privacy with cryptographic proofs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-gradient-to-r from-cyan-900/30 to-blue-900/20 border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-blue-400/30 rounded-xl flex items-center justify-center group-hover:from-cyan-500/50 group-hover:to-blue-400/50 transition-all duration-300">
                    <Zap className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                    <p className="text-blue-200">
                      Instant loan approvals and settlements powered by cutting-edge zero-knowledge technology and
                      optimized smart contracts.
                    </p>
                  </div>
                </div>
              </div>
             
            </div>
          </div>
        </main>
  )
}