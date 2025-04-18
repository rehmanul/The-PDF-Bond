
import React, { useState } from 'react';
import DeploymentTroubleshooter from '../components/deployment/DeploymentTroubleshooter';

const DeploymentHelperPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('troubleshooter');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Deployment Helper</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'troubleshooter' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('troubleshooter')}
          >
            Troubleshooter
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'guide' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('guide')}
          >
            Deployment Guide
          </button>
        </div>
      </div>
      
      {activeTab === 'troubleshooter' && (
        <DeploymentTroubleshooter />
      )}
      
      {activeTab === 'guide' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Netlify Deployment Guide</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">1. Prepare Your Project</h3>
            <p className="mb-2">Ensure your project is properly configured for deployment:</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Check that all dependencies are properly listed in package.json</li>
              <li>Verify your build command works locally</li>
              <li>Make sure environment variables are properly set up</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">2. Deploy to Netlify</h3>
            <p className="mb-2">Follow these steps to deploy:</p>
            <ol className="list-decimal pl-5 mb-4">
              <li>Push your code to your GitHub repository</li>
              <li>Log in to Netlify and create a new site from Git</li>
              <li>Select your repository and configure build settings</li>
              <li>Deploy your site</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">3. Common Issues & Solutions</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h4 className="font-semibold">Build Command Errors</h4>
              <p>If your build command fails, check your package.json scripts and make sure the build command matches what's in your Netlify configuration.</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h4 className="font-semibold">Missing Dependencies</h4>
              <p>If you see errors about missing packages, make sure they're listed in your package.json dependencies (not just devDependencies).</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-semibold">Environment Variables</h4>
              <p>Make sure all required environment variables are set in your Netlify project settings.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentHelperPage;
