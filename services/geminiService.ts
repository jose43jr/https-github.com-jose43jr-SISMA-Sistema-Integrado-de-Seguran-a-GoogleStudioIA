import { GoogleGenAI, Type } from '@google/genai';
import type { ImageAnalysisResult, Report, NonConformity } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_API_KEY' });

export const generateNormativeResponse = async (query: string): Promise<string> => {
  // In a real RAG system, you'd retrieve documents first.
  // Here, we simulate it by providing context in the prompt.
  const prompt = `
    Você é um assistente técnico especialista no sistema SISMA.
    Responda à seguinte consulta sobre normas de segurança contra incêndio, 
    baseando-se em conhecimento técnico hipotético.
    
    Formato da Resposta:
    1. Resposta curta e direta.
    2. Citação da fonte (ex: "NT 010/08 CBMCE, seção 4 (página 3)").
    3. Recomendação prática (1-2 frases).
    4. Disclaimer legal obrigatório.

    Consulta do usuário: "${query}"
  `;
  
  if (query.includes("largura mínima")) {
      return `A largura mínima para a faixa de estacionamento de viaturas é de 8 metros.

Fonte: NT 010/08 CBMCE, seção 4 (página 3).
Recomendação: Realize a medição com uma trena métrica e documente com uma fotografia panorâmica da área.
Disclaimer: Isto é orientação técnica — não substitui parecer legal/engenheiro responsável.`;
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating normative response:", error);
    throw new Error("Failed to communicate with the generative AI model.");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// This is a mocked function for the Proof of Concept.
export const analyzeImage = async (base64Image: string): Promise<ImageAnalysisResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mocked response, as if a model detected a person without a helmet.
    console.log("Simulating image analysis for image data:", base64Image.substring(0, 50) + "...");
    return {
        detections: [
            {
                class: "no_helmet",
                bbox: [150, 80, 250, 180], // Example coordinates [x1, y1, x2, y2]
                score: 0.82
            }
        ],
        flagged: true,
        // FIX: Corrected a syntax error where the object key was incorrectly formatted as a string.
        suggested_action: "Interromper atividade, comunicar supervisor e registrar ocorrência de segurança."
    };
};

export const processChecklist = async (checklistData: any): Promise<Report> => {
    const reportSchema = {
      type: Type.OBJECT,
      properties: {
        report_id: { type: Type.STRING, description: "Um UUID v4 para o relatório." },
        equipment_id: { type: Type.STRING, description: "ID do equipamento inspecionado.", nullable: true },
        inspector_id: { type: Type.STRING, description: "ID do inspetor." },
        timestamp: { type: Type.STRING, description: "Timestamp ISO8601 da geração do relatório." },
        answers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question_id: { type: Type.STRING },
                    value: { type: Type.INTEGER },
                    comment: { type: Type.STRING, nullable: true },
                    photo: { type: Type.STRING, nullable: true },
                }
            }
        },
        summary: { type: Type.STRING, description: "Um resumo conciso do estado geral do equipamento e da inspeção." },
        non_conformities: {
            type: Type.ARRAY,
            description: "Lista de todas as não conformidades encontradas (respostas com valor 1).",
            items: {
                type: Type.OBJECT,
                properties: {
                    question_id: { type: Type.STRING, description: "O ID da pergunta não conforme." },
                    severity: { type: Type.STRING, description: "A severidade da não conformidade (CRITICAL, HIGH, MEDIUM, LOW)." },
                    suggested_action: { type: Type.STRING, description: "Uma ação corretiva clara e passo a passo." },
                },
                required: ["question_id", "severity", "suggested_action"],
            }
        },
        attachments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de URLs de anexos, como fotos." },
        pdf_url: { type: Type.STRING, description: "Um link simulado para o PDF do relatório gerado." }
      },
      required: ["report_id", "inspector_id", "timestamp", "answers", "summary", "non_conformities", "attachments", "pdf_url"],
    };

    const prompt = `
    Analise os seguintes dados de um checklist de inspeção do sistema SISMA.
    Gere um relatório completo em formato JSON, seguindo estritamente o schema fornecido.
    - O 'summary' deve ser um parágrafo curto descrevendo o resultado da inspeção.
    - Identifique todas as 'answers' com 'value' igual a 1 como uma não conformidade.
    - Para cada não conformidade, determine uma 'severity'. Se a pergunta envolver itens de segurança críticos como válvulas ou pressão, a severidade deve ser 'CRITICAL'.
    - Para cada não conformidade, crie uma 'suggested_action' clara e objetiva.
    - Popule o campo 'attachments' com qualquer URL de foto encontrada nas respostas.
    - Gere um UUID para 'report_id' e use o timestamp atual em formato ISO8601.
    - O 'pdf_url' deve ser um placeholder.

    Dados do Checklist:
    ${JSON.stringify(checklistData, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: reportSchema,
            }
        });
        const reportJson = JSON.parse(response.text);
        return reportJson as Report;

    } catch(error) {
        console.error("Error processing checklist:", error);
        // Fallback for demonstration if API fails
        const nonConformities: NonConformity[] = checklistData.answers
            .filter((a: any) => a.value === 1)
            .map((a: any) => ({
                question_id: a.question_id,
                severity: "CRITICAL",
                suggested_action: "Ação de fallback: Isolar área, comunicar manutenção, registrar ordem de serviço e substituir peça em até 24h."
            }));

        const fallbackReport: Report = {
            report_id: `fallback-${crypto.randomUUID()}`,
            equipment_id: checklistData.equipment_id,
            inspector_id: checklistData.inspector_id,
            timestamp: new Date().toISOString(),
            answers: checklistData.answers,
            summary: "Relatório de fallback: Inspeção concluída com não conformidades críticas identificadas. Ação imediata é necessária.",
            non_conformities: nonConformities,
            attachments: checklistData.answers.filter((a:any) => a.photo).map((a:any) => a.photo),
            pdf_url: "https://example.com/fallback_report.pdf"
        };
        return fallbackReport;
    }
};