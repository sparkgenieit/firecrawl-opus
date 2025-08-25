import { useState, useEffect } from 'react';
import { JobForm } from '@/components/JobForm';
import { JobsList } from '@/components/JobsList';
import { JobViewer } from '@/components/JobViewer';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  url: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalDocs?: number;
  startedAt: string;
  finishedAt?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:4000/jobs');
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the backend. Please ensure the server is running on http://localhost:4000",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Refresh jobs every 5 seconds if there are running jobs
    const interval = setInterval(() => {
      const hasRunningJobs = jobs.some(job => job.status === 'running');
      if (hasRunningJobs) {
        fetchJobs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs]);

  const handleJobCreated = (newJob: Job) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
    fetchJobs(); // Refresh the list when coming back
  };

  if (selectedJobId) {
    return (
      <JobViewer 
        jobId={selectedJobId} 
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Web Crawler Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Create and monitor web crawling jobs with real-time updates
        </p>
      </div>

      <JobForm onJobCreated={handleJobCreated} />
      
      <JobsList 
        jobs={jobs}
        onJobSelect={handleJobSelect}
        onRefresh={fetchJobs}
      />
    </div>
  );
};

export default Index;
