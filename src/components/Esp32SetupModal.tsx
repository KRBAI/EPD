import React, { useState, useEffect } from 'react';
import { Bluetooth, Usb, Cpu, Check, Copy, X, Terminal, Radio, ShieldCheck } from 'lucide-react';
import { BRAILLE_ALPHABET } from '../data/brailleAlphabet';
import { sound } from '../utils/soundEngine';

interface Esp32SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Esp32SetupModal: React.FC<Esp32SetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'tester' | 'code'>('connect');
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastTestedKey, setLastTestedKey] = useState<string | null>(null);
  const [testLog, setTestLog] = useState<Array<{ char: string; dots: number[]; time: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;

    const handleTesterKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (/^[a-z ]$/.test(key) || e.code === 'Backspace' || e.code === 'Space') {
        sound.playDotClick();
        const displayChar = e.code === 'Space' ? 'Space' : e.code === 'Backspace' ? 'Backspace' : key.toUpperCase();
        const dots = BRAILLE_ALPHABET[key]?.dots || [];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setLastTestedKey(displayChar);
        setTestLog((prev) => [{ char: displayChar, dots, time: timeStr }, ...prev.slice(0, 7)]);
      }
    };

    window.addEventListener('keydown', handleTesterKey);
    return () => window.removeEventListener('keydown', handleTesterKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleArduinoCode = `// ESP32-S3 Bluetooth Braille Keyboard Firmware (BleKeyboard)
// Libraries needed in Arduino IDE: "ESP32 BLE Keyboard" by T-Party / wakwak-koba
#include <BleKeyboard.h>

BleKeyboard bleKeyboard("BraillePad-ESP32S3", "BraillePad", 100);

// Pins for Perkins 6-Dot Chord Buttons (adjust to your GPIOs)
const int PIN_DOT_1 = 4;  // Left Index
const int PIN_DOT_2 = 5;  // Left Middle
const int PIN_DOT_3 = 6;  // Left Ring
const int PIN_DOT_4 = 7;  // Right Index
const int PIN_DOT_5 = 15; // Right Middle
const int PIN_DOT_6 = 16; // Right Ring
const int PIN_SPACE = 17; // Thumb Spacebar

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DOT_1, INPUT_PULLUP);
  pinMode(PIN_DOT_2, INPUT_PULLUP);
  pinMode(PIN_DOT_3, INPUT_PULLUP);
  pinMode(PIN_DOT_4, INPUT_PULLUP);
  pinMode(PIN_DOT_5, INPUT_PULLUP);
  pinMode(PIN_DOT_6, INPUT_PULLUP);
  pinMode(PIN_SPACE, INPUT_PULLUP);

  bleKeyboard.begin();
  Serial.println("BraillePad ESP32-S3 BLE Keyboard Ready!");
}

// Map 6-bit chord mask to standard character
char decodeBrailleChord(uint8_t mask) {
  switch (mask) {
    case 0b000001: return 'a'; // Dot 1
    case 0b000011: return 'b'; // Dots 1, 2
    case 0b001001: return 'c'; // Dots 1, 4
    case 0b011001: return 'd'; // Dots 1, 4, 5
    case 0b010001: return 'e'; // Dots 1, 5
    case 0b001011: return 'f'; // Dots 1, 2, 4
    case 0b011011: return 'g'; // Dots 1, 2, 4, 5
    case 0b010011: return 'h'; // Dots 1, 2, 5
    case 0b001010: return 'i'; // Dots 2, 4
    case 0b011010: return 'j'; // Dots 2, 4, 5
    // Add other letters k-z similarly
    default: return 0;
  }
}

void loop() {
  if (bleKeyboard.isConnected()) {
    // Read pins (Active LOW with INPUT_PULLUP)
    bool d1 = !digitalRead(PIN_DOT_1);
    bool d2 = !digitalRead(PIN_DOT_2);
    bool d3 = !digitalRead(PIN_DOT_3);
    bool d4 = !digitalRead(PIN_DOT_4);
    bool d5 = !digitalRead(PIN_DOT_5);
    bool d6 = !digitalRead(PIN_DOT_6);
    bool spc = !digitalRead(PIN_SPACE);

    if (spc) {
      bleKeyboard.write(' ');
      delay(250); // Chord debounce
      return;
    }

    uint8_t chord = (d1) | (d2 << 1) | (d3 << 2) | (d4 << 3) | (d5 << 4) | (d6 << 5);
    if (chord > 0) {
      delay(40); // Allow all fingers to land
      char c = decodeBrailleChord(chord);
      if (c != 0) {
        bleKeyboard.write(c);
      }
      delay(200); // Debounce
    }
  }
  delay(10);
}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sampleArduinoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="esp32-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="esp32-title" className="text-sm sm:text-base font-black text-white">
                ESP32-S3 Braille Keyboard Guide
              </h2>
              <p className="text-[11px] text-slate-400">
                Plug-and-play Bluetooth BLE or USB-C HID keyboard connection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs px-4">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-2.5 px-3 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>How to Connect</span>
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-2.5 px-3 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tester'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Keystroke Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 px-3 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Firmware Sample</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-300 space-y-4">
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 text-sky-200 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Zero software or drivers required!</strong> BraillePad listens for standard keyboard
                  events (<kbd className="px-1 py-0.2 rounded bg-slate-800 text-white font-mono">a-z</kbd>,{' '}
                  <kbd className="px-1 py-0.2 rounded bg-slate-800 text-white font-mono">Space</kbd>,{' '}
                  <kbd className="px-1 py-0.2 rounded bg-slate-800 text-white font-mono">Backspace</kbd>).
                  Once paired, the child can begin typing immediately.
                </div>
              </div>

              {/* Method 1: Bluetooth BLE */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Bluetooth className="w-4 h-4 text-sky-400" />
                  <span>Option 1: Bluetooth BLE Wireless (Recommended)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                  <li>Power on your ESP32-S3 keyboard battery or USB supply.</li>
                  <li>
                    On your iPad, Android tablet, laptop, or computer, open <strong>Settings &gt; Bluetooth</strong>.
                  </li>
                  <li>
                    Look for your device (e.g.{' '}
                    <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">BraillePad-ESP32S3</code> or{' '}
                    <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">ESP32 BLE Keyboard</code>).
                  </li>
                  <li>Tap <strong>Pair / Connect</strong>. Once connected, your OS treats it as a standard physical keyboard.</li>
                  <li>Return to BraillePad in the browser — every Braille chord will trigger lessons automatically!</li>
                </ol>
              </div>

              {/* Method 2: USB Cable */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Usb className="w-4 h-4 text-emerald-400" />
                  <span>Option 2: USB-C Cable (Direct Plug & Play)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The ESP32-S3 features native USB OTG hardware. Plug a USB-C cable from the ESP32-S3 directly into your
                  laptop or tablet. If configured as a USB HID Keyboard, it works instantly with zero pairing.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Live Keystroke Detector
                </div>
                <div className="text-4xl sm:text-5xl font-black text-amber-400 py-2">
                  {lastTestedKey ? lastTestedKey : <span className="text-slate-600 text-2xl font-normal">Press any chord on ESP32</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {lastTestedKey && BRAILLE_ALPHABET[lastTestedKey.toLowerCase()]
                    ? `Mapped to Dots: ${BRAILLE_ALPHABET[lastTestedKey.toLowerCase()].dots.join(', ')} (${BRAILLE_ALPHABET[lastTestedKey.toLowerCase()].word})`
                    : 'Awaiting keyboard input...'}
                </div>
              </div>

              {/* Recent Inputs Log */}
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Recent Keystrokes Log</div>
                {testLog.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                    No keys received yet. Press keys on your ESP32-S3 or computer keyboard.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {testLog.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm">
                            {log.char}
                          </span>
                          <span className="text-slate-300">
                            {log.dots.length > 0 ? `Dots: ${log.dots.join(', ')}` : log.char}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[10px]">{log.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sample Arduino C++ Sketch for ESP32-S3 BLE Keyboard:</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Sketch'}
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64">
                <pre>{sampleArduinoCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">BraillePad is 100% compatible with any ESP32 / ESP32-S3 BLE keyboard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
