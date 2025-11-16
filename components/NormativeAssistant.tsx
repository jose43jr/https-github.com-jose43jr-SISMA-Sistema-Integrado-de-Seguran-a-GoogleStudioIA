
import React, { useState } from 'react';
import { generateNormativeResponse } from '../services/geminiService';

const NormativeAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) {
      setError('Por favor, insira uma consulta.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResponse('');
    try {
      const result = await generateNormativeResponse(query);
      setResponse(result);
    } catch (err) {
      setError('Falha ao obter resposta. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const exampleQuery = "Qual a largura mínima para faixa de estacionamento de viaturas segundo NT 010/08 CBMCE?";

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Assistente Normativo (RAG)</h2>
      <p className="text-gray-400 mb-6">Consulte normas, procedimentos e padrões de segurança. O assistente irá buscar a informação e fornecer uma resposta com base nos documentos do sistema.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-300">Sua Pergunta</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <textarea
              id="query"
              rows={3}
              className="flex-1 block w-full rounded-l-md bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-3"
              placeholder={exampleQuery}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
             <button
              onClick={() => setQuery(exampleQuery)}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              Exemplo
            </button>
          </div>
        </div>
        
        <button
          onClick={handleQuery}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-blue-800 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Consultando...
            </>
          ) : 'Consultar Norma'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      
      {response && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white">Resposta do Assistente</h3>
          <div className="mt-2 p-4 bg-gray-900 rounded-md whitespace-pre-wrap font-mono text-sm text-gray-300">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default NormativeAssistant;
