import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Loader2,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  TrendingUp,
  AlertTriangle,
  Calendar,
  X,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  body_html: string;
  body_text: string;
  email_type: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string;
  smtp_response: string;
  related_submission_id: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
}

interface Filters {
  status: string;
  emailType: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const EMAIL_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'contact_notification', label: 'Notification de contact' },
  { value: 'auto_response', label: 'Reponse automatique' },
  { value: 'test', label: 'Test' },
  { value: 'general', label: 'General' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'sent', label: 'Envoye' },
  { value: 'failed', label: 'Echoue' },
  { value: 'pending', label: 'En attente' },
];

const ITEMS_PER_PAGE = 20;

export default function EmailManagement() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    successRate: 0,
  });
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    emailType: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const loadStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('email_logs')
      .select('status');

    if (error) {
      console.error('Stats error:', error);
      return;
    }

    const total = data?.length || 0;
    const sent = data?.filter(e => e.status === 'sent').length || 0;
    const failed = data?.filter(e => e.status === 'failed').length || 0;
    const pending = data?.filter(e => e.status === 'pending').length || 0;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    setStats({ total, sent, failed, pending, successRate });
  }, []);

  const loadEmails = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('email_logs')
      .select('*', { count: 'exact' });

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.emailType !== 'all') {
      query = query.eq('email_type', filters.emailType);
    }

    if (filters.search) {
      query = query.or(
        `subject.ilike.%${filters.search}%,recipient_email.ilike.%${filters.search}%,body_text.ilike.%${filters.search}%`
      );
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', startOfDay(new Date(filters.dateFrom)).toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', endOfDay(new Date(filters.dateTo)).toISOString());
    }

    query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      toast.error('Erreur lors du chargement des emails');
      console.error('Load error:', error);
    } else {
      setEmails(data || []);
      setTotalCount(count || 0);
    }

    setLoading(false);
  }, [filters, currentPage]);

  useEffect(() => {
    loadEmails();
    loadStats();
  }, [loadEmails, loadStats]);

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(e => e.id));
    }
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMarkAsRead = async (ids: string[]) => {
    const { error } = await supabase
      .from('email_logs')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      toast.error('Erreur lors de la mise a jour');
    } else {
      toast.success('Marque comme lu');
      loadEmails();
    }
    setSelectedEmails([]);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Supprimer ${ids.length} email(s) ?`)) return;

    const { error } = await supabase
      .from('email_logs')
      .delete()
      .in('id', ids);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Email(s) supprime(s)');
      loadEmails();
      loadStats();
    }
    setSelectedEmails([]);
  };

  const handleResend = async (email: EmailLog) => {
    toast.info('Fonction de renvoi en cours de developpement');
  };

  const handleExport = () => {
    const csvRows = [
      ['Date', 'Destinataire', 'Sujet', 'Type', 'Statut', 'Erreur'].join(','),
      ...emails.map(e => [
        format(new Date(e.created_at), 'dd/MM/yyyy HH:mm'),
        e.recipient_email,
        `"${e.subject.replace(/"/g, '""')}"`,
        e.email_type,
        e.status,
        `"${(e.error_message || '').replace(/"/g, '""')}"`,
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emails-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV telecharge');
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      emailType: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Envoye</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Echoue</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      contact_notification: 'Contact',
      auto_response: 'Auto-reponse',
      test: 'Test',
      general: 'General',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Emails</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { loadEmails(); loadStats(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total envoyes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.total}</span>
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reussis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">{stats.sent}</span>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Echoues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux de succes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{stats.successRate}%</span>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par sujet, destinataire..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                {(filters.status !== 'all' || filters.emailType !== 'all' || filters.dateFrom || filters.dateTo) && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Reinitialiser
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => {
                      setFilters(prev => ({ ...prev, status: v }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type d'email</Label>
                  <Select
                    value={filters.emailType}
                    onValueChange={(v) => {
                      setFilters(prev => ({ ...prev, emailType: v }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date debut</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, dateTo: e.target.value }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {selectedEmails.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 border-b">
                <span className="text-sm text-blue-700">{selectedEmails.length} selectionne(s)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedEmails)}
                  className="text-blue-700"
                >
                  Marquer comme lu
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selectedEmails)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mb-4 text-gray-300" />
                <p>Aucun email trouve</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEmails.length === emails.length && emails.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'created_at',
                          sortOrder: prev.sortBy === 'created_at' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                      >
                        Date
                      </TableHead>
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow
                        key={email.id}
                        className={`cursor-pointer hover:bg-gray-50 ${!email.is_read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedEmails.includes(email.id)}
                            onCheckedChange={() => handleSelectEmail(email.id)}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(email.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{email.recipient_name || '-'}</p>
                            <p className="text-sm text-gray-500">{email.recipient_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{email.subject}</p>
                        </TableCell>
                        <TableCell>{getTypeBadge(email.email_type)}</TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedEmail(email)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir details
                              </DropdownMenuItem>
                              {email.status === 'failed' && (
                                <DropdownMenuItem onClick={() => handleResend(email)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Renvoyer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete([email.id])}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages} ({totalCount} emails)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Precedent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Details de l'email</DialogTitle>
            </DialogHeader>
            {selectedEmail && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-gray-500">Destinataire</Label>
                    <p className="font-medium">{selectedEmail.recipient_name || '-'}</p>
                    <p className="text-sm text-gray-600">{selectedEmail.recipient_email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Expediteur</Label>
                    <p className="font-medium">{selectedEmail.sender_name || '-'}</p>
                    <p className="text-sm text-gray-600">{selectedEmail.sender_email}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-gray-500">Date d'envoi</Label>
                    <p className="font-medium">
                      {format(new Date(selectedEmail.created_at), 'dd MMMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedEmail.email_type)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Statut</Label>
                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Sujet</Label>
                  <p className="font-medium">{selectedEmail.subject}</p>
                </div>

                {selectedEmail.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <Label className="text-red-700">Message d'erreur</Label>
                    <p className="text-sm text-red-600 mt-1">{selectedEmail.error_message}</p>
                  </div>
                )}

                <div>
                  <Label className="text-gray-500">Contenu</Label>
                  {selectedEmail.body_html ? (
                    <div
                      className="mt-2 border rounded-lg p-4 bg-gray-50 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                    />
                  ) : (
                    <pre className="mt-2 border rounded-lg p-4 bg-gray-50 text-sm whitespace-pre-wrap">
                      {selectedEmail.body_text}
                    </pre>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {selectedEmail.status === 'failed' && (
                    <Button onClick={() => handleResend(selectedEmail)}>
                      <Send className="h-4 w-4 mr-2" />
                      Renvoyer
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete([selectedEmail.id]);
                      setSelectedEmail(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
