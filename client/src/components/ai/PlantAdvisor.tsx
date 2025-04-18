
import { useState } from 'react';
import { getGardeningAdvice } from '@/utils/perplexityApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PlantAdvisor() {
  const [query, setQuery] = useState("");
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    
    try {
      const response = await getGardeningAdvice(query);
      setAdvice(response);
    } catch (err) {
      setError("Failed to get advice. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">AI Plant Advisor</CardTitle>
        <CardDescription>
          Ask any question about plants, gardening, or plant care and get expert advice
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., How often should I water my monstera?"
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ask"}
            </Button>
          </div>
        </form>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
        
        {advice && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-2">Gardening Advice:</h3>
            <div className="prose prose-sm max-w-none">
              {advice.split('\n').map((paragraph, i) => (
                paragraph ? <p key={i} className="mb-2">{paragraph}</p> : <br key={i} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="text-sm text-gray-500">Powered by Perplexity AI</span>
        <Button variant="ghost" size="sm" onClick={() => setAdvice("")} disabled={!advice || isLoading}>
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}
