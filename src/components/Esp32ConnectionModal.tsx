import React, { useState, useEffect } from 'react';
import {
  X,
  Bluetooth,
  Usb,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Laptop,
  Tablet,
  Smartphone,
  HelpCircle,
  Code2,
  Radio,
  Zap,
} from 'lucide-react';
import { BRAILLE_ALPHABET } from '../data/brailleAlphabet';
import { sound } from '../utils/soundEngine';

interface Esp32ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastTypedChar?: string | null;
}

export const Esp32ConnectionModal: React.FC<Esp32ConnectionModalProps> = ({
  isOpen,
  onClose,
  lastTypedChar = null,
}) => {
  const [activeTab, setActiveTab] = useState<'pair' | 'test' | 'code' | 'wiring'>('pair');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testKeystrokes, setTestKeystrokes] = useState<
    Array<{ key: string; time: string; dots: number[] }>
  >([]);

  // Listen for test keystrokes when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input/textarea if any
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const rawKey = e.key;
      const lowerKey = rawKey.toLowerCase();

      if (/^[a-z]$/.test(lowerKey) || lowerKey === ' ' || lowerKey === 'backspace') {
        const dots =
          lowerKey === ' '
            ? []
            : lowerKey === 'backspace'
            ? [7]
            : BRAILLE_ALPHABET[lowerKey]?.dots || [];

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
          .getMilliseconds()
          .toString()
          .padStart(3, '0')}`;

        setTestKeystrokes((prev) => [
          { key: lowerKey === ' ' ? 'Space' : lowerKey === 'backspace' ? 'Backspace' : lowerKey.toUpperCase(), time: timeStr, dots },
          ...prev.slice(0, 7),
        ]);

        sound.playDotClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleArduinoCode = `// ESP32-S3 Bluetooth Braille Keyboard for BraillePad
// Install "ESP32 BLE Keyboard" library by T-vK from Arduino Library Manager
// Board: ESP32S3 Dev Module

#include <BleKeyboard.h>

// Initialize BLE Keyboard with Device Name
BleKeyboard bleKeyboard("ESP32 Braille Keyboard", "BraillePad", 100);

// Pin Definitions for 6 Braille Dots + Space + Backspace
// Connect tactile push buttons between these GPIOs and GND (Active LOW)
const int PIN_DOT_1 = 4;   // Left Index   (Dot 1)
const int PIN_DOT_2 = 5;   // Left Middle  (Dot 2)
const int PIN_DOT_3 = 6;   // Left Ring    (Dot 3)
const int PIN_DOT_4 = 7;   // Right Index  (Dot 4)
const int PIN_DOT_5 = 15;  // Right Middle (Dot 5)
const int PIN_DOT_6 = 16;  // Right Ring   (Dot 6)
const int PIN_SPACE = 17;  // Thumb Space
const int PIN_BKSP  = 18;  // Backspace

// Braille Chord Lookup Table (bit0=Dot1, bit1=Dot2 ... bit5=Dot6)
char brailleLookup[64];

void initBrailleTable() {
  memset(brailleLookup, 0, sizeof(brailleLookup));
  brailleLookup[0b000001] = 'a'; // Dot 1
  brailleLookup[0b000011] = 'b'; // Dots 1,2
  brailleLookup[0b001001] = 'c'; // Dots 1,4
  brailleLookup[0b011001] = 'd'; // Dots 1,4,5
  brailleLookup[0b010001] = 'e'; // Dots 1,5
  brailleLookup[0b001011] = 'f'; // Dots 1,2,4
  brailleLookup[0b011011] = 'g'; // Dots 1,2,4,5
  brailleLookup[0b010011] = 'h'; // Dots 1,2,5
  brailleLookup[0b001010] = 'i'; // Dots 2,4
  brailleLookup[0b011010] = 'j'; // Dots 2,4,5
  brailleLookup[0b000101] = 'k'; // Dots 1,3
  brailleLookup[0b000111] = 'l'; // Dots 1,2,3
  brailleLookup[0b001101] = 'm'; // Dots 1,3,4
  brailleLookup[0b011101] = 'n'; // Dots 1,3,4,5
  brailleLookup[0b010101] = 'o'; // Dots 1,3,5
  brailleLookup[0b001111] = 'p'; // Dots 1,2,3,4
  brailleLookup[0b011111] = 'q'; // Dots 1,2,3,4,5
  brailleLookup[0b010111] = 'r'; // Dots 1,2,3,5
  brailleLookup[0b001110] = 's'; // Dots 2,3,4
  brailleLookup[0b011110] = 't'; // Dots 2,3,4,5
  brailleLookup[0b100101] = 'u'; // Dots 1,3,6
  brailleLookup[0b100111] = 'v'; // Dots 1,2,3,6
  brailleLookup[0b111010] = 'w'; // Dots 2,4,5,6
  brailleLookup[0b101101] = 'x'; // Dots 1,3,4,6
  brailleLookup[0b111101] = 'y'; // Dots 1,3,4,5,6
  brailleLookup[0b110101] = 'z'; // Dots 1,3,5,6
}

