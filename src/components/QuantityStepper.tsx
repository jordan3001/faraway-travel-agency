import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
}

export default function QuantityStepper({ value, onChange, min = 0, max = 10, label = 'Quantité' }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuer">
        <Minus />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Augmenter">
        <Plus />
      </button>
    </div>
  )
}
