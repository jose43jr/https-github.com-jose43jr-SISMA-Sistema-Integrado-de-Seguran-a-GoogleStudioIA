
import React, { useState } from 'react';
import Header from './components/Header';
import NormativeAssistant from './components/NormativeAssistant';
import ImageAnalysis from './components/ImageAnalysis';
import ChecklistProcessor from './components/ChecklistProcessor';
import TabButton from './components/TabButton';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ASSISTANT);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ASSISTANT:
        return <NormativeAssistant />;
      case AppTab.IMAGE_ANALYSIS:
        return <ImageAnalysis />;
      case AppTab.CHECKLIST:
        return <ChecklistProcessor />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <TabButton
                label="Assistente Normativo"
                isActive={activeTab === AppTab.ASSISTANT}
                onClick={() => setActiveTab(AppTab.ASSISTANT)}
              />
              <TabButton
                label="Análise de Imagem"
                isActive={activeTab === AppTab.IMAGE_ANALYSIS}
                onClick={() => setActiveTab(AppTab.IMAGE_ANALYSIS)}
              />
              <TabButton
                label="Processar Checklist"
                isActive={activeTab === AppTab.CHECKLIST}
                onClick={() => setActiveTab(AppTab.CHECKLIST)}
              />
            </nav>
          </div>
        </div>
        <div>{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
