
import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage, fileToBase64 } from '../services/geminiService';
import type { ImageAnalysisResult } from '../types';

const ImageAnalysis: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (result && imagePreview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.src = imagePreview;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        result.detections.forEach(det => {
            const [x1, y1, x2, y2] = det.bbox;
            ctx.strokeStyle = '#34D399'; // green-400
            ctx.lineWidth = 4;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = '#34D399';
            ctx.font = '16px sans-serif';
            ctx.fillText(`${det.class} (${det.score.toFixed(2)})`, x1, y1 > 20 ? y1 - 5 : y1 + 20);
        });
      };
    }
  }, [result, imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleAnalysis = async () => {
    if (!image) {
      setError('Por favor, selecione uma imagem.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const base64Image = await fileToBase64(image);
      const analysisResult = await analyzeImage(base64Image);
      setResult(analysisResult);
    } catch (err) {
      setError('Falha ao analisar imagem. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Análise Visual de Inconformidades (PoC)</h2>
      <p className="text-gray-400 mb-6">Envie uma imagem de inspeção para detectar potenciais problemas de segurança. Esta é uma prova de conceito e usará dados simulados.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300">Carregar Imagem</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
                  <span>Carregue um arquivo</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG até 10MB</p>
            </div>
          </div>
        </div>

        {imagePreview && (
            <div className="relative">
                <p className="text-sm font-medium text-gray-300 mb-2">Pré-visualização:</p>
                <img src={imagePreview} alt="Preview" className="max-h-96 w-auto rounded-lg mx-auto" />
            </div>
        )}

        <button
          onClick={handleAnalysis}
          disabled={isLoading || !image}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analisando...' : 'Analisar Imagem'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      
      {result && (
        <div className="mt-8 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <h3 className="text-lg font-semibold text-white mb-2">Imagem Analisada</h3>
                 <canvas ref={canvasRef} className="w-full h-auto rounded-lg"></canvas>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Resultado da Análise</h3>
                <div className="p-4 bg-gray-900 rounded-md">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;
