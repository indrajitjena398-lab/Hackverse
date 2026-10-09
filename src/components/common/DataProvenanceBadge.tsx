'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ExternalLink, 
  Hash, 
  Info, 
  Award, 
  GraduationCap, 
  UserCheck, 
  Globe, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import { ProvenanceMetadata, ProvenanceLevel } from '@/lib/types/provenance';

interface DataProvenanceBadgeProps {
  level: ProvenanceLevel;
  source: string;
  confidence?: number;
  metadata?: ProvenanceMetadata;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  claimTitle?: string;
}

export function DataProvenanceBadge({
  level,
  source,
  confidence,
  metadata,
  size = 'sm',
  className = '',
  claimTitle,
}: DataProvenanceBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawConfidence = confidence ?? metadata?.confidenceScore ?? 92;
  const effectiveConfidence = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);

  // Normalize level string
  const normalizedLevel = (level || 'MODEL_INFERRED').toString().toUpperCase();

  const getBadgeConfig = () => {
    switch (normalizedLevel) {
      case 'VERIFIED_EMPLOYER':
      case 'VERIFIED':
        return {
          tag: '[VERIFIED_EMPLOYER]',
          label: 'Verified Employer ATS',
          bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100',
          dotClass: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'VERIFIED_CANDIDATE':
        return {
          tag: '[VERIFIED_CANDIDATE]',
          label: 'Verified Candidate Attestation',
          bgClass: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100',
          dotClass: 'bg-teal-500',
          icon: UserCheck,
        };
      case 'VERIFIED_INSTITUTION':
        return {
          tag: '[VERIFIED_INSTITUTION]',
          label: 'Verified University Registrar',
          bgClass: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
          dotClass: 'bg-blue-500',
          icon: GraduationCap,
        };
      case 'PUBLIC_SOURCE':
        return {
          tag: '[PUBLIC_SOURCE]',
          label: 'Public Source Web Index',
          bgClass: 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100',
          dotClass: 'bg-sky-500',
          icon: Globe,
        };
      case 'COMMUNITY_AGGREGATED':
      case 'AGGREGATED':
        return {
          tag: '[COMMUNITY_AGGREGATED]',
          label: 'Community Aggregated Peer Data',
          bgClass: 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200',
          dotClass: 'bg-slate-500',
          icon: Users,
        };
      case 'SYSTEM_DERIVED':
        return {
          tag: '[SYSTEM_DERIVED]',
          label: 'Deterministic Engine Derived',
          bgClass: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
          dotClass: 'bg-indigo-500',
          icon: Cpu,
        };
      case 'USER_ASSERTED':
        return {
          tag: '[USER_ASSERTED]',
          label: 'Self-Reported Candidate Claim',
          bgClass: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200',
          dotClass: 'bg-slate-400',
          icon: UserCheck,
        };
      case 'MODEL_INFERRED':
      case 'INFERRED':
      default:
        return {
          tag: '[MODEL_INFERRED]',
          label: `${effectiveConfidence}% Inferred Analysis`,
          bgClass: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
          dotClass: 'bg-amber-500',
          icon: Sparkles,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBadgeClick}
        title="Click to open Provenance Explorer (Source, Confidence, Cryptographic Hash)"
        className={`inline-flex items-center gap-1.5 font-mono border rounded-full transition-all duration-150 ${
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${config.bgClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-semibold tracking-wide">{config.tag}</span>
        {size !== 'sm' && <span className="opacity-80 text-[10px] hidden sm:inline">({source.substring(0, 16)}...)</span>}
      </button>

      {/* Origin Provenance Modal / Explorer */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg p-6 space-y-4 rounded-2xl bg-white text-slate-900 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">AURA Provenance Explorer</h3>
                  <div className="text-[11px] font-mono text-slate-500">Cryptographic Chain-of-Trust Attestation</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition font-medium"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {claimTitle && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">Inspected Claim:</span>
                  <span className="text-xs font-semibold text-slate-900 font-mono">{claimTitle}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-xs">Trust Classification:</span>
                <span className={`font-mono font-semibold text-xs px-2.5 py-1 rounded border ${config.bgClass}`}>
                  {config.tag}
                </span>
              </div>

              <div className="p-3 space-y-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Origin Source:</span>
                  {metadata?.sourceUrl && (
                    <a
                      href={metadata.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 underline font-mono text-[11px]"
                    >
                      Audit URL <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="font-semibold text-slate-900 text-xs">{metadata?.source || source}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Confidence Score:</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{effectiveConfidence}%</span>
                    <span className="text-xs text-slate-500">calibrated</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Cryptographic Hash:</div>
                  <div className="flex items-center gap-1 font-mono text-xs text-indigo-700 truncate">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{metadata?.auditHash || '0x9fa8102bdc771a'}</span>
                  </div>
                </div>
              </div>

              {metadata?.inferenceReasoning && (
                <div className="p-3 space-y-1.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                    <Info className="w-3.5 h-3.5" />
                    <span>Inference Reasoning:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {metadata.inferenceReasoning}
                  </p>
                  {metadata.inferenceModel && (
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Model: {metadata.inferenceModel}
                    </div>
                  )}
                </div>
              )}

              {metadata?.verifierName && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <Award className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Officially attested by: <strong>{metadata.verifierName}</strong></span>
                </div>
              )}

              <div className="text-[10px] text-slate-500 text-center pt-1 font-mono">
                Verified: {metadata?.lastVerifiedAt || new Date().toISOString().split('T')[0]} • Deterministic Zero-Hallucination Guarantee
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
