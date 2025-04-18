
import { useState } from 'react';
import { getProductRecommendations } from '@/utils/perplexityApi';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ProductRecommender() {
  const [requirements, setRequirements] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirements.trim()) return;

    setIsLoading(true);
    setError("");
    
    try {
      const response = await getProductRecommendations(requirements);
      setRecommendations(response);
    } catch (err) {
      setError("Failed to get recommendations. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">AI Product Recommender</CardTitle>
        <CardDescription>
          Describe your gardening needs and get personalized product recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe your garden, climate, goals, and any specific requirements. For example: I have a small balcony garden in a hot climate. I want to grow vegetables and herbs with minimal maintenance."
            className="min-h-[120px]"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !requirements.trim()}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Get Recommendations"}
          </Button>
        </form>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
        
        {recommendations && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-2">Recommended Products:</h3>
            <div className="prose prose-sm max-w-none">
              {recommendations.split('\n').map((paragraph, i) => (
                paragraph ? <p key={i} className="mb-2">{paragraph}</p> : <br key={i} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="text-sm text-gray-500">Powered by Perplexity AI</span>
        <Button variant="ghost" size="sm" onClick={() => setRecommendations("")} disabled={!recommendations || isLoading}>
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}
