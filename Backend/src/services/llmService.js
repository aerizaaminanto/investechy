// src/services/llmService.js
import z from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Definisikan Guardrail Schema menggunakan Zod untuk format super-lengkap AI
const expectedLLMOutputSchema = z.object({
  business_profile: z.any().optional(),
  business_analysis: z.any().optional(),
  it_architecture: z.any().optional(),
  investment_plan: z.array(z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    quantity: z.number().optional(),
    unit_price: z.number().optional(),
    total_price: z.number().optional()
  })).optional(),
  cost_structure: z.any().optional(),
  business_impact: z.any().optional(),
  tangible_benefits: z.array(z.object({
    name: z.string().optional(),
    formula: z.string().optional(),
    assumption: z.string().optional(),
    yearly_saving: z.number().optional(),
    unit: z.string().optional()
  })).optional(),
  financial_analysis: z.any().optional(),
  projection: z.any().optional(),
  quasi_tangible: z.any().optional(),
  silk_conversion: z.any().optional(),
  risk_analysis: z.any().optional(),
  decision: z.object({
    roi_score: z.number().optional(),
    feasibility_score: z.number().optional(),
    risk_score: z.number().optional(),
    final_verdict: z.string().optional(),
    reasoning: z.string().optional()
  }).optional(),
  benchmark: z.any().optional()
});

