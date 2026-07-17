import React, { useState } from 'react';

export interface TimeSlot {
  day_of_week: number; // 0=Sunday, 1=Monday... 6=Saturday
  start_time: string; // '09:00:00'
  end_time: string;
  type?: 'mentor' | 'user' | 'overlap' | 'available';
}

interface TimeGridProps {
  slots: TimeSlot[];
  editable?: boolean;
  onSlotsChange?: (newSlots: TimeSlot[]) => void;
  startHour?: number; // default 9 (09:00)
  endHour?: number;   // default 15 (15:00)
  selectedSlot?: TimeSlot | null;
  onSlotSelect?: (slot: TimeSlot) => void;
  displayDays?: number[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get dates for the next week's given days
function getDatesForDays(daysToDisplay: number[], weekOffset: number = 0) {
  const today = new Date();
  const currentWeekSunday = new Date(today);
  currentWeekSunday.setHours(0, 0, 0, 0);
  currentWeekSunday.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  return daysToDisplay.map(targetDay => {
    const date = new Date(currentWeekSunday);
    date.setDate(currentWeekSunday.getDate() + targetDay);
    return {
      dayOfWeek: targetDay,
      dayName: DAYS[targetDay],
      dateNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date
    };
  });
}

export function TimeGrid({ 
  slots, 
  editable = false, 
  onSlotsChange, 
  startHour = 9, 
  endHour = 16,
  selectedSlot,
  onSlotSelect,
  displayDays = [1, 2, 3, 4, 5] // Default to Mon-Fri
}: TimeGridProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  // endHour is exclusive: hours from startHour up to (but not including) endHour
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const dates = getDatesForDays(displayDays, weekOffset);

  const toggleSlot = (day: number, hour: number) => {
    if (!editable || !onSlotsChange) return;

    const start_time = `${hour.toString().padStart(2, '0')}:00:00`;
    const end_time = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
    
    const existingIndex = slots.findIndex(s => s.day_of_week === day && s.start_time === start_time);
    
    if (existingIndex >= 0) {
      const newSlots = [...slots];
      newSlots.splice(existingIndex, 1);
      onSlotsChange(newSlots);
    } else {
      onSlotsChange([...slots, { day_of_week: day, start_time, end_time, type: 'available' }]);
    }
  };

  const getSlot = (day: number, hour: number) => {
    const start_time = `${hour.toString().padStart(2, '0')}:00:00`;
    return slots.find(s => s.day_of_week === day && s.start_time.startsWith(start_time.substring(0, 2)));
  };

  const now = new Date();

  return (
    <div className="border border-border-subtle rounded-sm overflow-hidden bg-white">
      {/* Week Navigation */}
      <div className="flex justify-between items-center p-3 border-b border-border-subtle bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase">
            {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} Weeks`}
          </h3>
          {editable && (
            <span className="text-[10px] font-medium text-text-muted bg-surface-container-low px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}></span>
              Past time is read-only
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setWeekOffset(w => w - 1)}
            disabled={weekOffset <= 0}
            title={weekOffset <= 0 ? 'Cannot navigate to past weeks' : 'Previous week'}
            className="w-6 h-6 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >&lt;</button>
          <button 
            onClick={() => setWeekOffset(0)}
            className="px-2 h-6 rounded border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-muted hover:bg-surface-container-low transition-colors uppercase"
          >Today</button>
          <button 
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-6 h-6 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface-container-low transition-colors"
          >&gt;</button>
        </div>
      </div>

      {/* Header */}
      <div 
        className="grid border-b border-border-subtle" 
        style={{ gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(0, 1fr))` }}
      >
        <div className="p-3 text-center text-xs font-medium text-text-muted border-r border-border-subtle"></div>
        {dates.map((d, idx) => (
          <div key={d.dayOfWeek} className={`p-3 flex flex-col items-center justify-center ${idx < dates.length - 1 ? 'border-r border-border-subtle' : ''}`}>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">{d.dayName}</span>
            <div className="flex items-baseline gap-1">
               <span className="text-lg font-bold text-primary">{d.dateNumber}</span>
               <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{d.monthName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="bg-white relative">
        {hours.map(hour => (
          <div 
            key={hour} 
            className="grid border-b border-border-subtle last:border-b-0 min-h-[60px]"
            style={{ gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(0, 1fr))` }}
          >
            {/* Time Label */}
            <div className="p-2 border-r border-border-subtle flex items-start justify-center bg-white pt-4">
              <span className="text-[10px] font-bold text-text-muted tracking-widest">{hour.toString().padStart(2, '0')}:00</span>
            </div>
            
            {/* Day Cells */}
            {dates.map((d, idx) => {
              const day = d.dayOfWeek;
              const slot = getSlot(day, hour);
              
              // Compute the exact datetime this cell represents
              const slotTime = new Date(d.fullDate);
              slotTime.setHours(hour, 0, 0, 0);
              // A cell is in the past if its start datetime has already passed
              const isPast = slotTime <= now;
              // A cell is only editable if it is editable-mode AND its exact datetime is in the future
              const isCellEditable = editable && !isPast;
              // Dim past cells when in view-only mode (non-editable), or always dim past cells
              const shouldDim = isPast;
              
              let cellClass = `p-1 relative transition-colors ${idx < dates.length - 1 ? 'border-r border-border-subtle' : ''}`;
              
              if (isPast) {
                // Past cells: grey striped pattern, no interaction
                cellClass += ' bg-gray-50 cursor-not-allowed';
              } else if (isCellEditable) {
                cellClass += ' bg-white cursor-pointer hover:bg-surface-container-low';
              } else {
                cellClass += ' bg-white';
              }
              
              let content = null;
              
              if (isPast) {
                // Show subtle hatching overlay on past cells
                content = (
                  <div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px)'
                    }}
                  />
                );
              }

              if (slot) {
                if (slot.type === 'overlap') {
                   const isSelected = selectedSlot?.day_of_week === day && selectedSlot?.start_time === slot.start_time;
                   if (isSelected) {
                     content = (
                       <div className={`absolute inset-1 bg-primary text-white flex flex-col justify-center items-center rounded-sm z-10 shadow-md ${shouldDim ? 'opacity-40' : ''}`}>
                         <span className="text-[10px] font-bold tracking-widest uppercase">Selected</span>
                       </div>
                     );
                   } else {
                     content = (
                       <div 
                         className={`absolute inset-1 bg-blue-50 text-primary flex flex-col justify-center items-center rounded-sm border-2 border-transparent z-10 transition-colors group
                           ${isPast
                             ? 'opacity-40 cursor-not-allowed pointer-events-none'
                             : 'hover:bg-white hover:border-primary cursor-pointer'
                           }`}
                         onClick={() => { if (!isPast) onSlotSelect?.(slot); }}
                       >
                         {!isPast && (
                           <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                         )}
                       </div>
                     );
                   }
                } else if (slot.type === 'mentor' || slot.type === 'user' || slot.type === 'available') {
                   content = (
                     <div className={`absolute inset-0 p-2 rounded-sm shadow-sm z-10 flex flex-col justify-start items-start m-1
                       ${isPast
                         ? 'bg-gray-400 text-white opacity-40'
                         : 'bg-primary text-white'
                       }`}>
                       <span className="text-[9px] font-bold tracking-widest uppercase">Available</span>
                       <span className="text-[10px] font-bold">{hour.toString().padStart(2, '0')}:00 - {hour + 1}:00</span>
                     </div>
                   );
                }
              }

              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={cellClass}
                  onClick={() => { if (isCellEditable) toggleSlot(day, hour); }}
                  title={isPast ? 'Past slots cannot be edited' : undefined}
                >
                  <div className="w-full h-full border border-transparent rounded-sm group relative min-h-[58px]">
                     {content}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
