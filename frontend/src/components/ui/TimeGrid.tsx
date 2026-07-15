import React from 'react';

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
function getDatesForDays(daysToDisplay: number[]) {
  const today = new Date();
  const currentDay = today.getDay();
  
  return daysToDisplay.map(targetDay => {
    const date = new Date(today);
    // Find the next occurrence of targetDay
    let diff = targetDay - currentDay;
    if (diff <= 0) {
      diff += 7; // Ensure it's in the future
    }
    date.setDate(today.getDate() + diff);
    return {
      dayOfWeek: targetDay,
      dayName: DAYS[targetDay],
      dateNumber: date.getDate()
    };
  });
}

export function TimeGrid({ 
  slots, 
  editable = false, 
  onSlotsChange, 
  startHour = 9, 
  endHour = 15,
  selectedSlot,
  onSlotSelect,
  displayDays = [1, 2, 3, 4, 5] // Default to Mon-Fri
}: TimeGridProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const dates = getDatesForDays(displayDays);

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

  return (
    <div className="border border-border-subtle rounded-sm overflow-hidden bg-white">
      {/* Header */}
      <div 
        className="grid border-b border-border-subtle" 
        style={{ gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(0, 1fr))` }}
      >
        <div className="p-3 text-center text-xs font-medium text-text-muted border-r border-border-subtle"></div>
        {dates.map((d, idx) => (
          <div key={d.dayOfWeek} className={`p-4 flex flex-col items-center justify-center ${idx < dates.length - 1 ? 'border-r border-border-subtle' : ''}`}>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{d.dayName}</span>
            <span className="text-xl font-bold text-primary">{d.dateNumber}</span>
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
              let cellClass = `p-1 bg-white relative transition-colors ${idx < dates.length - 1 ? 'border-r border-border-subtle' : ''}`;
              
              if (editable) {
                cellClass += " cursor-pointer hover:bg-surface-container-low";
              }
              
              let content = null;
              
              if (slot) {
                if (slot.type === 'mentor' || (editable && window.location.pathname.includes('mentor'))) {
                   content = (
                     <div className="absolute inset-0 bg-primary text-white p-2 rounded-sm shadow-sm z-10 flex flex-col justify-start items-start m-1">
                       <span className="text-[9px] font-bold tracking-widest uppercase">Available</span>
                       <span className="text-[10px] font-bold">{hour.toString().padStart(2, '0')}:00 — {hour + 1}:00</span>
                     </div>
                   );
                } else if (slot.type === 'user' || (editable && window.location.pathname.includes('user'))) {
                   content = (
                     <div className="absolute inset-1 bg-primary text-white flex items-center justify-center rounded-sm shadow-sm z-10">
                       <span className="text-sm font-bold">✓</span>
                     </div>
                   );
                } else if (slot.type === 'overlap') {
                   const isSelected = selectedSlot?.day_of_week === day && selectedSlot?.start_time === slot.start_time;
                   if (isSelected) {
                     content = (
                       <div className="absolute inset-1 bg-primary text-white flex flex-col justify-center items-center rounded-sm z-10 shadow-md">
                         <span className="text-[10px] font-bold tracking-widest uppercase">Selected</span>
                       </div>
                     );
                   } else {
                     content = (
                       <div 
                         className="absolute inset-1 bg-blue-50 hover:bg-white text-primary flex flex-col justify-center items-center rounded-sm border-2 border-transparent hover:border-primary z-10 cursor-pointer transition-colors group"
                         onClick={() => onSlotSelect?.(slot)}
                       >
                         <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                       </div>
                     );
                   }
                }
              }

              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={cellClass}
                  onClick={() => editable ? toggleSlot(day, hour) : null}
                >
                  <div className="w-full h-full border border-transparent rounded-sm group relative">
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
