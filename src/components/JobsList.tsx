import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  url: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalDocs?: number;
  startedAt: string;
  finishedAt?: string;
}

interface JobsListProps {
  jobs: Job[];
  onJobSelect: (jobId: string) => void;
  onRefresh: () => void;
}

export const JobsList = ({ jobs, onJobSelect, onRefresh }: JobsListProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Crawl Jobs</CardTitle>
            <CardDescription>
              Manage and monitor your web crawling jobs
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="transition-smooth hover:shadow-elegant"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No jobs created yet. Create your first crawl job above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer hover:bg-muted/50 transition-smooth"
                  onClick={() => onJobSelect(job.id)}
                >
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={job.url}>
                      {job.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.totalDocs ?? '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(job.startedAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.finishedAt ? formatDate(job.finishedAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobSelect(job.id);
                      }}
                      className="hover:shadow-elegant transition-smooth"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};