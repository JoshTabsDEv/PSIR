'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, FileDown, Trash2, MoreVertical, LayoutDashboard, FileText, User, Gavel, Globe, Brain, ChevronLeft, Download, ShieldAlert, CalendarCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay, formatRelativeTime } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ViewReportSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <aside className="w-[280px] border-r bg-white p-6 space-y-8">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-12 max-w-4xl mx-auto space-y-12">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ViewReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<PSIRReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState('section-1');
  const [showCourtDateDialog, setShowCourtDateDialog] = useState(false);
  const [courtDate, setCourtDate] = useState('');
  const [submittingCourtDate, setSubmittingCourtDate] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${id}`);
        const result = await response.json();
        if (result.success) {
          setReport(result.data);
        } else {
          toast.error('Failed to load report');
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
        toast.error('An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Report deleted');
        router.push('/dashboard/reports');
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportDocx = () => {
    toast.info('Generating document...');
    window.open(`/api/reports/${id}/export/docx`, '_blank');
  };

  const handleSetCourtDate = async () => {
    if (!courtDate) return;
    setSubmittingCourtDate(true);
    try {
      const response = await fetch(`/api/reports/${id}/submit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedToCourtDate: courtDate }),
      });
      if (response.ok) {
        toast.success('Report submitted and marked as completed');
        const fetchResponse = await fetch(`/api/reports/${id}`);
        const fetchResult = await fetchResponse.json();
        if (fetchResult.success) setReport(fetchResult.data);
        setShowCourtDateDialog(false);
        setCourtDate('');
      } else {
        toast.error('Failed to save submitted date');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSubmittingCourtDate(false);
    }
  };

  if (loading) return <ViewReportSkeleton />;
  if (!report) return <div className="p-12 text-center">Report not found</div>;

  const sections = [
    { id: 'section-1', title: 'Identifying Data', icon: User, short: 'I' },
    { id: 'section-2', title: 'Criminal History', icon: Gavel, short: 'II' },
    { id: 'section-3', title: 'Socio-Economic', icon: Globe, short: 'III' },
    { id: 'section-4', title: 'Analysis & Recommendations', icon: Brain, short: 'IV' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] absolute inset-0 z-50 overflow-hidden">

      {/* Workspace Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-border fixed h-screen px-6 py-8 z-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <Link href="/dashboard/reports" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Reports</span>
            </Link>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
                <h1 className="text-sm font-bold tracking-tight">Report Review</h1>
              </div>
              <div className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                {report.reportNumber}
              </div>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg',
                  activeSection === section.id
                    ? 'bg-white shadow-sm ring-1 ring-border border-l-4 border-l-[var(--brand-primary)]'
                    : 'hover:bg-muted/50 border-l-4 border-l-transparent text-muted-foreground'
                )}
              >
                <section.icon className={cn("h-4 w-4", activeSection === section.id ? "text-[var(--brand-primary)]" : "text-muted-foreground/60")} />
                <span className="text-sm font-semibold tracking-tight">{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="pt-8 mt-8 border-t border-border/50 space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2 h-9 border-dashed" onClick={handleExportDocx}>
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Export DOCX</span>
            </Button>
            <Link href={`/dashboard/reports/${id}/edit`} className="block">
              <Button variant="outline" className="w-full justify-start gap-2 h-9 border-dashed">
                <Pencil className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Edit Report</span>
              </Button>
            </Link>
            <Button
              variant="default"
              className="w-full justify-start gap-2 h-9 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white"
              onClick={() => {
                setCourtDate(report.submittedToCourtDate
                  ? new Date(report.submittedToCourtDate).toISOString().split('T')[0]
                  : '');
                setShowCourtDateDialog(true);
              }}
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {report.submittedToCourtDate ? 'Update Court Date' : 'Set Court Date'}
              </span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Delete</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 lg:ml-[280px] overflow-y-auto h-screen scroll-smooth">
        <div className="container max-w-4xl mx-auto py-12 px-6 lg:px-12 space-y-12 pb-24">

          {/* Section I */}
          <section id="section-1" className="space-y-8 bg-white p-8 rounded-xl border shadow-sm ring-1 ring-black/[0.02]">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Section I</span>
              <h2 className="text-xl font-bold tracking-tight">Identifying Data</h2>
            </div>

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Full Name', value: formatFullName(report.identifyingData.lastName, report.identifyingData.firstName, report.identifyingData.middleName) },
                { label: 'Alias', value: report.identifyingData.alias },
                { label: 'True Name', value: report.identifyingData.trueName },
                { label: 'Sex', value: report.identifyingData.sex },
                { label: 'Age', value: report.identifyingData.age },
                { label: 'Birthday', value: formatDateDisplay(report.identifyingData.birthday) },
                { label: 'Birthplace', value: report.identifyingData.birthplace },
                { label: 'Nationality', value: report.identifyingData.nationality },
                { label: 'Religion', value: report.identifyingData.religion },
                { label: 'Civil Status', value: report.identifyingData.civilStatus },
                { label: 'Education', value: report.identifyingData.educationalAttainment },
                { label: 'Occupation', value: report.identifyingData.occupation },
                { label: 'Spouse', value: report.identifyingData.spouseName },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</span>
                  <p className="text-sm font-semibold text-foreground/90">{item.value || 'N/A'}</p>
                </div>
              ))}
              <div className="md:col-span-2 lg:col-span-3 space-y-1 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Identifying Marks</span>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">{report.identifyingData.identifyingMarks || 'No distinguishing marks noted.'}</p>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 pt-4 border-t border-dashed">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Present Address</span>
                <p className="text-sm font-medium leading-relaxed">{report.identifyingData.presentAddress || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Permanent Address</span>
                <p className="text-sm font-medium leading-relaxed">{report.identifyingData.permanentAddress || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Section II */}
          <section id="section-2" className="space-y-8 bg-white p-8 rounded-xl border shadow-sm ring-1 ring-black/[0.02]">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Section II</span>
              <h2 className="text-xl font-bold tracking-tight">Criminal History</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Present Offense</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2 pl-4 border-l-2 border-[var(--brand-primary)]/10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Charged With</span>
                  <p className="text-sm font-semibold">{report.criminalHistory.presentOffense.chargedWith || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Date Charged</span>
                  <p className="text-sm font-semibold">{report.criminalHistory.presentOffense.chargedDate ? formatDateDisplay(report.criminalHistory.presentOffense.chargedDate) : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Convicted Of</span>
                  <p className="text-sm font-semibold">{report.criminalHistory.presentOffense.convictedOf || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sentence</span>
                  <p className="text-sm font-semibold">{report.criminalHistory.presentOffense.sentence || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Prior Records</h3>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-muted/5 mx-4">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-2 font-bold uppercase tracking-widest text-muted-foreground/70">Agency</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-widest text-muted-foreground/70">Case #</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-widest text-muted-foreground/70">Offense</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-widest text-muted-foreground/70">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(report.criminalHistory.priorRecords).map(([agency, data]: [string, any]) => (
                      <tr key={agency}>
                        <td className="px-4 py-2 font-bold uppercase">{agency}</td>
                        <td className="px-4 py-2">{data.criminalCaseNo || '-'}</td>
                        <td className="px-4 py-2">{data.offense || '-'}</td>
                        <td className="px-4 py-2 italic">{data.decisionStatus || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section III */}
          <section id="section-3" className="space-y-8 bg-white p-8 rounded-xl border shadow-sm ring-1 ring-black/[0.02]">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Section III</span>
              <h2 className="text-xl font-bold tracking-tight">Socio-Economic</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { label: 'Economic Status', value: report.socioEconomicBackground.familyEconomicStatus },
                { label: 'Family Relationship', value: report.socioEconomicBackground.familyRelationship },
                { label: 'Family Reputation', value: report.socioEconomicBackground.familyReputation },
                { label: 'Family Support', value: report.socioEconomicBackground.familySupport },
                { label: 'Community Acceptability', value: report.socioEconomicBackground.communityAcceptability },
                { label: 'Well-Being', value: report.socioEconomicBackground.overallWellBeing },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-lg border bg-muted/5 flex items-center justify-between",
                  item.value?.toLowerCase().includes('poor') ? "border-red-100 bg-red-50/30" : "border-border"
                )}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider",
                    item.value?.toLowerCase().includes('poor') ? "text-red-600 border-red-200 bg-white" : "text-[var(--brand-primary)] border-[var(--brand-primary)]/20 bg-white shadow-sm"
                  )}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section IV */}
          <section id="section-4" className="space-y-8 bg-white p-8 rounded-xl border shadow-sm ring-1 ring-black/[0.02]">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">Section IV</span>
              <h2 className="text-xl font-bold tracking-tight">Analysis & Evaluation</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Final Synthesis</span>
                <div className="text-sm leading-relaxed text-foreground/80 font-mono bg-muted/5 p-6 rounded-lg border border-dashed whitespace-pre-wrap italic">
                  {report.analysisEvaluation.circumstances || 'No synthesis provided.'}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-4">
                <div className="p-4 rounded-lg border bg-green-50/30 border-green-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-700/60 block mb-2">Probation Period</span>
                  <p className="text-sm font-bold text-green-900">{report.analysisEvaluation.probationPeriod || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg border bg-[var(--brand-primary)]/[0.03] border-[var(--brand-primary)]/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/60 block mb-2">Community Service</span>
                  <p className="text-sm font-bold">{report.analysisEvaluation.communityServiceHours || 0} Hours</p>
                  <p className="text-xs mt-1 text-muted-foreground italic">&quot;{report.analysisEvaluation.communityServiceType}&quot;</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent onClose={() => setShowDelete(false)}>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
