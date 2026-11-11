import { CloudUpload, Save, Trash2 } from 'lucide-preact';
import type {
  BackupDestinationRecord,
  RemoteBackupBrowserResponse,
  S3BackupAddressingStyle,
  S3BackupDestination,
  WebDavBackupDestination,
} from '@/lib/api/backup';
import { COMMON_TIME_ZONES, getDestinationTypeLabel } from '@/lib/backup-center';
import { RemoteBackupBrowser } from './RemoteBackupBrowser';
import { t } from '@/lib/i18n';
import { BackupIncludeAttachmentsField } from './BackupIncludeAttachmentsField';

const INTERVAL_HOUR_PRESETS = [1, 6, 12, 24];

interface BackupDestinationDetailProps {
  selectedDestination: BackupDestinationRecord | null;
  selectedDestinationIsSaved: boolean;
  canRunSelectedDestination: boolean;
  canBrowseSelectedDestination: boolean;
  disableWhileBusy: boolean;
  loadingSettings: boolean;
  savingSettings: boolean;
  runningRemoteBackup: boolean;
  availableTimeZones: string[];
  remoteBrowser: RemoteBackupBrowserResponse | null;
  remoteBrowserVisibleItems: RemoteBackupBrowserResponse['items'];
  remoteBrowserCurrentPage: number;
  remoteBrowserTotalPages: number;
  loadingRemoteBrowser: boolean;
  downloadingRemotePath: string;
  downloadingRemotePercent: number | null;
  restoringRemotePath: string;
  deletingRemotePath: string;
  onSaveSettings: () => void;
  onToggleSchedule: () => void;
  onRunRemoteBackup: () => void;
  onPromptDeleteDestination: () => void;
  onUpdateDestination: (mutator: (destination: BackupDestinationRecord) => BackupDestinationRecord) => void;
  onRefreshRemoteBrowser: () => void;
  onShowRemoteBrowserPath: (path: string) => void;
  onDownloadRemoteBackup: (path: string) => void;
  onRestoreRemoteBackup: (path: string) => void;
  onPromptDeleteRemoteBackup: (path: string) => void;
  onChangeRemoteBrowserPage: (page: number) => void;
}

