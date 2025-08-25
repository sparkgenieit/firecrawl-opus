import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, FileText, Code, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  url: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalDocs?: number;
  startedAt: string;
  finishedAt?: string;
}

interface Document {
  id: string;
  title: string;
  url: string;
  markdown?: string;
  html?: string;
  metadata?: any;
}

interface JobViewerProps {
  jobId: string;
  onBack: () => void;
}

export const JobViewer = ({ jobId, onBack }: JobViewerProps) => {
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch job details
  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:4000/jobs/${jobId}`);
      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job details",
        variant: "destructive",
      });
    }
  };

  // Fetch documents
  const fetchDocuments = async (query = '') => {
    try {
      const url = query 
        ? `http://localhost:4000/jobs/${jobId}/docs?q=${encodeURIComponent(query)}`
        : `http://localhost:4000/jobs/${jobId}/docs`;
      
      const response = await fetch(url);
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
        setFilteredDocs(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll job status
  useEffect(() => {
    fetchJob();
    fetchDocuments();

    const interval = setInterval(() => {
      if (job?.status === 'running') {
        fetchJob();
        fetchDocuments();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchDocuments(searchQuery);
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-info text-white';
      case 'completed':
        return 'bg-success text-white';
      case 'failed':
        return 'bg-destructive text-white';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:shadow-elegant transition-smooth"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{job.url}</h2>
          <div className="flex items-center gap-4 mt-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
            <span className="text-muted-foreground">
              {job.totalDocs ? `${job.totalDocs} documents` : 'Crawling...'}
            </span>
            <span className="text-muted-foreground">
              Started: {new Date(job.startedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Search and browse crawled documents
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 transition-smooth focus:shadow-elegant"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Loading documents...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No documents found
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3 rounded cursor-pointer transition-smooth hover:bg-muted/50 ${
                        selectedDoc?.id === doc.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="font-medium truncate">{doc.title || 'Untitled'}</div>
                      <div className="text-sm text-muted-foreground truncate">{doc.url}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Preview
            </CardTitle>
            <CardDescription>
              {selectedDoc ? selectedDoc.title || selectedDoc.url : 'Select a document to preview'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDoc ? (
              <Tabs defaultValue="markdown" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                <TabsContent value="markdown" className="mt-4">
                  <ScrollArea className="h-80 w-full border rounded p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {selectedDoc.markdown || 'No markdown content available'}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <ScrollArea className="h-80 w-full border rounded">
                    <div
                      className="p-4 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedDoc.html || '<p>No HTML content available</p>'
                      }}
                    />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="metadata" className="mt-4">
                  <ScrollArea className="h-80 w-full border rounded p-4">
                    <pre className="text-sm">
                      {JSON.stringify(selectedDoc.metadata || {}, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a document from the list to view its content</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};