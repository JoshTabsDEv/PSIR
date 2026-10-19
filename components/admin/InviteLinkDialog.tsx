'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface InviteLinkInfo {
  name: string;
  username: string;
  inviteLink: string;
  expiresAt: string;
}

interface Props {
  info: InviteLinkInfo | null;
  onClose: () => void;
}

export function InviteLinkDialog({ info, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.inviteLink);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed. Select the link and copy manually.');
    }
  }

  return (
    <Dialog open={Boolean(info)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set-password link for {info?.name}</DialogTitle>
          <DialogDescription>
            Send this to <strong>{info?.username}</strong>. It works once and expires on{' '}
            {info ? new Date(info.expiresAt).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : ''}.
            It is shown only now; generate a new one if lost.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input readOnly value={info?.inviteLink ?? ''} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
