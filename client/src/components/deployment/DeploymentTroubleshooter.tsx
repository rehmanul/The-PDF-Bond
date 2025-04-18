
import React, { useState } from 'react';
import { analyzeDeploymentError, suggestDeploymentOptimizations, generateDeploymentFix } from '../../utils/deploymentHelper';

interface DeploymentTroubleshooterProps {
  buildLogs?: string;
  configFile?: string;
}

const DeploymentTroubleshooter: React.FC<DeploymentTroubleshooterProps> = ({ buildLogs = '', configFile = '' }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fix, setFix] = useState('');
  
  const handleAnalyzeBuildLogs = async () => {
    if (!buildLogs && !userInput) {
      alert('Please paste your build logs or enter an error message');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeDeploymentError(buildLogs || userInput);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing build logs:', error);
      setAnalysis('An error occurred while analyzing the build logs. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestOptimizations = async () => {
    if (!configFile && !userInput) {
      alert('Please paste your Netlify configuration or enter it in the text area');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await suggestDeploymentOptimizations(configFile || userInput);
      setAnalysis(result);
    } catch (error) {
      console.error('Error suggesting optimizations:', error);
      setAnalysis('An error occurred while generating optimization suggestions. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateFix = async () => {
    if (!errorMessage) {
      alert('Please enter the error message');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await generateDeploymentFix(errorMessage, filePath);
      setFix(result);
    } catch (error) {
      console.error('Error generating fix:', error);
      setFix('An error occurred while generating a fix. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="deployment-troubleshooter p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Deployment Troubleshooter</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Analyze Build Logs</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={6}
          placeholder="Paste your build logs here or enter a description of the issue..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="flex gap-2 mt-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={handleAnalyzeBuildLogs}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Logs'}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md"
            onClick={handleSuggestOptimizations}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Suggest Optimizations'}
          </button>
        </div>
      </div>
      
      {analysis && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
          <div className="whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Generate Fix</h3>
        <div className="mb-3">
          <label className="block mb-1">Error Message:</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter the exact error message"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">File Path (optional):</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="e.g., netlify.toml or src/App.jsx"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
          onClick={handleGenerateFix}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Generating...' : 'Generate Fix'}
        </button>
      </div>
      
      {fix && (
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Suggested Fix:</h3>
          <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">{fix}</pre>
        </div>
      )}
    </div>
  );
};

export default DeploymentTroubleshooter;
