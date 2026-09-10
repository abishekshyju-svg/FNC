import { ENUM_OPTIONS } from '../types';

interface EnumConversionPanelProps {
  enabled: boolean;
  onToggle: () => void;
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}

export function EnumConversionPanel({
  enabled,
  onToggle,
  selectedValue,
  onSelect,
}: EnumConversionPanelProps) {
  const handleRadioChange = (value: string) => {
    // Clicking the already-selected option deselects it
    onSelect(selectedValue === value ? null : value);
  };

  return (
    <div className="enum-panel" aria-label="Enum Conversion panel">
      {/* Header row: title + toggle */}
      <div className="enum-panel__header">
        <span className="enum-panel__title">Enum Conversion</span>
        <button
          className={`enum-toggle ${enabled ? 'enum-toggle--on' : 'enum-toggle--off'}`}
          onClick={onToggle}
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Enum Conversion ${enabled ? 'enabled' : 'disabled'}`}
        >
          <span className="enum-toggle__track">
            <span className="enum-toggle__thumb" />
          </span>
          <span className="enum-toggle__label">{enabled ? 'Enabled' : 'Disabled'}</span>
        </button>
      </div>

      {/* Options list — only visible when enabled */}
      {enabled && (
        <ul className="enum-list" role="radiogroup" aria-label="Enum conversion options">
          {ENUM_OPTIONS.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <li key={opt.value} className="enum-list__item">
                <label
                  className={`enum-option ${isSelected ? 'enum-option--selected' : ''}`}
                >
                  {/* Hidden native radio for accessibility */}
                  <input
                    type="radio"
                    name="enumConversion"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleRadioChange(opt.value)}
                    className="enum-option__radio"
                    aria-label={opt.label}
                  />
                  {/* Custom radio dot */}
                  <span className="enum-option__dot" aria-hidden="true" />
                  {/* Full enum string as the visible label */}
                  <span className="enum-option__text">{opt.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