void setup() {
  Serial.begin(115200);
  initBrailleTable();

  // Internal pull-ups (buttons pull LOW when pressed)
  int pins[] = {PIN_DOT_1, PIN_DOT_2, PIN_DOT_3, PIN_DOT_4, PIN_DOT_5, PIN_DOT_6, PIN_SPACE, PIN_BKSP};
  for (int p : pins) {
    pinMode(p, INPUT_PULLUP);
  }

  bleKeyboard.begin();
  Serial.println("ESP32-S3 Braille BLE Keyboard Ready to Pair!");
}

void loop() {
  if (!bleKeyboard.isConnected()) {
    delay(50);
    return;
  }

  // Handle Space
  if (digitalRead(PIN_SPACE) == LOW) {
    bleKeyboard.write(' ');
    delay(200); // Debounce
    return;
  }

  // Handle Backspace
  if (digitalRead(PIN_BKSP) == LOW) {
    bleKeyboard.write(KEY_BACKSPACE);
    delay(200);
    return;
  }

  // Read 6 Braille Dots Chord
  uint8_t chord = 0;
  if (digitalRead(PIN_DOT_1) == LOW) chord |= (1 << 0);
  if (digitalRead(PIN_DOT_2) == LOW) chord |= (1 << 1);
  if (digitalRead(PIN_DOT_3) == LOW) chord |= (1 << 2);
  if (digitalRead(PIN_DOT_4) == LOW) chord |= (1 << 3);
  if (digitalRead(PIN_DOT_5) == LOW) chord |= (1 << 4);
  if (digitalRead(PIN_DOT_6) == LOW) chord |= (1 << 5);

  if (chord > 0) {
    // Wait briefly for all fingers of the chord to settle
    delay(40);
    if (digitalRead(PIN_DOT_1) == LOW) chord |= (1 << 0);
    if (digitalRead(PIN_DOT_2) == LOW) chord |= (1 << 1);
    if (digitalRead(PIN_DOT_3) == LOW) chord |= (1 << 2);
    if (digitalRead(PIN_DOT_4) == LOW) chord |= (1 << 3);
    if (digitalRead(PIN_DOT_5) == LOW) chord |= (1 << 4);
    if (digitalRead(PIN_DOT_6) == LOW) chord |= (1 << 5);

    char letter = brailleLookup[chord & 0x3F];
    if (letter != 0) {
      bleKeyboard.write(letter);
      Serial.printf("Sent: %c (Chord: 0x%02X)\\n", letter, chord);
    }

    // Wait until child releases buttons before next keystroke
    while (digitalRead(PIN_DOT_1) == LOW || digitalRead(PIN_DOT_2) == LOW ||
           digitalRead(PIN_DOT_3) == LOW || digitalRead(PIN_DOT_4) == LOW ||
           digitalRead(PIN_DOT_5) == LOW || digitalRead(PIN_DOT_6) == LOW) {
      delay(10);
    }
    delay(50); // Debounce
  }

  delay(10);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleArduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Connect ESP32-S3 Braille Keyboard
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Standard BLE HID
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Works seamlessly on iPads, Android tablets, Chromebooks, laptops, and PCs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 gap-2 border-b border-slate-800/80 bg-slate-900 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('pair')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pair'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            1. How to Connect
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'test'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            2. Live Keystroke Tester
            {testKeystrokes.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('wiring')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'wiring'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            3. Pinout & Perkins Layout
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            4. Arduino Firmware Code
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4">
          {/* TAB 1: HOW TO PAIR */}
          {activeTab === 'pair' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 flex items-start gap-3">
                <Bluetooth className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sky-200 text-sm">
                    Standard Bluetooth HID — No App or Drivers Required!
                  </h3>
                  <p className="text-xs text-sky-300/80 mt-1 leading-relaxed">
                    Your ESP32-S3 acts as a standard wireless Bluetooth Keyboard. Whenever the child presses a Braille chord, the microcontroller sends regular letters (<code className="px-1.5 py-0.5 rounded bg-sky-900/60 font-mono text-sky-200">a–z</code>, <code className="px-1.5 py-0.5 rounded bg-sky-900/60 font-mono text-sky-200">Space</code>, or <code className="px-1.5 py-0.5 rounded bg-sky-900/60 font-mono text-sky-200">Backspace</code>). BraillePad automatically captures these standard keystrokes in the browser!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs mb-2">
                      Step 1
                    </span>
                    <h4 className="font-bold text-white text-sm">Power the ESP32-S3</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Power your board with a USB-C battery pack or 3.7V LiPo battery. The BLE firmware will start advertising automatically.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>Broadcasting BLE</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold text-xs mb-2">
                      Step 2
                    </span>
                    <h4 className="font-bold text-white text-sm">Pair in Device Settings</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Open <strong>Bluetooth Settings</strong> on your iPad, tablet, laptop, or PC. Look for <strong>"ESP32 Braille Keyboard"</strong> and tap <strong>Pair / Connect</strong>.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-sky-400" />
                    <span>One-time pairing</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs mb-2">
                      Step 3
                    </span>
                    <h4 className="font-bold text-white text-sm">Open BraillePad & Type</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Return to this web page. Tap anywhere on screen to focus. When the child presses buttons on the ESP32, BraillePad speaks and displays the letters instantly!
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant audio feedback</span>
                  </div>
                </div>
              </div>

              {/* Platform Quick Links */}
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs">
                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Tablet className="w-4 h-4 text-amber-400" />
                  Quick Pairing Guide by Operating System:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-xs">
                  <div>
                    <strong className="text-slate-200">Apple iPad & Mac:</strong> Settings → Bluetooth → tap "ESP32 Braille Keyboard" → Connect.
                  </div>
                  <div>
                    <strong className="text-slate-200">Android & Chromebooks:</strong> Settings → Connected devices → Pair new device → Select keyboard.
                  </div>
                  <div>
                    <strong className="text-slate-200">Windows 10 / 11:</strong> Settings → Bluetooth & devices → Add device → Bluetooth → Pair.
                  </div>
                  <div>
                    <strong className="text-slate-200">USB-C Direct Mode:</strong> You can also plug the ESP32-S3 straight in via USB-C cable for zero-latency wired keyboard mode.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE KEYSTROKE TESTER */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                <p className="font-bold text-emerald-200 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Live Keystroke Diagnostic Tool
                </p>
                Press any Braille chord or key on your ESP32-S3 right now. Keystrokes will appear below in real-time with their Braille dot mapping!
              </div>

              {testKeystrokes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-full bg-slate-800 text-slate-400">
                    <Radio className="w-6 h-6 animate-pulse text-sky-400" />
                  </div>
                  <p className="font-bold text-white text-sm">Waiting for Keystroke Input...</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Press Dot 1 on your ESP32-S3 (or press 'A' on your laptop keyboard) to test the connection.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Recent Keystrokes from ESP32</span>
                    <button
                      onClick={() => setTestKeystrokes([])}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {testKeystrokes.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                          idx === 0
                            ? 'bg-slate-800 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm uppercase ${
                              idx === 0
                                ? 'bg-amber-500 text-slate-950 font-mono'
                                : 'bg-slate-800 text-slate-300 font-mono'
                            }`}
                          >
                            {item.key}
                          </span>
                          <div>
                            <div className="font-bold text-slate-200">
                              {item.key === 'Space'
                                ? 'Spacebar Keystroke'
                                : item.key === 'Backspace'
                                ? 'Backspace Keystroke'
                                : `Letter "${item.key}" — Dots: ${
                                    item.dots.length > 0 ? item.dots.join(', ') : 'None'
                                  }`}
                            </div>
                            <div className="text-[10px] text-slate-500">{item.time}</div>
                          </div>
                        </div>

                        {/* Braille visual dot pill */}
                        {item.dots.length > 0 && item.dots[0] <= 6 && (
                          <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                            {[1, 2, 3, 4, 5, 6].map((dot) => (
                              <span
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  item.dots.includes(dot)
                                    ? 'bg-amber-400 shadow-sm shadow-amber-400/80'
                                    : 'bg-slate-800'
                                }`}
                                title={`Dot ${dot}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WIRING & PERKINS LAYOUT */}
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300">
                <p className="font-bold text-amber-200 mb-1">
                  Perkins Ergonomic Layout for Little Hands:
                </p>
                The 6 Braille dots are arranged in a horizontal arc matching natural finger placement:
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Hand */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                      Left Hand
                    </span>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li className="flex justify-between">
                        <span>Dot 3 (Left Ring Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 6</code>
                      </li>
                      <li className="flex justify-between">
                        <span>Dot 2 (Left Middle Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 5</code>
                      </li>
                      <li className="flex justify-between font-semibold text-white">
                        <span>Dot 1 (Left Index Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 4</code>
                      </li>
                    </ul>
                  </div>

                  {/* Right Hand */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                      Right Hand
                    </span>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li className="flex justify-between font-semibold text-white">
                        <span>Dot 4 (Right Index Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 7</code>
                      </li>
                      <li className="flex justify-between">
                        <span>Dot 5 (Right Middle Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 15</code>
                      </li>
                      <li className="flex justify-between">
                        <span>Dot 6 (Right Ring Finger)</span>
                        <code className="text-sky-300 font-mono">GPIO 16</code>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Thumbs / Navigation */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200">Spacebar (Thumbs)</span>
                    <span className="text-slate-400 text-[11px] block">Central wide key</span>
                  </div>
                  <code className="text-sky-300 font-mono">GPIO 17</code>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200">Backspace (Undo Key)</span>
                    <span className="text-slate-400 text-[11px] block">Optional correction button</span>
                  </div>
                  <code className="text-sky-300 font-mono">GPIO 18</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARDUINO CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Arduino IDE / PlatformIO Sketch</h4>
                  <p className="text-[11px] text-slate-400">
                    Uses the popular <code className="text-sky-300">ESP32 BLE Keyboard</code> library
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied Code!' : 'Copy Code'}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto leading-relaxed select-text">
                <pre>{sampleArduinoCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>BraillePad listens to standard keyboard events (a-z, Space, Backspace)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
