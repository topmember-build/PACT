"use client";
import React, {useRef, useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>){
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const canvasEl = canvas;
    const context = canvasEl.getContext('2d');
    if(!context) return;
    const ctx = context;
    let raf = 0;
    let w = canvasEl.width = canvasEl.offsetWidth * devicePixelRatio;
    let h = canvasEl.height = canvasEl.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const particles = Array.from({length:36}).map(()=>({
      x: Math.random()*canvasEl.offsetWidth,
      y: Math.random()*canvasEl.offsetHeight,
      r: 1+Math.random()*3,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      alpha: 0.2 + Math.random()*0.6
    }));

    function resize(){
      w = canvasEl.width = canvasEl.offsetWidth * devicePixelRatio;
      h = canvasEl.height = canvasEl.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    }

    function draw(){
      ctx.clearRect(0,0,canvasEl.offsetWidth, canvasEl.offsetHeight);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if(p.x<0) p.x = canvasEl.offsetWidth; if(p.x>canvasEl.offsetWidth) p.x=0;
        if(p.y<0) p.y = canvasEl.offsetHeight; if(p.y>canvasEl.offsetHeight) p.y=0;
        ctx.beginPath(); ctx.fillStyle = `rgba(123,97,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  },[canvasRef]);
}

import PactJson from '../artifacts/contracts/Pact.sol/Pact.json';
import { ethers } from 'ethers';

const nativeTokenSymbol = process.env.NEXT_PUBLIC_NATIVE_TOKEN_SYMBOL || 'MON';
type PactInput = { token: string; amount: number; rule: string; message: string };

export default function SealCeremony({pact}:{pact?:PactInput}){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<'disconnected'|'connecting'|'connected'|'local-fallback'|'unsupported'>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [forceLocalWallet, setForceLocalWallet] = useState(false);

  async function connectWallet(useLocal = false){
    setError(null);
    setWalletStatus('connecting');

    if(!useLocal && typeof window !== 'undefined' && (window as any).ethereum){
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        setWalletAddress(address);
        setWalletChainId(Number(network.chainId));
        setWalletStatus('connected');

        return { provider, signer, network };
      } catch (err:any) {
        setWalletStatus('disconnected');
        setError(err?.message || 'Wallet connection failed');
        return null;
      }
    }

    try {
      const rpcUrl = process.env.NEXT_PUBLIC_NETWORK_RPC || 'http://127.0.0.1:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = await provider.getSigner(0);
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setWalletAddress(address);
      setWalletChainId(Number(network.chainId));
      setWalletStatus('local-fallback');
      return { provider, signer, network };
    } catch (err:any) {
      setWalletStatus('unsupported');
      setError('No injected wallet found and local test wallet failed.');
      return null;
    }
  }

  function getWalletStatusLabel(){
    if(walletStatus === 'connecting') return 'Connecting wallet…';
    if(walletStatus === 'connected') return `Connected: ${walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'unknown'} (${walletChainId})`;
    if(walletStatus === 'local-fallback') return `Local test wallet: ${walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'unknown'} (${walletChainId})`;
    if(walletStatus === 'unsupported') return 'No wallet available';
    return 'Wallet disconnected';
  }

  async function startSeal(){
    setSealing(true);
    setError(null);
    setSealed(false);

    const connection = await connectWallet(forceLocalWallet);
    if(!connection){
      setSealing(false);
      return;
    }

    const { provider, signer, network } = connection;
    const expectedChainId = process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID) : 31337;
    const chainId = Number(network.chainId);
    if(chainId !== expectedChainId){
      setError(`Please switch your wallet to the configured network (chainId ${expectedChainId}). Current chainId: ${chainId}`);
      setSealing(false);
      return;
    }

    (async ()=>{
      try{
        setTimeout(()=>{ setShowMsg(true); }, 900);

        const address = process.env.NEXT_PUBLIC_PACT_ADDRESS;
        if(!address) throw new Error('Contract address not configured');

        const contract = new ethers.Contract(address, PactJson.abi, signer);
        const latestBlock = await provider.getBlock('latest');
        const nowOnChain = latestBlock ? Number(latestBlock.timestamp) : Math.floor(Date.now() / 1000);
        const lockTimestamp = nowOnChain + 60 * 10; // 10 minute future buffer

        const createTx = await contract.createPact(ethers.ZeroAddress, lockTimestamp);
        const receipt = await createTx.wait();

        let pactId: number | undefined;
        for(const log of receipt.logs){
          try {
            const parsed = contract.interface.parseLog(log);
            if(parsed && parsed.name === 'PactCreated'){
              pactId = Number(parsed.args.pactId.toString());
              break;
            }
          } catch {
            continue;
          }
        }

        if(pactId === undefined){
          throw new Error('Unable to parse PactCreated event');
        }

        if(pact && pact.token === nativeTokenSymbol && pact.amount>0){
          const depositTx = await contract.deposit(pactId, { value: ethers.parseEther(String(pact.amount)) } as any);
          await depositTx.wait();
        }

        setSealed(true);
      }catch(e:any){
        console.error('Transaction failed', e);
        setError(e?.message || 'Transaction failed');
      }finally{
        setSealing(false);
      }
    })();
  }

  return (
    <div className="relative w-full max-w-3xl p-8">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:0.6}} className="mx-auto bg-black/30 rounded-[2rem] p-8 liquid-glass-strong max-w-md relative z-10">
        <div className="text-center">
          <motion.div initial={{scale:0}} animate={sealed?{scale:1.12}:{scale:1}} transition={{type:'spring', stiffness:120, damping:14}} className="mx-auto w-36 h-36 rounded-full liquid-glass flex items-center justify-center mb-4 bg-gradient-to-br from-primary/20 to-secondary/8">
            <motion.svg width="96" height="96" viewBox="0 0 48 48" fill="none">
              <motion.circle cx="24" cy="24" r="20" stroke="#B7A5FF" strokeWidth="1.2" opacity={sealed?1:0.5} />
              <motion.path d="M14 30L34 14M14 14h20v20" stroke="#fff" strokeWidth={sealed?2.2:1.6} strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          </motion.div>

          <motion.h3 initial={{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="font-heading italic text-2xl">Seal Your Pact</motion.h3>
          <motion.p initial={{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.15}} className="mt-2 text-white/80">A cinematic ceremony animates as you confirm the transaction.</motion.p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <div className="font-semibold text-white">Wallet Status</div>
              <div className="mt-2">{getWalletStatusLabel()}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={()=>connectWallet(false)} disabled={sealing} className="px-4 py-3 liquid-glass-strong w-full">
                Connect Wallet
              </button>
              <button onClick={()=>{ setForceLocalWallet(true); connectWallet(true); }} disabled={sealing} className="px-4 py-3 border border-white/10 w-full">
                Use Local Monad Wallet
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={startSeal} disabled={sealing || sealed} className={`inline-flex items-center justify-center gap-3 ${sealing ? 'opacity-70' : 'opacity-100'} liquid-glass-strong px-5 py-2 w-full sm:w-auto`}>
                {sealing ? 'Sealing…' : sealed ? 'Sealed' : 'Seal Pact'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M7 7h10v10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={()=>setShowMsg(s=>!s)} className="px-4 py-3 border border-white/10 w-full sm:w-auto">
                {showMsg ? 'Hide Message' : 'Future Message'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}

          <AnimatePresence>
            {showMsg && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:0.25}} className="mt-6 liquid-glass p-4 text-left text-sm">
                <strong className="block text-white">Future Message</strong>
                <p className="mt-2 text-white/80">If you are tempted to withdraw early, remember why you started. Honor this Pact.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sealed && (
              <motion.div initial={{opacity:0, scale:0.96}} animate={{opacity:1, scale:1}} exit={{opacity:0}} transition={{duration:0.4}} className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/6 liquid-glass">
                <div className="flex items-center gap-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="text-sm">Pact Sealed</div>
                    <div className="text-xs text-white/80">Your commitment is now recorded onchain (demo).</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
