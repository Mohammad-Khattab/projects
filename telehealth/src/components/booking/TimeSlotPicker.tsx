'use client'

const UNAVAILABLE_SLOTS = new Set(['9:30', '11:00', '2:00', '4:00'])

const MORNING_SLOTS = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00']
const AFTERNOON_SLOTS = ['1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00']

interface TimeSlotPickerProps {
  lang: 'ar' | 'en'
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
}

function formatSlot(slot: string, lang: 'ar' | 'en') {
  const [hourStr, minStr] = slot.split(':')
  const hour = parseInt(hourStr)
  const min = minStr === '00' ? '00' : minStr
  const period = hour < 12 || hour === 12 ? (hour < 12 ? 'AM' : 'PM') : 'PM'
  const arPeriod = hour < 12 ? 'ص' : 'م'
  if (lang === 'ar') {
    return `${hour}:${min} ${arPeriod}`
  }
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${min} ${period}`
}

interface SlotSectionProps {
  label: string
  icon: string
  slots: string[]
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
  lang: 'ar' | 'en'
}

function SlotSection({ label, icon, slots, selectedSlot, onSelectSlot, lang }: SlotSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h4 className="text-sm font-semibold text-body">{label}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map(slot => {
          const unavailable = UNAVAILABLE_SLOTS.has(slot)
          const selected = selectedSlot === slot

          let cls = 'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 '
          if (selected) {
            cls += 'bg-primary text-white border-primary shadow-md shadow-primary/25 btn-depth-primary '
          } else if (unavailable) {
            cls += 'bg-surface text-border border-border cursor-not-allowed line-through '
          } else {
            cls += 'bg-white text-body border-border hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer '
          }

          return (
            <button
              key={slot}
              disabled={unavailable}
              onClick={() => !unavailable && onSelectSlot(slot)}
              className={cls}
              aria-label={formatSlot(slot, lang)}
              aria-pressed={selected}
            >
              {formatSlot(slot, lang)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function TimeSlotPicker({ lang, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-body text-sm">
          {lang === 'ar' ? 'اختر وقت الموعد' : 'Select Appointment Time'}
        </h3>
        {selectedSlot && (
          <span className="ms-auto text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-lg">
            {formatSlot(selectedSlot, lang)}
          </span>
        )}
      </div>

      <SlotSection
        label={lang === 'ar' ? 'الصباح (9:00 ص - 12:00 م)' : 'Morning (9:00 AM - 12:00 PM)'}
        icon="🌅"
        slots={MORNING_SLOTS}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
        lang={lang}
      />

      <SlotSection
        label={lang === 'ar' ? 'المساء (1:00 م - 5:00 م)' : 'Afternoon (1:00 PM - 5:00 PM)'}
        icon="🌇"
        slots={AFTERNOON_SLOTS}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
        lang={lang}
      />

      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-surface border border-border inline-block" />
        {lang === 'ar'
          ? 'المواعيد المشطوب عليها غير متاحة. جميع المواعيد بالتوقيت المحلي.'
          : 'Crossed-out slots are unavailable. All times are in local timezone.'}
      </p>
    </div>
  )
}
