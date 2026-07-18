import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Briefcase,
  GitBranch,
  BarChart3,
  User,
  Eye,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button } from '../ui';
import { api } from '../../lib/api';
import { Report } from '../../types';

const reportTypes = [
  { icon: Briefcase, name: 'Career Analysis', description: 'Comprehensive career readiness report based on role requirements' },
  { icon: GitBranch, name: 'Repository Health', description: 'Detailed analysis of code quality, documentation, and maintainability' },
  { icon: BarChart3, name: 'Skills Assessment', description: 'In-depth evaluation of technical skills and learning recommendations' },
  { icon: User, name: 'Profile Overview', description: 'Complete GitHub profile analysis with improvement suggestions' },
];

const getStatusIcon = (status: string) => {
  if (status === 'completed') return <CheckCircle className="w-4 h-4 text-accent-primary" />;
  if (status === 'processing') return <Clock className="w-4 h-4 text-accent-warning animate-spin" />;
  return <AlertCircle className="w-4 h-4 text-accent-danger" />;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial reports list
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.reports.getReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Poll status of processing reports
  useEffect(() => {
    const hasProcessing = reports.some((r) => r.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const updated = await Promise.all(
          reports.map(async (r) => {
            if (r.status === 'processing') {
              const fresh = await api.reports.getReportById(r.id);
              return fresh;
            }
            return r;
          })
        );
        // Compare to prevent useless re-renders
        setReports(updated);
      } catch (err) {
        console.error('Error polling report status', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reports]);

  const handleGenerate = async (typeName: string) => {
    try {
      const res = await api.reports.generateReport(typeName);
      const newReport: Report = {
        id: res.reportId,
        title: `${typeName} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        createdAt: new Date().toLocaleDateString('en-US'),
        type: typeName,
        status: 'processing',
      };
      setReports((prev) => [newReport, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Failed to start report generation');
    }
  };

  const handleDownload = (reportId: string) => {
    const downloadUrl = api.reports.getDownloadReportUrl(reportId);
    window.open(downloadUrl, '_blank');
  };

  const handleView = (reportId: string) => {
    const viewUrl = api.reports.getViewReportUrl(reportId);
    window.open(viewUrl, '_blank');
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.reports.deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete report');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-accent-primary" />
            Reports
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Generate and download detailed analysis reports
          </p>
        </div>
      </div>

      {/* Generate New Reports */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              variant="interactive"
              padding="md"
              className="hover:border-accent-primary cursor-pointer"
              onClick={() => handleGenerate(type.name)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <type.icon className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary dark:text-white text-sm">
                    {type.name}
                  </h3>
                  <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1 line-clamp-2">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <Card padding="lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-primary" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-sm text-text-muted dark:text-text-dark-muted">
                No reports generated yet. Click one of the options above to generate a report.
              </div>
            ) : (
              reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 bg-light-surface-secondary dark:bg-dark-card rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary dark:text-white">{report.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted dark:text-text-dark-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.createdAt}
                        </span>
                        <span>{report.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                      report.status === 'completed'
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : report.status === 'processing'
                          ? 'bg-accent-warning/10 text-accent-warning'
                          : 'bg-accent-danger/10 text-accent-danger'
                    }`}>
                      {getStatusIcon(report.status)}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={report.status !== 'completed'}
                      onClick={() => handleView(report.id)}
                      className="text-accent-primary hover:text-accent-primary-hover"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={report.status !== 'completed'}
                      onClick={() => handleDownload(report.id)}
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="text-accent-danger hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
