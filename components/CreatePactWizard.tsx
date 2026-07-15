"use client";
import React, { useState } from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import SealCeremony from './SealCeremony';

const PactSchema = z.object({
  token: z.string().min(1),
  amount: z.number().positive(),
  rule: z.string().min(1),
  message: z.string().min(10)
});

type PactForm = z.infer<typeof PactSchema>;

export default function CreatePactWizard(){
  const {register, handleSubmit, formState:{errors}, setValue, watch} = useForm<PactForm>({resolver: zodResolver(PactSchema), defaultValues:{token:'MON', amount:0, rule:'Time Lock', message:'Honor this Pact.'}} as any);
  const [step, setStep] = useState(1);
  const [pactData, setPactData] = useState<PactForm | null>(null);

  function onNext(data?:any){
    if(step<4){ setStep(s=>s+1); }
  }

  function onPrev(){ setStep(s=>Math.max(1,s-1)); }

  function onSubmit(data:PactForm){ setPactData(data); setStep(5); }

  const token = watch('token');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center">1</div>
          <div className="text-sm text-white/80">Create Pact</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step===1 && (
          <div className="liquid-glass p-6 rounded-lg">
            <label className="block text-sm mb-2">Choose Asset</label>
            <select {...register('token')} className="w-full p-2 bg-transparent border border-white/10 rounded">
              <option>MON</option>
              <option>USDC</option>
              <option>DAI</option>
            </select>
          </div>
        )}

        {step===2 && (
          <div className="liquid-glass p-6 rounded-lg">
            <label className="block text-sm mb-2">Amount</label>
            <input type="number" step="any" {...register('amount', {valueAsNumber:true})} className="w-full p-2 bg-transparent border border-white/10 rounded" />
          </div>
        )}

        {step===3 && (
          <div className="liquid-glass p-6 rounded-lg">
            <label className="block text-sm mb-2">Commitment Rule</label>
            <select {...register('rule')} className="w-full p-2 bg-transparent border border-white/10 rounded">
              <option>Time Lock</option>
              <option>Cooldown</option>
              <option>Friend Approval</option>
              <option>Daily Spending Limit</option>
            </select>
          </div>
        )}

        {step===4 && (
          <div className="liquid-glass p-6 rounded-lg">
            <label className="block text-sm mb-2">Future Message</label>
            <textarea {...register('message')} className="w-full p-2 bg-transparent border border-white/10 rounded h-28" />
          </div>
        )}

        {step===5 && pactData && (
          <div className="liquid-glass p-6 rounded-lg">
            <h4 className="font-heading italic text-xl">Review Pact</h4>
            <div className="mt-3 text-sm text-white/80">Token: {pactData.token}</div>
            <div className="text-sm text-white/80">Amount: {pactData.amount}</div>
            <div className="text-sm text-white/80">Rule: {pactData.rule}</div>
            <div className="mt-3 text-sm text-white/80">Message: {pactData.message}</div>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <div>
            {step>1 && step<5 && <button type="button" onClick={onPrev} className="px-4 py-2 border border-white/10">Back</button>}
          </div>
          <div className="flex gap-3">
            {step<4 && <button type="button" onClick={onNext} className="px-4 py-2 liquid-glass">Next</button>}
            {step===4 && <button type="submit" className="px-4 py-2 liquid-glass-strong">Review & Seal</button>}
          </div>
        </div>
      </form>

      {step===5 && pactData && (
        <div className="mt-6">
          <SealCeremony pact={pactData} />
        </div>
      )}
    </div>
  )
}
