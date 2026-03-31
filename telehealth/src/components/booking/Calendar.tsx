'use client'
import { useState } from 'react'

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Calendar week starts Sunday
// availableDays uses 3-letter abbreviations: Sun Mon Tue Wed Thu Fri Sat
const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const AR_DAY_HEADERS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمس', 'جمع', 'سبت']
const EN_DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarProps {
  lang: 'ar' | 'en'
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  availableDays: string[]
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export default function Calendar({ lang, selectedDate, onSelectDate, availableDays }: CalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // First day of month (0=Sun)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  // Days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Prevent navigating to past months
  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null)

  const monthLabel = lang === 'ar' ? AR_MONTHS[viewMonth] : EN_MONTHS[viewMonth]
  const dayHeaders = lang === 'ar' ? AR_DAY_HEADERS : EN_DAY_HEADERS

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary to-primary-dark text-white">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-base">
          {monthLabel} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayHeaders.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`blank-${idx}`} />
            }

            const date = new Date(viewYear, viewMonth, day)
            date.setHours(0, 0, 0, 0)

            const dayAbbr = DAY_ABBRS[date.getDay()]
            const isPast = date < today
            const isAvailable = !isPast && availableDays.includes(dayAbbr)
            const isToday = isSameDay(date, today)
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

            let cellClass = 'relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl text-sm font-medium transition-all duration-150 '

            if (isSelected) {
              cellClass += 'bg-primary text-white shadow-md shadow-primary/30 cursor-pointer '
            } else if (isPast) {
              cellClass += 'text-border cursor-not-allowed '
            } else if (isAvailable) {
              cellClass += 'bg-primary/8 text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary cursor-pointer hover:shadow-sm '
            } else {
              cellClass += 'text-muted cursor-not-allowed '
            }

            return (
              <div key={day} className="flex justify-center py-0.5">
                <button
                  disabled={!isAvailable || isSelected}
                  onClick={() => isAvailable && onSelectDate(date)}
                  className={cellClass}
                  aria-label={`${day} ${monthLabel} ${viewYear}`}
                  aria-pressed={isSelected}
                >
                  {day}
                  {/* Today indicator */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 flex items-center gap-4 text-xs text-muted flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-primary/8 border border-primary/30" />
          <span>{lang === 'ar' ? 'متاح' : 'Available'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-primary" />
          <span>{lang === 'ar' ? 'محدد' : 'Selected'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-surface border border-border" />
          <span>{lang === 'ar' ? 'غير متاح' : 'Unavailable'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-surface border border-border flex items-end justify-center pb-0.5">
            <span className="w-1 h-1 rounded-full bg-primary block" />
          </div>
          <span>{lang === 'ar' ? 'اليوم' : 'Today'}</span>
        </div>
      </div>
    </div>
  )
}

