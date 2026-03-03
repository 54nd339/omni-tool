'use client';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSshKeygen } from '@/hooks/use-ssh-keygen';

export function SshKeygenTool() {
  const {
    algorithm,
    comment,
    generating,
    handleDownload,
    handleGenerate,
    privateKey,
    publicKey,
    setParams,
  } = useSshKeygen();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Algorithm</p>
          <ToggleGroup
            type="single"
            value={algorithm}
            onValueChange={(value) => value && setParams({ algorithm: value })}
          >
            <ToggleGroupItem value="ed25519">Ed25519</ToggleGroupItem>
            <ToggleGroupItem value="rsa-2048">RSA 2048</ToggleGroupItem>
            <ToggleGroupItem value="rsa-4096">RSA 4096</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Comment</p>
          <Input
            value={comment}
            onChange={(event) => setParams({ comment: event.target.value })}
            placeholder="user@hostname"
          />
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Key Pair'}
        </Button>
      </div>

      {publicKey && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Public Key (.pub)</p>
              <div className="flex gap-2">
                <CopyButton value={publicKey} size="sm" />
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDownload(publicKey, 'id_' + algorithm.replace('-', '') + '.pub')}>
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={publicKey} readOnly rows={3} className="font-mono text-xs resize-none bg-muted/50 break-all" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Private Key</p>
              <div className="flex gap-2">
                <CopyButton value={privateKey} size="sm" />
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDownload(privateKey, 'id_' + algorithm.replace('-', ''))}>
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={privateKey} readOnly rows={10} className="font-mono text-xs resize-none bg-muted/50" />
          </div>
        </div>
      )}
    </div>
  );
}
