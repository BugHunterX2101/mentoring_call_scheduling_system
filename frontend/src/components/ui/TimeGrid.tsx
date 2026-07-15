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
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// We only show Mon to Fri in some views, but let's support Mon-Sun if needed.
// For the UI matching the screenshot, it shows Mon-Sun or Mon-Fri depending on view.
// Let's default to Mon-Sun.
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

export function TimeGrid({ slots, editable = false, onSlotsChange, startHour = 9, endHour = 15 }: TimeGridProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const toggleSlot = (day: number, hour: number) => {
    if (!editable || !onSlotsChange) return;

    const start_time = `${hour.toString().padStart(2, '0')}:00:00`;
    const end_time = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
    
    const existingIndex = slots.findIndex(s => s.day_of_week === day && s.start_time === start_time);
    
    if (existingIndex >= 0) {
      // Remove slot
      const newSlots = [...slots];
      newSlots.splice(existingIndex, 1);
      onSlotsChange(newSlots);
    } else {
      // Add slot
      onSlotsChange([...slots, { day_of_week: day, start_time, end_time, type: 'available' }]);
    }
  };

  const getSlot = (day: number, hour: number) => {
    const start_time = `${hour.toString().padStart(2, '0')}:00:00`;
    return slots.find(s => s.day_of_week === day && s.start_time.startsWith(start_time.substring(0, 2)));
  };

  return (
    <div className="border border-border-subtle rounded-md overflow-hidden bg-white">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border-subtle">
        <div className="p-3 text-center text-xs font-medium text-text-muted border-r border-border-subtle"></div>
        {DISPLAY_DAYS.map(day => (
          <div key={day} className="p-3 text-center border-r border-border-subtle last:border-r-0">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{DAYS[day]}</div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="bg-surface relative">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border-subtle last:border-b-0 min-h-[60px]">
            {/* Time Label */}
            <div className="p-2 border-r border-border-subtle flex items-center justify-center bg-white">
              <span className="text-xs font-mono text-text-muted">{hour.toString().padStart(2, '0')}:00</span>
            </div>
            
            {/* Day Cells */}
            {DISPLAY_DAYS.map(day => {
              const slot = getSlot(day, hour);
              let cellClass = "border-r border-border-subtle last:border-r-0 p-1 bg-white relative transition-colors";
              let content = null;
              
              if (editable) {
                cellClass += " cursor-pointer hover:bg-surface-container-low";
              }

              if (slot) {
                if (slot.type === 'mentor') {
                  content = <div className="absolute inset-1 bg-primary text-white flex items-center justify-center text-[10px] font-bold rounded shadow-sm">MENTOR</div>;
                } else if (slot.type === 'user') {
                  content = <div className="absolute inset-1 bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold rounded border border-blue-200">USER</div>;
                } else if (slot.type === 'overlap') {
                  content = <div className="absolute inset-1 bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold rounded border-2 border-dashed border-blue-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgogIDxwYXRoIGQ9Ik0tMiAxMEwxMCAyWk0xMCAxNEwyIC0yWiIgc3Ryb2tlPSIjYmZjYmZkIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+')]">MUTUAL</div>;
                } else {
                  // Default available (black box like in screenshot)
                  content = <div className="absolute inset-1 bg-primary text-white flex items-center justify-center text-[10px] font-bold rounded shadow-sm"><span className="opacity-0 group-hover:opacity-100">✓</span></div>;
                }
              }

              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={cellClass}
                  onClick={() => toggleSlot(day, hour)}
                >
                  <div className="w-full h-full border border-transparent hover:border-outline-variant border-dashed rounded group relative">
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