export function BackupDestinationDetail(props: BackupDestinationDetailProps) {
  const timeZones = Array.from(new Set([
    ...COMMON_TIME_ZONES,
    ...props.availableTimeZones,
  ]));
  const selectedIntervalHours = props.selectedDestination?.schedule.intervalHours ?? 24;

  return (
    <section className="backup-detail-panel">
      <div className="section-head">
        <h3>{t('txt_backup_destination_detail_title')}</h3>
        {props.selectedDestination ? (
          <div className="actions">
            <button type="button" className="btn btn-primary small" disabled={props.loadingSettings || props.disableWhileBusy} onClick={props.onSaveSettings}>
              <Save size={14} className="btn-icon" />
              {props.savingSettings ? t('txt_backup_saving') : t('txt_backup_save_settings')}
            </button>
            <button type="button" className="btn btn-secondary small" disabled={props.loadingSettings || props.disableWhileBusy} onClick={props.onToggleSchedule}>
              {props.selectedDestination.schedule.enabled ? t('txt_backup_disable_action') : t('txt_backup_enable_action')}
            </button>
            <button type="button" className="btn btn-secondary small" disabled={props.disableWhileBusy || !props.canRunSelectedDestination} onClick={props.onRunRemoteBackup}>
              <CloudUpload size={14} className="btn-icon" />
              {props.runningRemoteBackup ? t('txt_backup_running_now') : t('txt_backup_run_manual')}
            </button>
            <button type="button" className="btn btn-danger small" disabled={props.loadingSettings || props.disableWhileBusy} onClick={props.onPromptDeleteDestination}>
              <Trash2 size={14} className="btn-icon" />
              {t('txt_backup_delete_destination')}
            </button>
          </div>
        ) : null}
      </div>

      {!props.selectedDestination ? (
        <div className="backup-browser-empty">{t('txt_backup_select_destination')}</div>
      ) : (
        <>
          <div className="backup-name-row">
            <label className="field backup-name-field">
              <span>{t('txt_backup_destination_name')}</span>
              <input
                className="input"
                value={props.selectedDestination.name}
                disabled={props.loadingSettings || props.disableWhileBusy}
                onInput={(event) => props.onUpdateDestination((destination) => ({ ...destination, name: (event.currentTarget as HTMLInputElement).value }))}
              />
            </label>
            <label className="field backup-type-field">
              <span>{t('txt_backup_type')}</span>
              <input className="input" value={getDestinationTypeLabel(props.selectedDestination.type)} disabled />
            </label>
          </div>

          <div className="field-grid backup-detail-schedule-grid">
            <label className="field">
              <span>{t('txt_backup_interval_hours')}</span>
              <div className="backup-interval-row">
                <div className="backup-inline-suffix-wrap">
                  <input
                    className="input backup-inline-suffix-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(selectedIntervalHours)}
                    disabled={props.loadingSettings || props.disableWhileBusy}
                    onInput={(event) => {
                      const raw = (event.currentTarget as HTMLInputElement).value.replace(/[^\d]/g, '');
                      const value = Math.min(99, Math.max(1, Number(raw || 1)));
                      props.onUpdateDestination((destination) => ({
                        ...destination,
                        schedule: {
                          ...destination.schedule,
                          intervalHours: value,
                        },
                      }));
                    }}
                  />
                  <span className="backup-inline-suffix">{t('txt_backup_interval_hours_suffix')}</span>
                </div>
                <div className="backup-interval-presets" aria-label={t('txt_backup_interval_hours_presets')}>
                  {INTERVAL_HOUR_PRESETS.map((preset) => {
                    const active = preset === selectedIntervalHours;
                    return (
                      <button
                        key={preset}
                        type="button"
                        className={`backup-interval-preset${active ? ' active' : ''}`}
                        disabled={props.loadingSettings || props.disableWhileBusy}
                        onClick={() => props.onUpdateDestination((destination) => ({
                          ...destination,
                          schedule: {
                            ...destination.schedule,
                            intervalHours: preset,
                          },
                        }))}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </label>
            <label className="field">
              <span>{t('txt_backup_start_time')}</span>
              <input
                className="input"
                type="time"
                step={300}
                value={props.selectedDestination.schedule.startTime || '03:00'}
                disabled={props.loadingSettings || props.disableWhileBusy}
                onInput={(event) => props.onUpdateDestination((destination) => ({
                  ...destination,
                  schedule: {
                    ...destination.schedule,
                    startTime: (event.currentTarget as HTMLInputElement).value || '03:00',
                  },
                }))}
              />
            </label>
            <label className="field">
              <span>{t('txt_backup_timezone')}</span>
              <select
                className="input"
                value={props.selectedDestination.schedule.timezone}
                disabled={props.loadingSettings || props.disableWhileBusy}
                onChange={(event) => props.onUpdateDestination((destination) => ({
                  ...destination,
                  schedule: {
                    ...destination.schedule,
                    timezone: (event.currentTarget as HTMLSelectElement).value,
                  },
                }))}
              >
                {timeZones.map((timezone) => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t('txt_backup_retention_count')}</span>
              <div className="backup-inline-suffix-wrap">
                <input
                  className="input backup-inline-suffix-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={props.selectedDestination.schedule.retentionCount === null ? '' : String(props.selectedDestination.schedule.retentionCount)}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder="30"
                  onInput={(event) => {
                    const nextValue = (event.currentTarget as HTMLInputElement).value.replace(/[^\d]/g, '').trim();
                    props.onUpdateDestination((destination) => ({
                      ...destination,
                      schedule: {
                        ...destination.schedule,
                        retentionCount: nextValue ? Number(nextValue) : null,
                      },
                    }));
                  }}
                />
                <span className="backup-inline-suffix">{t('txt_backup_retention_count_suffix')}</span>
              </div>
            </label>
          </div>

          <div className="backup-schedule-attachments-row">
            <BackupIncludeAttachmentsField
              checked={props.selectedDestination.includeAttachments}
              disabled={props.loadingSettings || props.disableWhileBusy}
              onChange={(checked) => props.onUpdateDestination((destination) => ({
                ...destination,
                includeAttachments: checked,
              }))}
            />
          </div>

          {props.selectedDestination.type === 'webdav' ? (
            <div className="field-grid">
              <label className="field field-span-2">
                <span>{t('txt_backup_webdav_url')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as WebDavBackupDestination).baseUrl}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder="https://dav.example.com/remote.php/dav/files/admin"
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as WebDavBackupDestination),
                      baseUrl: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_webdav_username')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as WebDavBackupDestination).username}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as WebDavBackupDestination),
                      username: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_webdav_password')}</span>
                <input
                  className="input"
                  type="password"
                  value={(props.selectedDestination.destination as WebDavBackupDestination).password}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as WebDavBackupDestination),
                      password: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field field-span-2">
                <span>{t('txt_backup_webdav_path')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as WebDavBackupDestination).remotePath}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder="vault"
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as WebDavBackupDestination),
                      remotePath: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
            </div>
          ) : null}

          {props.selectedDestination.type === 's3' ? (
            <div className="field-grid">
              <label className="field">
                <span>{t('txt_backup_s3_endpoint')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).endpoint}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder="https://s3.example.com"
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      endpoint: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_s3_addressing_style')}</span>
                <select
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).addressingStyle || 'path-style'}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onChange={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      addressingStyle: (event.currentTarget as HTMLSelectElement).value as S3BackupAddressingStyle,
                    },
                  }))}
                >
                  <option value="path-style">{t('txt_backup_s3_addressing_path_style')}</option>
                  <option value="virtual-hosted-style">{t('txt_backup_s3_addressing_virtual_hosted_style')}</option>
                </select>
              </label>
              <label className="field">
                <span>{t('txt_backup_s3_bucket')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).bucket}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      bucket: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_s3_region')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).region}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder="auto"
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      region: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_s3_access_key')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).accessKeyId}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      accessKeyId: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field">
                <span>{t('txt_backup_s3_secret_key')}</span>
                <input
                  className="input"
                  type="password"
                  value={(props.selectedDestination.destination as S3BackupDestination).secretAccessKey}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      secretAccessKey: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
              <label className="field field-span-2">
                <span>{t('txt_backup_s3_path')}</span>
                <input
                  className="input"
                  value={(props.selectedDestination.destination as S3BackupDestination).rootPath}
                  disabled={props.loadingSettings || props.disableWhileBusy}
                  placeholder=""
                  onInput={(event) => props.onUpdateDestination((destination) => ({
                    ...destination,
                    destination: {
                      ...(destination.destination as S3BackupDestination),
                      rootPath: (event.currentTarget as HTMLInputElement).value,
                    },
                  }))}
                />
              </label>
            </div>
          ) : null}

          <RemoteBackupBrowser
            canBrowse={props.canBrowseSelectedDestination}
            destinationIsSaved={props.selectedDestinationIsSaved}
            disableWhileBusy={props.disableWhileBusy}
            loadingRemoteBrowser={props.loadingRemoteBrowser}
            remoteBrowser={props.remoteBrowser}
            visibleItems={props.remoteBrowserVisibleItems}
            currentPage={props.remoteBrowserCurrentPage}
            totalPages={props.remoteBrowserTotalPages}
            downloadingRemotePath={props.downloadingRemotePath}
            downloadingRemotePercent={props.downloadingRemotePercent}
            restoringRemotePath={props.restoringRemotePath}
            deletingRemotePath={props.deletingRemotePath}
            onRefresh={props.onRefreshRemoteBrowser}
            onShowPath={props.onShowRemoteBrowserPath}
            onDownload={props.onDownloadRemoteBackup}
            onRestore={props.onRestoreRemoteBackup}
            onPromptDelete={props.onPromptDeleteRemoteBackup}
            onChangePage={props.onChangeRemoteBrowserPage}
          />
        </>
      )}
    </section>
  );
}
