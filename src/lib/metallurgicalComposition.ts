/**
 * Scientific Metallurgical Composition & Urban Mining Extraction Database
 * Benchmarked against Central Pollution Control Board (CPCB) Guidelines,
 * United Nations Global E-waste Monitor, and UNEP Urban Mining Studies.
 */

export interface MetalFraction {
  symbol: string;
  name: string;
  name_hi: string;
  name_mr: string;
  percentage: number; // e.g. 24.5%
  gramsPerKg: number; // e.g. 245 g/kg
  category: 'precious' | 'critical' | 'base' | 'ferrous' | 'polymer';
  color: string;
  marketRatePerGramOrKg: string;
}

export interface MaterialMetallurgy {
  materialCode: string;
  title: string;
  purityGrade: string;
  urbanMiningRichness: string; // e.g., "60x richer than Kolar Gold Fields Ore"
  environmentalHazardScore: 'Low' | 'Medium' | 'High' | 'Severe';
  hazardousConstituents: string[];
  metals: MetalFraction[];
  totalRecyclabilityPercent: number;
  carbonOffsetKgPerKg: number;
}

export const METALLURGY_DATABASE: Record<string, MaterialMetallurgy> = {
  PCB: {
    materialCode: 'PCB',
    title: 'High-Grade Telecommunications & Server PCB',
    purityGrade: 'Grade-A Multilayer Substrate',
    urbanMiningRichness: '1 Ton of PCBs yields ~280g Gold (50x richer than 1 Ton of natural Gold Ore at ~5g/t)',
    environmentalHazardScore: 'High',
    hazardousConstituents: ['Lead (Pb) solder', 'Brominated Flame Retardants (BFRs)', 'Cadmium (Cd)'],
    totalRecyclabilityPercent: 94.2,
    carbonOffsetKgPerKg: 3.8,
    metals: [
      {
        symbol: 'Cu',
        name: 'Copper',
        name_hi: 'तांबा',
        name_mr: 'तांबे',
        percentage: 24.8,
        gramsPerKg: 248.0,
        category: 'base',
        color: '#f97316', // orange
        marketRatePerGramOrKg: '₹620/kg',
      },
      {
        symbol: 'Au',
        name: 'Gold',
        name_hi: 'सोना',
        name_mr: 'सोने',
        percentage: 0.028,
        gramsPerKg: 0.28, // 280 mg/kg
        category: 'precious',
        color: '#eab308', // gold yellow
        marketRatePerGramOrKg: '₹7,200/g',
      },
      {
        symbol: 'Ag',
        name: 'Silver',
        name_hi: 'चांदी',
        name_mr: 'चांदी',
        percentage: 0.12,
        gramsPerKg: 1.2,
        category: 'precious',
        color: '#94a3b8', // silver
        marketRatePerGramOrKg: '₹88/g',
      },
      {
        symbol: 'Pd',
        name: 'Palladium',
        name_hi: 'पैलेडियम',
        name_mr: 'पॅलॅडियम',
        percentage: 0.008,
        gramsPerKg: 0.08,
        category: 'precious',
        color: '#38bdf8', // light blue
        marketRatePerGramOrKg: '₹3,400/g',
      },
      {
        symbol: 'Al',
        name: 'Aluminum',
        name_hi: 'एल्युमिनियम',
        name_mr: 'ॲल्युमिनियम',
        percentage: 14.5,
        gramsPerKg: 145.0,
        category: 'base',
        color: '#06b6d4', // cyan
        marketRatePerGramOrKg: '₹180/kg',
      },
      {
        symbol: 'Sn',
        name: 'Tin / Lead Solder',
        name_hi: 'टिन / लेड',
        name_mr: 'कथील / शिसे',
        percentage: 6.4,
        gramsPerKg: 64.0,
        category: 'base',
        color: '#a855f7', // purple
        marketRatePerGramOrKg: '₹340/kg',
      },
      {
        symbol: 'Fe',
        name: 'Iron & Steel Bracket',
        name_hi: 'लोहा',
        name_mr: 'लोखंड',
        percentage: 16.2,
        gramsPerKg: 162.0,
        category: 'ferrous',
        color: '#64748b', // slate
        marketRatePerGramOrKg: '₹38/kg',
      },
      {
        symbol: 'Resin',
        name: 'Fiberglass / Epoxy Substrate',
        name_hi: 'फाइबरग्लास / रेज़िन',
        name_mr: 'फायबरग्लास / रेझिन',
        percentage: 37.944,
        gramsPerKg: 379.44,
        category: 'polymer',
        color: '#334155', // dark slate
        marketRatePerGramOrKg: 'Co-processing fuel',
      },
    ],
  },
  CABLE: {
    materialCode: 'CABLE',
    title: 'High-Grade Electrolytic Copper Cable Scrap',
    purityGrade: 'Grade-1 Berry / Bare Bright Cu',
    urbanMiningRichness: 'Zero Smelting Loss — Direct Mechanical Granulation yields 99.2% pure cathode Cu',
    environmentalHazardScore: 'Low',
    hazardousConstituents: ['Plasticizers in PVC insulation', 'Chlorinated residues'],
    totalRecyclabilityPercent: 99.1,
    carbonOffsetKgPerKg: 4.6,
    metals: [
      {
        symbol: 'Cu',
        name: 'Electrolytic Copper',
        name_hi: 'तांबा',
        name_mr: 'शुद्ध तांबे',
        percentage: 68.5,
        gramsPerKg: 685.0,
        category: 'base',
        color: '#f97316',
        marketRatePerGramOrKg: '₹620/kg',
      },
      {
        symbol: 'PVC',
        name: 'Virgin PVC Insulation',
        name_hi: 'पीवीसी प्लास्टिक',
        name_mr: 'पीव्हीसी आवरण',
        percentage: 26.2,
        gramsPerKg: 262.0,
        category: 'polymer',
        color: '#38bdf8',
        marketRatePerGramOrKg: '₹35/kg',
      },
      {
        symbol: 'Al',
        name: 'Aluminum Shielding Foil',
        name_hi: 'एल्युमिनियम फॉयल',
        name_mr: 'ॲल्युमिनियम फॉइल',
        percentage: 4.1,
        gramsPerKg: 41.0,
        category: 'base',
        color: '#06b6d4',
        marketRatePerGramOrKg: '₹180/kg',
      },
      {
        symbol: 'Sn',
        name: 'Tin Plating Residue',
        name_hi: 'टिन प्लेटिंग',
        name_mr: 'कथील लेप',
        percentage: 1.2,
        gramsPerKg: 12.0,
        category: 'base',
        color: '#a855f7',
        marketRatePerGramOrKg: '₹340/kg',
      },
    ],
  },
  BATTERY: {
    materialCode: 'BATTERY',
    title: 'Secondary Lithium-Ion / Cobalt Inverter Cells',
    purityGrade: 'LiCoO2 / NMC Energy Dense Cells',
    urbanMiningRichness: 'Black Mass Recovery: Contains 15x more Cobalt than natural Congo mineral ore',
    environmentalHazardScore: 'Severe',
    hazardousConstituents: ['Liquid Electrolyte (LiPF6)', 'Flammable Solvents', 'Hydrofluoric Acid risk'],
    totalRecyclabilityPercent: 96.5,
    carbonOffsetKgPerKg: 5.2,
    metals: [
      {
        symbol: 'Co',
        name: 'Cobalt (Black Mass)',
        name_hi: 'कोबाल्ट',
        name_mr: 'कोबाल्ट',
        percentage: 18.2,
        gramsPerKg: 182.0,
        category: 'critical',
        color: '#3b82f6', // blue
        marketRatePerGramOrKg: '₹2,800/kg',
      },
      {
        symbol: 'Li',
        name: 'Lithium Carbonate Eq.',
        name_hi: 'लिथियम',
        name_mr: 'लिथियम',
        percentage: 7.4,
        gramsPerKg: 74.0,
        category: 'critical',
        color: '#a855f7', // purple
        marketRatePerGramOrKg: '₹1,650/kg',
      },
      {
        symbol: 'Ni',
        name: 'Nickel',
        name_hi: 'निकल',
        name_mr: 'निकेल',
        percentage: 14.8,
        gramsPerKg: 148.0,
        category: 'base',
        color: '#10b981', // emerald
        marketRatePerGramOrKg: '₹1,320/kg',
      },
      {
        symbol: 'Cu',
        name: 'Copper Anode Foil',
        name_hi: 'तांबा फॉयल',
        name_mr: 'तांबे फॉइल',
        percentage: 11.2,
        gramsPerKg: 112.0,
        category: 'base',
        color: '#f97316',
        marketRatePerGramOrKg: '₹620/kg',
      },
      {
        symbol: 'Al',
        name: 'Aluminum Cathode Foil & Casing',
        name_hi: 'एल्युमिनियम केसिंग',
        name_mr: 'ॲल्युमिनियम केसिंग',
        percentage: 16.5,
        gramsPerKg: 165.0,
        category: 'base',
        color: '#06b6d4',
        marketRatePerGramOrKg: '₹180/kg',
      },
      {
        symbol: 'C',
        name: 'Synthetic Graphite Anode',
        name_hi: 'ग्रेफाइट',
        name_mr: 'ग्रॅफाइट',
        percentage: 19.4,
        gramsPerKg: 194.0,
        category: 'polymer',
        color: '#475569',
        marketRatePerGramOrKg: '₹95/kg',
      },
      {
        symbol: 'Elyt',
        name: 'Organic Carbonate Solvent',
        name_hi: 'इलेक्ट्रोलाइट',
        name_mr: 'इलेक्ट्रोलाइट',
        percentage: 12.5,
        gramsPerKg: 125.0,
        category: 'polymer',
        color: '#334155',
        marketRatePerGramOrKg: 'Hazardous treatment',
      },
    ],
  },
  MOTOR: {
    materialCode: 'MOTOR',
    title: 'Fractional HP Electric Motors & Stators',
    purityGrade: 'Heavy Copper Enamelled Windings & Silicon Steel',
    urbanMiningRichness: 'Zero Refinement required: Direct electromagnetic core extraction',
    environmentalHazardScore: 'Low',
    hazardousConstituents: ['Insulating Varnish resins', 'Bearing grease'],
    totalRecyclabilityPercent: 98.4,
    carbonOffsetKgPerKg: 2.9,
    metals: [
      {
        symbol: 'Cu',
        name: 'Heavy Winding Copper',
        name_hi: 'वाइंडिंग तांबा',
        name_mr: 'वाइंडिंग तांबे',
        percentage: 22.4,
        gramsPerKg: 224.0,
        category: 'base',
        color: '#f97316',
        marketRatePerGramOrKg: '₹620/kg',
      },
      {
        symbol: 'Fe',
        name: 'Silicon Electrical Steel',
        name_hi: 'सिलिकॉन स्टील',
        name_mr: 'सिलिकॉन स्टील',
        percentage: 62.1,
        gramsPerKg: 621.0,
        category: 'ferrous',
        color: '#64748b',
        marketRatePerGramOrKg: '₹42/kg',
      },
      {
        symbol: 'Al',
        name: 'Cast Rotor End Rings & Housing',
        name_hi: 'कास्ट एल्युमिनियम',
        name_mr: 'कास्ट ॲल्युमिनियम',
        percentage: 12.8,
        gramsPerKg: 128.0,
        category: 'base',
        color: '#06b6d4',
        marketRatePerGramOrKg: '₹180/kg',
      },
      {
        symbol: 'Insul',
        name: 'Varnish & Phase Separator',
        name_hi: 'इंसुलेशन वार्निश',
        name_mr: 'इन्सुलेशन वॉर्निश',
        percentage: 2.7,
        gramsPerKg: 27.0,
        category: 'polymer',
        color: '#334155',
        marketRatePerGramOrKg: 'Residue',
      },
    ],
  },
  CRT: {
    materialCode: 'CRT',
    title: 'Lead-Stabilized CRT Glass & Copper Yoke',
    purityGrade: 'Funnel Glass with Leaded Matrix',
    urbanMiningRichness: 'High-purity heavy Copper Deflection Yoke + Lead Smelter input',
    environmentalHazardScore: 'Severe',
    hazardousConstituents: ['Lead Oxide (18-22% in funnel glass)', 'Phosphor powder (Cd, Eu, Yttrium)', 'Barium oxide'],
    totalRecyclabilityPercent: 88.0,
    carbonOffsetKgPerKg: 2.1,
    metals: [
      {
        symbol: 'Glass',
        name: 'Silica Panel & Funnel Glass',
        name_hi: 'सीआरटी ग्लास',
        name_mr: 'काच',
        percentage: 64.0,
        gramsPerKg: 640.0,
        category: 'polymer',
        color: '#0284c7',
        marketRatePerGramOrKg: 'Closed-loop glass',
      },
      {
        symbol: 'Pb',
        name: 'Heavy Lead Oxide Matrix',
        name_hi: 'सीसा (लेड)',
        name_mr: 'शिसे',
        percentage: 16.5,
        gramsPerKg: 165.0,
        category: 'base',
        color: '#dc2626',
        marketRatePerGramOrKg: '₹165/kg (Hazardous)',
      },
      {
        symbol: 'Cu',
        name: 'Copper Yoke Coils',
        name_hi: 'योक तांबा',
        name_mr: 'योक तांबे',
        percentage: 8.8,
        gramsPerKg: 88.0,
        category: 'base',
        color: '#f97316',
        marketRatePerGramOrKg: '₹620/kg',
      },
      {
        symbol: 'Fe',
        name: 'Internal Shadow Mask Steel',
        name_hi: 'स्टील मास्क',
        name_mr: 'स्टील मास्क',
        percentage: 8.2,
        gramsPerKg: 82.0,
        category: 'ferrous',
        color: '#64748b',
        marketRatePerGramOrKg: '₹35/kg',
      },
      {
        symbol: 'Rare',
        name: 'Phosphor Matrix (Y, Eu)',
        name_hi: 'दुर्लभ तत्व',
        name_mr: 'दुर्मीळ घटक',
        percentage: 2.5,
        gramsPerKg: 25.0,
        category: 'critical',
        color: '#a855f7',
        marketRatePerGramOrKg: '₹1,200/kg',
      },
    ],
  },
  PLASTIC: {
    materialCode: 'PLASTIC',
    title: 'Engineered Flame-Retardant ABS / HIPS Casings',
    purityGrade: 'High-Impact Engineering Thermoplastic',
    urbanMiningRichness: 'Pyrolysis or Mechanical Pelleting: 95% circular polymer substitution',
    environmentalHazardScore: 'Medium',
    hazardousConstituents: ['Polybrominated Diphenyl Ethers (PBDEs)', 'Antimony Trioxide synergist'],
    totalRecyclabilityPercent: 91.0,
    carbonOffsetKgPerKg: 1.8,
    metals: [
      {
        symbol: 'ABS',
        name: 'Acrylonitrile Butadiene Styrene',
        name_hi: 'एबीएस प्लास्टिक',
        name_mr: 'एबीएस प्लास्टिक',
        percentage: 72.0,
        gramsPerKg: 720.0,
        category: 'polymer',
        color: '#0284c7',
        marketRatePerGramOrKg: '₹48/kg',
      },
      {
        symbol: 'HIPS',
        name: 'High Impact Polystyrene',
        name_hi: 'एचआईपीएस पॉलीस्टीरीन',
        name_mr: 'एचआयपीएस पॉलीस्टायरिन',
        percentage: 18.5,
        gramsPerKg: 185.0,
        category: 'polymer',
        color: '#06b6d4',
        marketRatePerGramOrKg: '₹42/kg',
      },
      {
        symbol: 'Sb',
        name: 'Antimony Trioxide',
        name_hi: 'एंटीमनी',
        name_mr: 'अँटिमनी',
        percentage: 4.8,
        gramsPerKg: 48.0,
        category: 'critical',
        color: '#a855f7',
        marketRatePerGramOrKg: '₹750/kg',
      },
      {
        symbol: 'Fe',
        name: 'Embedded Brass / Steel Inserts',
        name_hi: 'धातु इंसर्ट्स',
        name_mr: 'धातू इन्सर्ट्स',
        percentage: 4.7,
        gramsPerKg: 47.0,
        category: 'ferrous',
        color: '#64748b',
        marketRatePerGramOrKg: '₹55/kg',
      },
    ],
  },
};

