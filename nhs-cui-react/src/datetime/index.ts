import './DateDisplay/DateDisplay.css';
import './TimeDisplay/TimeDisplay.css';
import './DateTimeDisplay/DateTimeDisplay.css';
import './DurationDisplay/DurationDisplay.css';
import './DateInput/DateInput.css';
import './CalendarPicker/CalendarPicker.css';
import './DisambiguationPrompt/DisambiguationPrompt.css';
import './TimeInput/TimeInput.css';
import './DurationInput/DurationInput.css';
import './TruncatedText/TruncatedText.css';
import './Abbreviation/Abbreviation.css';
import './AbbreviationCheckedTextArea/AbbreviationCheckedTextArea.css';
import './AlertSymbol/AlertSymbol.css';
import './ShortcutProvider/ShortcutProvider.css';
import './KeyboardShortcutList/KeyboardShortcutList.css';
import './TimeRangeDisplay/TimeRangeDisplay.css';
import './ClinicalTermList/ClinicalTermList.css';
import './IconButton/IconButton.css';
import './IconToolbar/IconToolbar.css';
import './EncodableTextEditor/EncodableTextEditor.css';

// Display
export { DateDisplay } from './DateDisplay/DateDisplay';
export type { DateDisplayProps } from './DateDisplay/DateDisplay';
export { TimeDisplay } from './TimeDisplay/TimeDisplay';
export type { TimeDisplayProps } from './TimeDisplay/TimeDisplay';
export { DateTimeDisplay } from './DateTimeDisplay/DateTimeDisplay';
export type { DateTimeDisplayProps } from './DateTimeDisplay/DateTimeDisplay';
export { DurationDisplay } from './DurationDisplay/DurationDisplay';
export type { DurationDisplayProps } from './DurationDisplay/DurationDisplay';
export { TimeRangeDisplay } from './TimeRangeDisplay/TimeRangeDisplay';
export type { TimeRangeDisplayProps } from './TimeRangeDisplay/TimeRangeDisplay';

// Input
export { DateInput } from './DateInput/DateInput';
export type { DateInputProps } from './DateInput/DateInput';
export { CalendarPicker, CALENDAR_HEADER_INSTRUCTIONS } from './CalendarPicker/CalendarPicker';
export type { CalendarPickerProps } from './CalendarPicker/CalendarPicker';
export { DisambiguationPrompt } from './DisambiguationPrompt/DisambiguationPrompt';
export type { DisambiguationPromptProps, DisambiguationSuggestion } from './DisambiguationPrompt/DisambiguationPrompt';
export { TimeInput } from './TimeInput/TimeInput';
export type { TimeInputProps, TimeInputEntry } from './TimeInput/TimeInput';
export { DurationInput, DURATION_INSTRUCTIONS } from './DurationInput/DurationInput';
export type { DurationInputProps } from './DurationInput/DurationInput';

// Display standards
export { TruncatedText } from './TruncatedText/TruncatedText';
export type { TruncatedTextProps } from './TruncatedText/TruncatedText';
export { Abbreviation } from './Abbreviation/Abbreviation';
export type { AbbreviationProps } from './Abbreviation/Abbreviation';
export { AbbreviationCheckedTextArea } from './AbbreviationCheckedTextArea/AbbreviationCheckedTextArea';
export type { AbbreviationCheckedTextAreaProps } from './AbbreviationCheckedTextArea/AbbreviationCheckedTextArea';
export { AlertSymbol } from './AlertSymbol/AlertSymbol';
export type { AlertSymbolProps, AlertSymbolKind } from './AlertSymbol/AlertSymbol';
export { ShortcutProvider, useShortcut, useShortcutRegistry } from './ShortcutProvider/ShortcutProvider';
export type { ShortcutProviderProps, ShortcutBinding, RegisteredShortcut } from './ShortcutProvider/ShortcutProvider';
export { KeyboardShortcutList } from './KeyboardShortcutList/KeyboardShortcutList';
export type { KeyboardShortcutListProps, KeyboardShortcutListItem } from './KeyboardShortcutList/KeyboardShortcutList';
export { ClinicalTermList } from './ClinicalTermList/ClinicalTermList';
export type { ClinicalTermListProps, ClinicalTerm } from './ClinicalTermList/ClinicalTermList';
export { IconButton } from './IconButton/IconButton';
export type { IconButtonProps, IconButtonVariant, IconMeaning } from './IconButton/IconButton';
export { IconToolbar } from './IconToolbar/IconToolbar';
export type { IconToolbarProps, IconToolbarGroup, IconToolbarItem } from './IconToolbar/IconToolbar';
export { EncodableTextEditor } from './EncodableTextEditor/EncodableTextEditor';
export type { EncodableTextEditorProps } from './EncodableTextEditor/EncodableTextEditor';

