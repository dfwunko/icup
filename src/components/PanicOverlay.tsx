import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EyeOff, CheckCircle2, FileText, Calculator, BookOpen, GraduationCap, X } from 'lucide-react';

export const PanicOverlay: React.FC = () => {
  const { isPanicActive, triggerPanic, panicDisguise, setPanicDisguise } = useGame();
  const [calcInput, setCalcInput] = useState('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);

  if (!isPanicActive) return null;

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        // Safe evaluation of standard arithmetic
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 overflow-y-auto select-text font-sans">
      {/* Hidden Emergency Escape Bar at very bottom */}
      <div className="fixed bottom-2 right-4 z-50 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <span>Stealth Active • Press <b>P</b> or <b>Esc</b> to return</span>
        <button
          onClick={() => triggerPanic(false)}
          className="hover:text-cyan-400 p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Disguise 1: Google Classroom */}
      {panicDisguise === 'classroom' && (
        <div className="min-h-screen bg-[#f8f9fa] text-[#3c4043]">
          {/* Header */}
          <header className="h-16 border-b border-[#dadce0] bg-white px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 flex flex-col justify-between py-1">
                <span className="h-0.5 bg-[#5f6368] w-full" />
                <span className="h-0.5 bg-[#5f6368] w-full" />
                <span className="h-0.5 bg-[#5f6368] w-full" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-medium text-[#137333] tracking-tight">Google</span>
                <span className="text-xl font-normal text-[#5f6368]">Classroom</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#5f6368]">AP Computer Science & Statistics - Period 3</span>
              <div className="w-8 h-8 rounded-full bg-[#137333] text-white flex items-center justify-center font-bold text-xs">
                S
              </div>
            </div>
          </header>

          {/* Classroom Banner */}
          <main className="max-w-5xl mx-auto py-6 px-4">
            <div className="bg-[#1e8e3e] text-white rounded-lg p-8 mb-6 shadow-sm">
              <h1 className="text-3xl font-medium mb-1">AP Computer Science & Statistics</h1>
              <p className="text-sm opacity-90">Room 204 • Mr. Harrison</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left sidebar: Upcoming */}
              <div className="bg-white border border-[#dadce0] rounded-lg p-4 h-fit">
                <h3 className="text-sm font-medium text-[#3c4043] mb-3">Upcoming</h3>
                <div className="text-xs text-[#5f6368] space-y-3">
                  <div>
                    <div className="font-medium text-slate-800">Due Friday, 11:59 PM</div>
                    <div>Unit 4: Recursion & Binary Tree Analysis</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Due Monday</div>
                    <div>AP Practice Exam Section II</div>
                  </div>
                </div>
              </div>

              {/* Main Stream Feed */}
              <div className="md:col-span-3 space-y-4">
                <div className="bg-white border border-[#dadce0] rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e8e3e] text-white flex items-center justify-center text-xs font-bold">
                      H
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Mr. Harrison</div>
                      <div className="text-[11px] text-[#5f6368]">Sep 27 • Computer Science Assignment</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    Please review the notes on algorithm complexity and Big-O notation. Submit your solutions to the problem set before class tomorrow.
                  </p>
                  <div className="border border-[#dadce0] rounded p-3 flex items-center space-x-3 hover:bg-slate-50">
                    <FileText className="w-6 h-6 text-[#1a73e8]" />
                    <div className="text-xs">
                      <div className="font-medium text-[#1a73e8]">Unit_4_Algorithm_Efficiency_Worksheet.pdf</div>
                      <div className="text-slate-500">PDF Document • 420 KB</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#dadce0] rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1e8e3e] text-white flex items-center justify-center text-xs font-bold">
                      H
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Mr. Harrison</div>
                      <div className="text-[11px] text-[#5f6368]">Sep 25 • Announcement</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Great work on the lab presentations yesterday! Scores have been posted to the grade portal.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Disguise 2: Google Docs */}
      {panicDisguise === 'docs' && (
        <div className="min-h-screen bg-[#f9fbfd] flex flex-col">
          {/* Docs Header */}
          <header className="bg-white border-b border-[#dadce0] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-10 bg-[#4285f4] rounded flex items-center justify-center text-white font-bold text-sm">
                📄
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium text-slate-800">AP Biology Term Paper - Cellular Respiration</span>
                  <span className="text-xs text-[#5f6368]">Saved to Drive</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-[#5f6368] mt-0.5">
                  <span className="hover:text-black cursor-pointer">File</span>
                  <span className="hover:text-black cursor-pointer">Edit</span>
                  <span className="hover:text-black cursor-pointer">View</span>
                  <span className="hover:text-black cursor-pointer">Insert</span>
                  <span className="hover:text-black cursor-pointer">Format</span>
                  <span className="hover:text-black cursor-pointer">Tools</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-4 py-1.5 bg-[#c2e7ff] text-[#001d35] rounded-full text-xs font-medium">
                Share
              </button>
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs">
                S
              </div>
            </div>
          </header>

          {/* Document Body */}
          <div className="flex-1 py-8 px-4 flex justify-center bg-[#f0f4f9] overflow-y-auto">
            <div
              contentEditable
              suppressContentEditableWarning
              className="w-full max-w-3xl bg-white shadow-md rounded-sm min-h-[900px] p-12 text-slate-800 font-serif leading-relaxed text-base focus:outline-none"
            >
              <h1 className="text-2xl font-bold font-sans text-center mb-6">
                Comparative Analysis of Aerobic vs. Anaerobic Glycolysis in Eukaryotic Mitochondria
              </h1>
              <p className="text-center font-sans text-sm text-slate-500 mb-8">
                Author: Student Researcher • Department of Biological Sciences
              </p>
              <h2 className="text-lg font-bold font-sans mb-3 text-slate-900">1. Abstract</h2>
              <p className="mb-4 text-justify">
                Cellular respiration constitutes the principal biochemical cascade through which heterotrophic organisms liberate stored chemical energy from nutrient substrates. During oxidative phosphorylation, high-energy electron carriers (NADH and FADH₂) transport electrons through the inner mitochondrial membrane complexes I-IV, establishing a steep electrochemical proton gradient across the intermembrane space.
              </p>
              <h2 className="text-lg font-bold font-sans mb-3 text-slate-900">2. The Krebs Tricarboxylic Acid Cycle</h2>
              <p className="mb-4 text-justify">
                Following the preparatory conversion of pyruvate into Acetyl-CoA via the pyruvate dehydrogenase multienzyme complex, citrate synthase catalyzes the condensation of oxaloacetate and acetyl groups. Through consecutive isomerization, dehydrogenation, and substrate-level phosphorylation events, three moles of NADH, one mole of FADH₂, and one mole of ATP/GTP are generated per acetyl equivalent.
              </p>
              <p className="text-justify text-slate-400 italic">
                [Click here to type additional research notes...]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disguise 3: Scientific Calculator */}
      {panicDisguise === 'calculator' && (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#2563eb] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span className="font-bold text-sm">Desmos Scientific Engine</span>
              </div>
              <span className="text-xs bg-blue-700/60 px-2 py-0.5 rounded">DEG</span>
            </div>

            {/* Display */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 text-right">
              <div className="text-xs text-slate-400 font-mono mb-1">Standard Calculation</div>
              <div className="text-3xl font-mono font-bold text-slate-800 break-all">{calcInput}</div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 p-4 bg-white">
              {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', 'sin', '='].map(
                key => (
                  <button
                    key={key}
                    onClick={() => handleCalcBtn(key)}
                    className={`h-12 rounded-xl font-bold font-mono text-sm transition-all cursor-pointer ${
                      key === '='
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : key === 'C'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : ['+', '-', '*', '/'].includes(key)
                        ? 'bg-slate-100 text-blue-600 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {key}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disguise 4: Wikipedia Article */}
      {panicDisguise === 'wikipedia' && (
        <div className="min-h-screen bg-white text-black font-serif">
          <header className="border-b border-slate-300 px-8 py-3 flex items-center justify-between font-sans">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-slate-700" />
              <span className="text-xl font-serif font-bold">WIKIPEDIA</span>
              <span className="text-xs text-slate-500">The Free Encyclopedia</span>
            </div>
            <input
              type="text"
              placeholder="Search Wikipedia"
              defaultValue="Quantum mechanics"
              className="border border-slate-300 rounded px-3 py-1 text-xs w-64"
            />
          </header>

          <main className="max-w-4xl mx-auto py-8 px-6">
            <h1 className="text-3xl font-serif border-b border-slate-300 pb-2 mb-4">Quantum mechanics</h1>
            <p className="text-sm font-sans text-slate-600 mb-6">From Wikipedia, the free encyclopedia</p>
            <p className="text-justify leading-relaxed mb-4">
              <b>Quantum mechanics</b> is a fundamental theory in physics that describes the behavior of nature at and below the scale of atoms. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.
            </p>
            <p className="text-justify leading-relaxed mb-4">
              Classical physics, the collection of theories that existed before the advent of quantum mechanics, describes many aspects of nature at an ordinary (macroscopic) scale, but is not sufficient for describing them at small (atomic and subatomic) scales.
            </p>
          </main>
        </div>
      )}
    </div>
  );
};
