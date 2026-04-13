import z from "zod";

// API Endpoint for Claude Opus (Draft System)
const OPUS_API_URL = "https://mlapi.run/2bc70f09-d47d-4735-90a3-1789addb24c0/v1/chat/completions";

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
Sbg Konsultan Investasi IT Senior untuk UMKM Indonesia, buatlah analisis investasi IT dalam format JSON.

INPUT:
- jenis_usaha: ${industry}
- skala_usaha: ${scale}
- rencana_investasi: ${plan}
- lokasi_usaha: ${location}

LOGIKA CORE:
1. Skala: micro (<=10 staf), kecil (11-30), menengah (>30). Sesuaikan solusi dengan budget UMKM (lokal SaaS/marketplace).
2. Requirement: Mapping ke Core (POS/ERP), Infrastructure (Network/HW), Advanced (Cloud/Analytics).
3. Scaling: POS 1 unit per 5-8 staf. Hardware/software level: Basic (micro), Balanced (kecil), Integrated (menengah).
4. Pricing: Gunakan harga pasar Indonesia. Kota besar +15%. Hindari harga enterprise.

ESTIMASI ITEM (10-20 item):
- Format Item: {"name": "", "category": "hardware/software/services/maintenance", "type": "one_time/recurring", "quantity": 0, "unit_price": 0, "total_price": 0}

MANFAAT TANGIBLE:
- Minimal 3 manfaat (Efisiensi SDM, Omzet, Error Reduction). Sertakan formula & asumsi kuantitatif.

OUTPUT JSON (STRICT):
{
  "business_profile": { "jenis_usaha": "", "skala_usaha": "", "jumlah_karyawan": 0, "lokasi": "" },
  "business_analysis": { "karakteristik": "", "masalah": "", "kebutuhan_digitalisasi": "" },
  "it_architecture": { "pos_system": "", "inventory_system": "", "website_app": "", "database_cloud": "", "integration": "" },
  "investment_plan": [],
  "cost_structure": { "total_capex": 0, "opex_monthly": 0, "opex_yearly": 0 },
  "business_impact": { "revenue_increase_percent": 0, "operational_efficiency_percent": 0, "error_reduction_percent": 0 },
  "tangible_benefits": [
    { "name": "", "formula": "", "assumption": "", "yearly_saving": 0, "unit": "year" }
  ],
  "financial_analysis": { "total_annual_benefit": 0, "payback_years": 0, "payback_months": 0, "roi_1_year": 0, "roi_3_years": 0 },
  "projection": { "duration_years": 0, "yearly_benefit": [], "total_benefit": 0 },
  "quasi_tangible": {},
  "silk_conversion": { "converted_value": 0, "justification": "" },
  "risk_analysis": { "operational": "", "technology": "", "financial": "" },
  "decision": { "roi_score": 0, "feasibility_score": 0, "risk_score": 0, "final_verdict": "", "reasoning": "" },
  "benchmark": { "it_spending_percent": 0, "business_position": "" }
}

Hasilkan HANYA JSON di atas saja. Pastikan validitas angka (Total Price = Qty x Unit Price).
`;

  try {
    const requestPayload = {
      model: "anthropic/claude-opus-4-5",
      messages: [
        {
          role: "user",
          content: systemPrompt
        }
      ]
    };

    const response = await fetch(OPUS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHATBOT_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const rawText = await response.text();
    let parsedApiResponse = null;
    try {
      parsedApiResponse = JSON.parse(rawText);
    } catch {
      parsedApiResponse = rawText;
    }

    if (!response.ok) {
      console.error("Opus LLM Error Response:", parsedApiResponse);
      throw new Error(`Claude Opus API returned status ${response.status}`);
    }

    let text = "";
    if (parsedApiResponse?.choices?.[0]?.message?.content) {
       text = parsedApiResponse.choices[0].message.content;
    } else {
       text = JSON.stringify(parsedApiResponse);
    }

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