// 2. Fungsi Utama Integrasi LLM
const generateProjectDraft = async (projectInfo) => {
  const { projectName, industry, scale, plan, location, description } = projectInfo;

  // System Prompt yang ketat agar AI tidak berhalusinasi format
  const systemPrompt = `
    Anda adalah Advanced AI IT Investment Analysis Engine yang berperan sebagai:

- Senior IT Investment Consultant (Transformasi Digital UMKM Indonesia)
- AI Engineer (Arsitektur Sistem & Automasi)
- Financial Analyst (CAPEX, OPEX, ROI, Payback Period, Projection)
- Business Consultant (Efisiensi operasional & peningkatan revenue)

========================================
TUJUAN
========================================
Menghasilkan ANALISIS INVESTASI IT yang:
- Tajam, ringkas, dan berbasis keputusan (decision-oriented)
- Kuantitatif (semua manfaat harus punya nominal & formula)
- Realistis sesuai harga pasar Indonesia
- Praktis & bisa langsung diimplementasikan
- Mudah dipahami oleh klien non-teknis
- Valid untuk kebutuhan bisnis maupun skripsi

========================================
INPUT
========================================
- jenis_usaha: ${industry}
- skala_usaha: ${scale}
- rencana_investasi: ${plan}
- lokasi_usaha: ${location}

========================================
LOGIKA WAJIB (CORE ENGINE)
========================================

1. VALIDASI SKALA USAHA
- mikro: ≤10 karyawan
- kecil: 11–30
- menengah: >30
- Jika tidak sesuai → koreksi + alasan singkat

2. BUSINESS UNDERSTANDING
- Identifikasi:
  - 2–3 karakteristik operasional spesifik
  - 2–3 pain points utama
- Tentukan max 5 PRIORITAS digitalisasi (impact terbesar)

3. REQUIREMENT MAPPING
Kelompokkan:
- Core → POS, payment, ERP-lite
- Operational → inventory, workflow
- Infrastructure → hardware, jaringan
- Advanced → analytics, automation, cloud

4. SCALING LOGIC
- POS: 1 device / 5–8 karyawan
- Device per role (kasir/admin/owner)
- mikro → basic
- kecil → balanced
- menengah → integrated

5. PRICING ENGINE
- Gunakan harga realistis Indonesia (marketplace/SaaS lokal)
- kota besar → +10–25%
- hindari enterprise pricing

6. ITEM GENERATION RULE
- 10–20 item
- HARUS spesifik & relevan
- Quantity logis

FORMAT WAJIB:
{
  "name": "",
  "category": "hardware/software/services/maintenance",
  "type": "one_time/recurring",
  "quantity": 0,
  "unit_price": 0,
  "total_price": 0
}

RULE:
- total_price = quantity × unit_price
- tidak boleh field tambahan

========================================
STRUKTUR ANALISIS OUTPUT (RINGKAS & TAJAM)
========================================

1. BUSINESS SNAPSHOT
- skala usaha (validasi)
- karakteristik
- pain points

2. KEY DIGITALIZATION NEEDS
- max 5 poin prioritas

3. RECOMMENDED IT SOLUTION
- POS, Inventory, Website/App, Cloud
- fungsi singkat

4. IT ARCHITECTURE
Transaksi → Sistem → Data → Laporan → Decision

5. INVESTMENT TABLE
| Item | Category | Type | Qty | Unit Price | Total |

6. COST SUMMARY
- total_capex
- opex_monthly
- opex_yearly
+ insight singkat

7. BUSINESS IMPACT
- revenue_increase (%)
- efficiency (%)
- error_reduction (%)
+ alasan singkat

========================================
TANGIBLE BENEFIT (WAJIB NUMERIK)
========================================

FORMAT:

| Benefit | Formula | Assumption | Yearly Saving (Rp) |

WAJIB:
- minimal 3 manfaat
- setiap manfaat harus:
  - ada FORMULA
  - ada ASUMSI
  - ada HASIL NOMINAL

CONTOH:
- Efisiensi pegawai:
  (1 pegawai × Rp3.000.000 × 12 × 50%)
- Peningkatan omzet:
  (Omzet bulanan × % kenaikan × 12)
- Error reduction:
  (kerugian bulanan × 12)

DILARANG:
- angka tanpa dasar
- asumsi tanpa penjelasan

========================================
FINANCIAL ANALYSIS
========================================

1. PAYBACK
- payback_years = CAPEX / annual_benefit
- payback_months = tahun × 12

2. PROJECTION
- 1–5 tahun (berdasarkan payback)
- yearly saving
- total cumulative

3. ROI
ROI = (Total Benefit – Total Cost) / Total Cost

========================================
ADVANCED ANALYSIS
========================================

1. QUASI TANGIBLE
- value_linking
- value_acceleration
- value_restructuring

2. SILK METHOD (WAJIB KUANTIFIKASI)
- konversi ke Rp/tahun
- tambahkan ke benefit
- sertakan logika

========================================
RISK ANALYSIS
========================================
- operational
- technology
- financial
+ mitigasi singkat

========================================
DECISION ENGINE
========================================
Score:
- ROI score (0–10)
- Feasibility score (0–10)
- Risk score (0–10)

Final:
- Highly Recommended / Recommended / Conditional / Not Recommended

WAJIB:
- berbasis angka & analisis (bukan opini)

========================================
INDUSTRY BENCHMARK
========================================
- IT spending (% revenue)
- posisi bisnis vs UMKM sejenis

========================================
OUTPUT JSON (STRICT – WAJIB VALID)
========================================

{
  "business_profile": {
    "jenis_usaha": "",
    "skala_usaha": "",
    "jumlah_karyawan": 0,
    "lokasi": ""
  },
  "business_analysis": {
    "karakteristik": "",
    "masalah": "",
    "kebutuhan_digitalisasi": ""
  },
  "it_architecture": {
    "pos_system": "",
    "inventory_system": "",
    "website_app": "",
    "database_cloud": "",
    "integration": ""
  },
  "investment_plan": [],
  "cost_structure": {
    "total_capex": 0,
    "opex_monthly": 0,
    "opex_yearly": 0
  },
  "business_impact": {
    "revenue_increase_percent": 0,
    "operational_efficiency_percent": 0,
    "error_reduction_percent": 0
  },
  "tangible_benefits": [
    {
      "name": "",
      "formula": "",
      "assumption": "",
      "yearly_saving": 0,
      "unit": "year"
    }
  ],
  "financial_analysis": {
    "total_annual_benefit": 0,
    "payback_years": 0,
    "payback_months": 0,
    "roi_1_year": 0,
    "roi_3_years": 0
  },
  "projection": {
    "duration_years": 0,
    "yearly_benefit": [],
    "total_benefit": 0
  },
  "quasi_tangible": {},
  "silk_conversion": {
    "converted_value": 0,
    "justification": ""
  },
  "risk_analysis": {},
  "decision": {
    "roi_score": 0,
    "feasibility_score": 0,
    "risk_score": 0,
    "final_verdict": "",
    "reasoning": ""
  },
  "benchmark": {}
}

========================================
OUTPUT TAMBAHAN (WAJIB)
========================================

SETELAH JSON, tampilkan:

1. TABEL RINGKAS INVESTASI (rapi & mudah dibaca)
2. KEY INSIGHT SUMMARY (maks 120 kata, langsung ke keputusan)

========================================
STRICT RULES
========================================
- Semua angka harus punya dasar (formula)
- Tidak boleh angka random
- Tidak boleh overengineering
- Fokus UMKM Indonesia
- Output harus bisa dibaca dalam 5–10 menit
- JSON harus valid (tidak error)
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
      // Jangan gunakan responseSchema Zod di sini, karena Gemini meminta SchemaType native
      // dan responseMimeType dilepas karena prompt juga meminta teks tabel di luar JSON
    });

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    // 1. Ekstrak JSON dari teks balasan (karena AI mungkin membalas dengan teks markdown tambahan)
    const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Format balasan AI tidak memiliki JSON yang valid.");
    }
    
    // Membersihkan blok markdown jika ada
    let rawJsonText = jsonMatch[0];
    if (rawJsonText.startsWith('\`\`\`')) {
      rawJsonText = rawJsonText.replace(/^\`\`\`(?:json)?\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    const parsedData = JSON.parse(rawJsonText);
    const validatedData = expectedLLMOutputSchema.parse(parsedData);

    // 2. Map kembali ke wadah Database Mongoose (capex, opex, tangibleBenefits, intangibleBenefits)
    const capex = [];
    const opex = [];
    
    (validatedData.investment_plan || []).forEach(item => {
      const isOpex = item.type === 'recurring' || item.category === 'maintenance' || item.category === 'services';
      const mappedItem = {
        item: item.name || 'Unknown Item',
        description: item.category || '',
        nominal: item.total_price || 0
      };
      if (isOpex) opex.push(mappedItem);
      else capex.push(mappedItem);
    });

    const tangibleBenefits = (validatedData.tangible_benefits || []).map(b => ({
      item: b.name || 'Unknown Benefit',
      description: b.assumption || b.formula || '',
      nominal: b.yearly_saving || 0
    }));

    const intangibleBenefits = [
      { 
        item: "Keputusan Bisnis (" + (validatedData.decision?.final_verdict || "TBD") + ")", 
        description: validatedData.decision?.reasoning || "Berdasarkan analisis LLM", 
        nominal: 0 
      }
    ];

    // Kita return struktur standar ini agar Project.js (Mongoose) bisa menyimpannya ke database
    // tanpa error atau data terbuang.
    return {
      capex,
      opex,
      tangibleBenefits,
      intangibleBenefits
    };

  } catch (error) {
    console.error("LLM Error / Validation Failed:", error);
    throw new Error('Gagal mengekstrak data dari AI atau format tidak sesuai. Silakan coba lagi. ' + error.message);
  }
};

// Fungsi dummy sementara untuk mensimulasikan balasan API
async function mockCallLlmApi(prompt) {
  return Promise.resolve(`
    {
      "capex": [
        {"item": "Server Fisik", "description": "Database server", "nominal": 50000000},
        {"item": "Lisensi Software", "description": "Lisensi ERP 1 tahun", "nominal": 120000000}
      ],
      "opex": [
        {"item": "Maintenance Jaringan", "description": "Biaya bulanan internet & cloud", "nominal": 15000000}
      ],
      "tangibleBenefits": [
        {"item": "Efisiensi Kertas & Tinta", "description": "Digitalisasi dokumen", "nominal": 5000000}
      ],
      "intangibleBenefits": [
        {"item": "Kecepatan Pengambilan Keputusan", "description": "Data real-time", "nominal": 25000000}
      ]
    }
  `);
}

export { generateProjectDraft };
