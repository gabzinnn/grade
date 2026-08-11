interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className = "" }: SegmentedControlProps) {
  return (
    <div className={`inline-flex gap-1 bg-recess rounded-control p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`h-8 px-3 rounded-block text-body-sm transition-colors ${
            option.value === value ? "bg-raised text-ink shadow-resting" : "text-ink-2"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
