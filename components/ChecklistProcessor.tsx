
import React, { useState } from 'react';
import { processChecklist } from '../services/geminiService';
import type { Report } from '../types';

const exampleChecklist = {
  "inspection_id": "insp_12345",
  "equipment_id": "ext-001-floor-2",
  "inspector_id": "user_abcde",
  "answers": [
    { "question_id": "q1_valve_check", "value": 2, "comment": "Válvula em bom estado." },
    { "question_id": "q2_pressure_gauge", "value": 1, "comment": "Manômetro na faixa vermelha.", "photo": "https://example.com/photo1.jpg" },
    { "question_id": "q3_hose_condition", "value": 2 },
    { "question_id": "q4_seal_integrity", "value": 0, "comment": "Não aplicável para este modelo." }
  ]
};

const ChecklistProcessor: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleChecklist, null, 2));
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [compliance, setCompliance] = useState<number | null>(null);

  const handleProcess = async () => {
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
      setError('');
    } catch (e) {
      setError('JSON inválido. Verifique a sintaxe.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    setCompliance(null);
    
    // Local calculation
    const totalQuestions = parsedJson.answers.filter((a: any) => a.value !== 0).length;
    const conformQuestions = parsedJson.answers.filter((a: any) => a.value === 2).length;
    const compliancePercentage = totalQuestions > 0 ? (conformQuestions / totalQuestions) * 100 : 100;
    setCompliance(compliancePercentage);

    try {
      const generatedReport = await processChecklist(parsedJson);
      setReport(generatedReport);
    } catch (err) {
      setError('Falha ao gerar relatório. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Processador de Checklist e Gerador de Relatório</h2>
      <p className="text-gray-400 mb-6">Cole o JSON do checklist de inspeção para validar, calcular a conformidade e gerar o relatório final com sumário e ações sugeridas.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="json-input" className="block text-sm font-medium text-gray-300">Checklist JSON</label>
          <textarea
            id="json-input"
            rows={15}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-3 font-mono"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-blue-800 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processando...' : 'Processar e Gerar Relatório'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      
      {(report || compliance !== null) && (
        <div className="mt-8 pt-6 border-t border-gray-700">
            {compliance !== null && (
                 <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Cálculo de Conformidade</h3>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="w-full bg-gray-900 rounded-full h-4">
                            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${compliance.toFixed(2)}%` }}></div>
                        </div>
                        <span className="font-bold text-xl text-blue-300">{compliance.toFixed(2)}%</span>
                    </div>
                </div>
            )}

            {report && (
                <div>
                    <h3 className="text-lg font-semibold text-white">Relatório Final Gerado</h3>
                    <div className="mt-2 p-4 bg-gray-900 rounded-md">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                            {JSON.stringify(report, null, 2)}
                        </pre>
                    </div>
                     <div className="mt-4">
                         <a href={report.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                            Baixar relatório em PDF (Link Simulado) &rarr;
                         </a>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ChecklistProcessor;
