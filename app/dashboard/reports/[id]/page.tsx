'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, FileDown, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ViewReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${id}`);
        const result = await response.json();
        if (result.success) {
          setReport(result.data);
        } else {
          toast.error('Failed to load report', {
            description: result.error || 'Could not fetch report data.',
          });
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
        toast.error('Failed to load report', {
          description: 'An error occurred while loading the report.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Report deleted', {
          description: 'The report has been permanently deleted.',
        });
        router.push('/dashboard/reports');
      } else {
        const result = await response.json().catch(() => ({}));
        toast.error('Failed to delete report', {
          description: result.error || 'An error occurred while deleting.',
        });
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report', {
        description: 'An error occurred while deleting the report.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleExportDocx = () => {
    toast.info('Generating DOCX...', {
      description: 'Your document will download shortly.',
      duration: 2000,
    });
    window.open(`/api/reports/${id}/export/docx`, '_blank');
  };

  if (loading) {
    return <ViewReportSkeleton />;
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
        <p className="text-gray-500 mb-4">The requested report could not be found.</p>
        <Link href="/dashboard/reports">
          <Button>Back to Reports</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/dashboard/reports' },
          { label: report.reportNumber },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{report.reportNumber}</h1>
            <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
              {report.status === 'completed' ? 'Completed' : 'Draft'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Created {formatDateDisplay(report.createdAt)}
          </p>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex gap-2">
          <Tooltip content="Export as DOCX">
            <Button variant="outline" onClick={handleExportDocx}>
              <FileDown className="mr-2 h-4 w-4" />
              DOCX
            </Button>
          </Tooltip>
          <Tooltip content="Edit report">
            <Link href={`/dashboard/reports/${id}/edit`}>
              <Button variant="secondary">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Delete report">
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </Tooltip>
        </div>

        {/* Mobile actions — dropdown */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportDocx}>
                <FileDown className="h-4 w-4" />
                Export DOCX
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/reports/${id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => setShowDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Section I: Identifying Data */}
      <Card>
        <CardHeader>
          <CardTitle>I. Identifying Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {formatFullName(
                  report.identifyingData.lastName,
                  report.identifyingData.firstName,
                  report.identifyingData.middleName
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alias</p>
              <p className="font-medium">{report.identifyingData.alias || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">True Name</p>
              <p className="font-medium">{report.identifyingData.trueName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sex</p>
              <p className="font-medium">{report.identifyingData.sex}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Birthday</p>
              <p className="font-medium">{formatDateDisplay(report.identifyingData.birthday)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{report.identifyingData.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Birthplace</p>
              <p className="font-medium">{report.identifyingData.birthplace || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nationality</p>
              <p className="font-medium">{report.identifyingData.nationality || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Religion</p>
              <p className="font-medium">{report.identifyingData.religion || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Civil Status</p>
              <p className="font-medium">{report.identifyingData.civilStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Education</p>
              <p className="font-medium">{report.identifyingData.educationalAttainment || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupation</p>
              <p className="font-medium">{report.identifyingData.occupation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Spouse Name</p>
              <p className="font-medium">{report.identifyingData.spouseName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Identifying Marks</p>
              <p className="font-medium">{report.identifyingData.identifyingMarks || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500">Present Address</p>
              <p className="font-medium">{report.identifyingData.presentAddress || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500">Permanent Address</p>
              <p className="font-medium">{report.identifyingData.permanentAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Letter Judge</p>
              <p className="font-medium">{report.identifyingData.letterJudge || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Letter Court</p>
              <p className="font-medium">{report.identifyingData.letterCourt || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Letter Position</p>
              <p className="font-medium">{report.identifyingData.letterPosition || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Investigation Docket Number</p>
              <p className="font-medium">{report.identifyingData.investigationDocketNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Criminal Case Number</p>
              <p className="font-medium">{report.identifyingData.criminalCaseNumber || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500">Letter Address</p>
              <p className="font-medium whitespace-pre-wrap">{report.identifyingData.letterAddress || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section II: Criminal History */}
      <Card>
        <CardHeader>
          <CardTitle>II. Criminal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-600">A. Present Offense</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Charged with</p>
                <p className="font-medium">
                  {report.criminalHistory.presentOffense.chargedWith || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Charged</p>
                <p className="font-medium">
                  {report.criminalHistory.presentOffense.chargedDate
                    ? formatDateDisplay(report.criminalHistory.presentOffense.chargedDate)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Convicted of</p>
                <p className="font-medium">
                  {report.criminalHistory.presentOffense.convictedOf || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Convicted</p>
                <p className="font-medium">
                  {report.criminalHistory.presentOffense.convictedDate
                    ? formatDateDisplay(report.criminalHistory.presentOffense.convictedDate)
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sentence</p>
              <p className="font-medium">
                {report.criminalHistory.presentOffense.sentence || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custodial Status</p>
              <p className="font-medium">
                {report.criminalHistory.custodialStatus}
                {report.criminalHistory.custodialStatus === 'ROR' && report.criminalHistory.rorCustodian
                  ? ` – Custodian: ${report.criminalHistory.rorCustodian}`
                  : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{report.criminalHistory.address || 'N/A'}</p>
            </div>

            <h4 className="font-semibold text-sm text-gray-600 pt-2">B. Prior and Pending Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Agency</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Criminal Case No.</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Offense</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Date Charged</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Decision/Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-medium">NBI</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.nbi.criminalCaseNo || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.nbi.offense || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.nbi.dateCharged ? formatDateDisplay(report.criminalHistory.priorRecords.nbi.dateCharged) : '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.nbi.decisionStatus}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-medium">CMRD/CMRU</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.cmrd.criminalCaseNo || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.cmrd.offense || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.cmrd.dateCharged ? formatDateDisplay(report.criminalHistory.priorRecords.cmrd.dateCharged) : '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.cmrd.decisionStatus}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-medium">Others</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.others.criminalCaseNo || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.others.offense || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.others.dateCharged ? formatDateDisplay(report.criminalHistory.priorRecords.others.dateCharged) : '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{report.criminalHistory.priorRecords.others.decisionStatus}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section III: Socio-Economic Background */}
      <Card>
        <CardHeader>
          <CardTitle>III. Socio-Economic Background</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">A. Family Economic Status</p>
              <p className="font-medium">{report.socioEconomicBackground.familyEconomicStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">B. Family Relationship</p>
              <p className="font-medium">{report.socioEconomicBackground.familyRelationship}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">C. Family Reputation</p>
              <p className="font-medium">{report.socioEconomicBackground.familyReputation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">D. Family Support</p>
              <p className="font-medium">{report.socioEconomicBackground.familySupport}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E. Community Acceptability</p>
              <p className="font-medium">{report.socioEconomicBackground.communityAcceptability}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">F. Overall Well-Being</p>
              <p className="font-medium">{report.socioEconomicBackground.overallWellBeing}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section IV: Analysis and Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>IV. Analysis and Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Circumstances</p>
              <p className="font-medium whitespace-pre-wrap">
                {report.analysisEvaluation.circumstances || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs</p>
              <p className="font-medium whitespace-pre-wrap">
                {report.analysisEvaluation.needs || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Attitude</p>
              <p className="font-medium whitespace-pre-wrap">
                {report.analysisEvaluation.attitude || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recommendations</p>
              <p className="font-medium whitespace-pre-wrap">
                {report.analysisEvaluation.recommendations || 'N/A'}
              </p>
            </div>

            {/* Community Service Recommendation */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-sm text-gray-600 mb-3">Community Service Recommendation</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Hours Required</p>
                  <p className="font-medium">
                    {report.analysisEvaluation.communityServiceHours
                      ? `${report.analysisEvaluation.communityServiceHours} hours`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type of Community Service</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {report.analysisEvaluation.communityServiceType || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent onClose={() => setShowDelete(false)}>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete report {report.reportNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
