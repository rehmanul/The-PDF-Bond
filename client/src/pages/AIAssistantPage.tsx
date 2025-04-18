
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlantAdvisor from "@/components/ai/PlantAdvisor";
import ProductRecommender from "@/components/ai/ProductRecommender";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("plant-advisor");
  
  return (
    <>
      <Helmet>
        <title>AI Garden Assistant - Okkyno</title>
        <meta 
          name="description" 
          content="Get AI-powered gardening advice and personalized product recommendations for your garden" 
        />
      </Helmet>
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3">AI Garden Assistant</h1>
            <p className="text-gray-600">
              Get intelligent gardening advice and personalized recommendations powered by Perplexity AI
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="plant-advisor">Plant Advisor</TabsTrigger>
              <TabsTrigger value="product-recommender">Product Recommender</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plant-advisor" className="mt-2">
              <PlantAdvisor />
            </TabsContent>
            
            <TabsContent value="product-recommender" className="mt-2">
              <ProductRecommender />
            </TabsContent>
          </Tabs>
          
          <div className="mt-12 bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">About Our AI Garden Assistant</h2>
            <p className="mb-4">
              Our AI Garden Assistant combines the knowledge of gardening experts with the power of Perplexity AI to provide you with accurate and personalized gardening advice.
            </p>
            <p className="mb-4">
              Whether you're a beginner trying to keep your first plant alive or an experienced gardener looking for specific advice, our AI can help you make the right decisions for your garden.
            </p>
            <div className="flex items-center justify-center mt-6">
              <span className="text-green-600 font-medium">Powered by Perplexity AI</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
