import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Globe } from 'lucide-react';

interface JobFormProps {
  onJobCreated: (job: any) => void;
}

export const JobForm = ({ onJobCreated }: JobFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    url: 'https://docs.firecrawl.dev',
    limit: 25,
    formats: 'markdown,html'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const job = await response.json();
      onJobCreated(job);
      
      toast({
        title: "Job Created",
        description: `Crawl job started for ${formData.url}`,
      });
      
      // Reset form
      setFormData({
        url: 'https://docs.firecrawl.dev',
        limit: 25,
        formats: 'markdown,html'
      });
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create crawl job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card transition-smooth hover:shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <CardTitle>Create Crawl Job</CardTitle>
        </div>
        <CardDescription>
          Start a new web crawl with customizable parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              required
              className="transition-smooth focus:shadow-elegant"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Page Limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="1000"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 25 })}
                className="transition-smooth focus:shadow-elegant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formats">Output Formats</Label>
              <Input
                id="formats"
                value={formData.formats}
                onChange={(e) => setFormData({ ...formData, formats: e.target.value })}
                placeholder="markdown,html"
                className="transition-smooth focus:shadow-elegant"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-primary hover:shadow-elegant transition-smooth"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating Job...' : 'Start Crawl'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};