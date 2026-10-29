import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { fileMatchesAccept, formatFormFileSize } from '../utils/formOptions';

/** A file the control turned down, with the reason in words. */
export interface FileInputRejection {
  file: File;
  reason: 'type' | 'size' | 'count';
  message: string;
}

export interface FileInputProps {
  /** Chosen files (controlled). */
  value?: File[];
  /** Initial files when uncontrolled. Default none. */
  defaultValue?: File[];
  /** Called with the new list of chosen files. The control never uploads: the host does that. */
  onChange?: (files: File[]) => void;
  /** Called with the files turned down (wrong type, too large, too many). They are also listed under the box. */
  onReject?: (rejected: FileInputRejection[]) => void;
  /** Allowed types, as the native input reads them: ".pdf,image/*". Default: any. */
  accept?: string;
  /** Plain words for the allowed types, shown in the box, e.g. "PDF or image". */
  acceptText?: string;
  /** Allow several files. Default false (a new file replaces the old one). */
  multiple?: boolean;
  /** Largest file in bytes. */
  maxSizeBytes?: number;
  /** Most files when `multiple`. */
  maxFiles?: number;
  /** Button text. Default "Choose file" or "Choose files". */
  buttonText?: string;
  /** Text in the drop area. Default "or drop it here" / "or drop them here". */
  dropText?: string;
  disabled?: boolean;
  required?: boolean;
  /** Native input name (for native form posts of the latest choice). */
  name?: string;
  /** Id of the choose button (FormField passes it so its label names the button). */
  id?: string;
  'aria-describedby'?: string;
  /** Names the choose button [suggested]: a field label's id and the button's own id, so it reads "Logo Choose file". */
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
  className?: string;
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/**
 * Choose files with a button or by dropping them on the area; lists the chosen files with their size and a remove
 * button, and says in words why a file was turned down. No upload logic [suggested].
 */
export function FileInput({
  value, defaultValue = [], onChange, onReject, accept, acceptText, multiple = false, maxSizeBytes, maxFiles, buttonText, dropText,
  disabled, required, name, id, className, ...aria
}: FileInputProps) {
  const buttonId = useId('cui-file-input', id);
  const hintId = `${buttonId}-hint`;
  const [files, setFiles] = useControllableState<File[]>(value, defaultValue, onChange);
  const [over, setOver] = React.useState(false);
  const [rejected, setRejected] = React.useState<FileInputRejection[]>([]);
  const [announcement, setAnnouncement] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const depth = React.useRef(0);

  const take = (incoming: File[]) => {
    const bad: FileInputRejection[] = [];
    let ok = incoming.filter((f) => {
      if (!fileMatchesAccept(f, accept)) {
        bad.push({ file: f, reason: 'type', message: `${f.name} is not an allowed type${acceptText ? ` (${acceptText})` : ''}.` });
        return false;
      }
      if (maxSizeBytes !== undefined && f.size > maxSizeBytes) {
        bad.push({ file: f, reason: 'size', message: `${f.name} is ${formatFormFileSize(f.size)}; the largest allowed is ${formatFormFileSize(maxSizeBytes)}.` });
        return false;
      }
      return true;
    });
    if (!multiple && ok.length > 1) {
      ok.slice(1).forEach((f) => bad.push({ file: f, reason: 'count', message: `${f.name} was not added: choose one file only.` }));
      ok = ok.slice(0, 1);
    }
    let next = multiple ? [...files, ...ok.filter((f) => !files.some((g) => sameFile(f, g)))] : ok.length ? ok : files;
    if (multiple && maxFiles !== undefined && next.length > maxFiles) {
      next.slice(maxFiles).forEach((f) => bad.push({ file: f, reason: 'count', message: `${f.name} was not added: up to ${maxFiles} files.` }));
      next = next.slice(0, maxFiles);
    }
    setRejected(bad);
    if (bad.length) onReject?.(bad);
    if (ok.length) setFiles(next);
    const added = ok.length ? `${ok.length} ${ok.length === 1 ? 'file' : 'files'} chosen.` : '';
    const refused = bad.length ? ` ${bad.length} not added.` : '';
    setAnnouncement(`${added}${refused}`.trim());
  };

  const remove = (f: File) => {
    setFiles(files.filter((g) => !sameFile(f, g)));
    setAnnouncement(`${f.name} removed.`);
    buttonRef.current?.focus();
  };

  const describedBy = [aria['aria-describedby'], hintId].filter(Boolean).join(' ');
  const invalid = aria['aria-invalid'] === true || aria['aria-invalid'] === 'true' || rejected.length > 0;
  const btnText = buttonText ?? (multiple ? 'Choose files' : 'Choose file');
  const zoneText = dropText ?? (multiple ? 'or drop them here' : 'or drop it here');

  return (
    <div className={cx('cui-file-input', disabled && 'cui-file-input--disabled', className)} data-cui-control="" data-multiline="">
      <div
        className={cx('cui-file-input__zone', over && 'cui-file-input__zone--over', invalid && 'cui-file-input__zone--invalid')}
        data-cui-box=""
        onDragEnter={(e) => {
          if (disabled) return;
          e.preventDefault();
          depth.current++;
          setOver(true);
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (!depth.current) setOver(false);
        }}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          depth.current = 0;
          setOver(false);
          take(Array.from(e.dataTransfer.files));
        }}
      >
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className="cui-button cui-file-input__button"
          disabled={disabled}
          aria-describedby={describedBy}
          aria-labelledby={aria['aria-labelledby']}
          aria-invalid={invalid || undefined}
          aria-required={required || aria['aria-required'] === true || aria['aria-required'] === 'true' || undefined}
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="plus" size={16} />
          {btnText}
        </button>
        <span id={hintId} className="cui-file-input__hint">
          {over ? 'Release to add' : zoneText}
          {acceptText || maxSizeBytes !== undefined ? (
            <span className="cui-file-input__limits">
              {[acceptText, maxSizeBytes !== undefined ? `up to ${formatFormFileSize(maxSizeBytes)}` : null].filter(Boolean).join(', ')}
            </span>
          ) : null}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="cui-visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          accept={accept}
          multiple={multiple}
          name={name}
          disabled={disabled}
          onChange={(e) => {
            take(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      </div>
      {files.length ? (
        <ul className="cui-file-input__list" aria-label="Chosen files">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`} className="cui-file-input__file">
              <span className="cui-file-input__name">{f.name}</span>
              <span className="cui-file-input__size">{formatFormFileSize(f.size)}</span>
              <button type="button" className="cui-button cui-button--quiet cui-button--sm cui-button--icon-only" aria-label={`Remove ${f.name}`} title={`Remove ${f.name}`} disabled={disabled} onClick={() => remove(f)}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {rejected.length ? (
        <ul className="cui-file-input__rejected">
          {rejected.map((r, i) => (
            <li key={i}><Icon name="error" size={16} /> {r.message}</li>
          ))}
        </ul>
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