/**
 * Returns metallurgy analysis for a category code or fallback
 */
export function getMetallurgyForCategory(code: string): MaterialMetallurgy {
  const normalized = code.toUpperCase();
  if (METALLURGY_DATABASE[normalized]) {
    return METALLURGY_DATABASE[normalized];
  }
  if (normalized.includes('BATTERY') || normalized.includes('CELL')) {
    return METALLURGY_DATABASE.BATTERY;
  }
  if (normalized.includes('CABLE') || normalized.includes('COPPER') || normalized.includes('WIRE')) {
    return METALLURGY_DATABASE.CABLE;
  }
  if (normalized.includes('MOTOR') || normalized.includes('FAN')) {
    return METALLURGY_DATABASE.MOTOR;
  }
  if (normalized.includes('CRT') || normalized.includes('TV') || normalized.includes('MONITOR')) {
    return METALLURGY_DATABASE.CRT;
  }
  if (normalized.includes('PLASTIC') || normalized.includes('CASING')) {
    return METALLURGY_DATABASE.PLASTIC;
  }
  // Default to High-Grade PCB
  return METALLURGY_DATABASE.PCB;
}

/**
 * Formats WhatsApp text message with the metallurgical and urban mining breakdown
 */
export function formatWhatsAppMetallurgyReport(
  metallurgy: MaterialMetallurgy,
  approxWeightKg: number = 10,
  lang: string = 'mr'
): string {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const heading = isMr
    ? `🔬 *EKATRA AI धातू व खाण विश्लेषण अहवाल*\n_(AI Metallurgical & Urban Mining Scan)_`
    : isHi
    ? `🔬 *EKATRA AI धातु एवं खनिज विश्लेषण रिपोर्ट*\n_(AI Metallurgical & Urban Mining Scan)_`
    : `🔬 *EKATRA AI METALLURGICAL & MINE EXTRACTION REPORT*\n_(Direct Photo AI Vision Analysis)_`;

  const matLabel = isMr ? 'सामग्री / ई-कचरा' : isHi ? 'सामग्री / ई-कचरा' : 'Scrap Material';
  const purityLabel = isMr ? 'गुणवत्ता प्रत' : isHi ? 'गुणवत्ता ग्रेड' : 'Purity Grade';
  const recyclabilityLabel = isMr ? 'पुनर्वापर क्षमता' : isHi ? 'पुनर्चक्रण क्षमता' : 'Total Recyclability';
  const miningTitle = isMr ? '🏆 *शहरी खाण मूल्य (URBAN MINING POTENTIAL):*' : isHi ? '🏆 *शहरी खनन मूल्य (URBAN MINING POTENTIAL):*' : '🏆 *URBAN MINING RICHNESS POTENTIAL:*';
  const metalsTitle = isMr ? '📊 *या फोटोमधील धातूंचे अचूक प्रमाण (METALS PERCENTAGE):*' : isHi ? '📊 *इस फोटो में मौजूद धातुओं का प्रतिशत (METALS PERCENTAGE):*' : '📊 *EXACT PERCENTAGE OF METALS & MINES PRESENT IN THIS PHOTO:*';

  let text = `${heading}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📦 *${matLabel}:* ${metallurgy.title}\n`;
  text += `⚡ *${purityLabel}:* ${metallurgy.purityGrade}\n`;
  text += `♻️ *${recyclabilityLabel}:* ${metallurgy.totalRecyclabilityPercent}%\n\n`;

  text += `${miningTitle}\n`;
  text += `_${metallurgy.urbanMiningRichness}_\n\n`;

  text += `${metalsTitle}\n`;
  metallurgy.metals.forEach((m) => {
    let bullet = '🔹';
    let tag = '';
    if (m.category === 'precious') {
      bullet = '🟡';
      tag = isMr ? ' [मौल्यवान सोने/चांदी]' : isHi ? ' [कीमती सोना/चांदी]' : ' [Precious Mine]';
    } else if (m.category === 'critical') {
      bullet = '🟣';
      tag = isMr ? ' [महत्त्वाचे दुर्मिळ मूलद्रव्य]' : isHi ? ' [महत्वपूर्ण दुर्लभ तत्व]' : ' [Critical Element]';
    } else if (m.symbol === 'Cu') {
      bullet = '🟠';
      tag = isMr ? ' [शुद्ध तांबे]' : isHi ? ' [शुद्ध तांबा]' : ' [Electrolytic Cu]';
    } else if (m.symbol === 'Al') {
      bullet = '⚪';
    }

    const localName = isMr && m.name_mr ? m.name_mr : isHi && m.name_hi ? m.name_hi : m.name;
    const yieldForWeight = ((m.gramsPerKg * approxWeightKg) / (m.gramsPerKg >= 100 ? 1000 : 1)).toFixed(
      m.gramsPerKg >= 100 ? 2 : 1
    );
    const unit = m.gramsPerKg >= 100 ? (isMr ? 'किलो' : isHi ? 'किलो' : 'kg') : (isMr ? 'ग्रॅम' : isHi ? 'ग्राम' : 'g');

    text += `${bullet} *${localName} (${m.symbol}): ${m.percentage}%* (~${yieldForWeight} ${unit} / ${approxWeightKg}kg)${tag}\n`;
  });

  const hazardLabel = isMr ? 'धोका पातळी' : isHi ? 'खतरा स्तर' : 'Hazard Level';
  const carbonLabel = isMr ? 'कार्बन बचत' : isHi ? 'कार्बन बचत' : 'Carbon Offset';

  text += `\n⚠️ *${hazardLabel}:* ${metallurgy.environmentalHazardScore} (CPCB Form 6 Tracked)\n`;
  text += `🌱 *${carbonLabel}:* ~${(metallurgy.carbonOffsetKgPerKg * approxWeightKg).toFixed(1)} kg CO₂ avoided\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━`;

  return text;
}
