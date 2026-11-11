import { Download, FileUp } from 'lucide-preact';
import { t } from '@/lib/i18n';
import { BackupIncludeAttachmentsField } from './BackupIncludeAttachmentsField';

interface BackupOperationsSidebarProps {
  disableWhileBusy: boolean;
  exporting: boolean;
  importing: boolean;
  exportIncludeAttachments: boolean;
  onExport: () => void;
  onImport: () => void;
  onExportIncludeAttachmentsChange: (checked: boolean) => void;
}

export function BackupOperationsSidebar(props: BackupOperationsSidebarProps) {
  return (
    <aside className="backup-operations-sidebar">
      <div className="section-head">
        <h3>{t('txt_backup_manual')}</h3>
      </div>
      <div className="backup-actions-stack">
        <button type="button" className="btn btn-primary" disabled={props.disableWhileBusy} onClick={props.onExport}>
          <Download size={14} className="btn-icon" />
          {props.exporting ? t('txt_backup_exporting') : t('txt_backup_export')}
        </button>
        <BackupIncludeAttachmentsField
          checked={props.exportIncludeAttachments}
          disabled={props.disableWhileBusy}
          showHelp={false}
          onChange={props.onExportIncludeAttachmentsChange}
        />
        <button type="button" className="btn btn-secondary" disabled={props.disableWhileBusy} onClick={props.onImport}>
          <FileUp size={14} className="btn-icon" />
          {props.importing ? t('txt_backup_restoring') : t('txt_backup_import')}
        </button>
      </div>
    </aside>
  );
}