// Utilities
export { parseDateInput, formatDateInputValue, dateInputValueToIso, addToDate as addToClinicalDate } from './utils/dateInput';
export type { DateInputValue, DateParseOptions, DateParseResult } from './utils/dateInput';
export { parseTimeInput, spinTime, formatTimeInputValue } from './utils/timeInput';
export type { TimeInputValue, TimeSegment, TimeParseOptions, TimeParseResult } from './utils/timeInput';
export {
  formatClinicalDuration,
  describeClinicalDuration,
  parseDurationInput,
  addClinicalDuration,
  DURATION_UNIT_ORDER,
  DEFAULT_DURATION_SYMBOLS,
  DEFAULT_DURATION_ALIASES,
} from './utils/duration';
export type {
  ClinicalDurationParts,
  DurationUnitKey,
  DurationUnitSymbols,
  ClinicalDurationFormatOptions,
  DurationParseOptions,
  DurationParseResult,
} from './utils/duration';
export { spansGmtBstChange, findGmtBstTransitions, getUkClockChanges, describeGmtBstSpan } from './utils/gmtBst';
export type { UkClockChanges, GmtBstTransition } from './utils/gmtBst';
export {
  spansDaylightSavingChange,
  describeDaylightSavingSpan,
  findDaylightSavingTransitions,
  getZonedParts,
  getTimeZoneOffset,
  getTimeZoneAbbreviation,
  getTimeZoneName,
  formatUtcOffset,
  formatZoned,
  needsZoneLabel,
  zonedToday,
  zonedWallTimeToInstants,
  isInRepeatedHour,
  checkZonedWallTime,
  isValidTimeZone,
} from './utils/timeZones';
export type { ZonedDateTimeParts, DaylightSavingTransition, WallTimeIssue, ZonedDisplay } from './utils/timeZones';
export { TIME_ZONE_NAMES, REGION_TIME_ZONES } from './utils/regions/timeZones';
export type { ZoneNaming, ZoneOffsetName } from './utils/regions/timeZones';
export { DAY_ABBREVIATIONS, NUMERIC_DATE_ORDER, LONG_DATE_STYLES, formatLongDateInStyle } from './utils/regions/dates';
export type { LongDateStyle } from './utils/regions/dates';
export { AU_DANGEROUS_ABBREVIATIONS, NZ_DANGEROUS_ABBREVIATIONS } from './utils/regions/abbreviations';
export {
  diffTextEdit,
  editTouchesConfirmed,
  adjustMatchesForEdit,
  segmentEncodableText,
  matchAtCaret,
  marqueeDragCandidates,
  nearestMarqueeOffset,
} from './utils/encodable';
export type { EncodableMatch, TextEdit, EncodableSegment, EncodableExpressionRun, MarqueeEdge } from './utils/encodable';
export {
  isAcronymWellFormed,
  formatAbbreviation,
  findDangerousAbbreviations,
  findUnexpandedAbbreviations,
  applyAbbreviationSuggestion,
  getDangerousAbbreviations,
  DANGEROUS_ABBREVIATIONS,
} from './utils/abbreviations';
export type { DangerousAbbreviation, AbbreviationFinding, FindDangerousOptions } from './utils/abbreviations';
export { truncateEnd, truncateMiddle, findIdenticalTruncations, truncationAtoms } from './utils/truncation';
export type { TextMeasure, TruncationResult } from './utils/truncation';
export {
  normaliseKeys,
  normaliseKeyEvent,
  countKeyPresses,
  detectShortcutConflicts,
  STANDARD_WINDOWS_SHORTCUTS,
} from './utils/shortcuts';
export type {
  StandardShortcut,
  ShortcutDefinition,
  ShortcutConflict,
  ShortcutConflictType,
  KeyEventLike,
} from './utils/shortcuts';
