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
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">{DAYS[day]}</div>
            {/* The mock shows specific dates like "14", "15" in some views, but we can leave this simple or pass it in. For now just day name is fine, we can add a date prop later if needed */}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="bg-surface relative">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border-subtle last:border-b-0 min-h-[60px]">
            {/* Time Label */}
            <div className="p-2 border-r border-border-subtle flex items-start justify-center bg-white pt-3">
              <span className="text-[10px] font-bold text-text-muted">{hour.toString().padStart(2, '0')}:00</span>
            </div>
            
            {/* Day Cells */}
            {DISPLAY_DAYS.map(day => {
              const slot = getSlot(day, hour);
              let cellClass = "border-r border-border-subtle last:border-r-0 p-1 bg-white relative transition-colors bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]";
              let content = null;
              
              if (editable) {
                cellClass += " cursor-pointer hover:bg-surface-container-low";
              }

              if (slot) {
                if (slot.type === 'mentor' || (editable && window.location.pathname.includes('mentor'))) {
                   // Mentor "AVAILABLE" block
                   content = (
                     <div className="absolute inset-0 bg-primary text-white p-2 rounded shadow-sm z-10 flex flex-col justify-start items-start">
                       <span className="text-[9px] font-bold tracking-widest uppercase">Available</span>
                       <span className="text-[10px] font-bold">{hour.toString().padStart(2, '0')}:00 — {hour + 1}:00</span>
                     </div>
                   );
                } else if (slot.type === 'user' || (editable && window.location.pathname.includes('user'))) {
                   // Mentee block (Black box with checkmark)
                   content = (
                     <div className="absolute inset-1 bg-primary text-white flex items-center justify-center rounded shadow-sm z-10">
                       <span className="text-sm font-bold">✓</span>
                     </div>
                   );
                } else if (slot.type === 'overlap') {
                   // Mutual Overlap block
                   content = (
                     <div className="absolute inset-1 bg-blue-50 text-blue-600 flex flex-col justify-center items-center rounded border-2 border-dashed border-blue-300 z-10 p-1">
                       <span className="text-[9px] font-bold tracking-widest uppercase leading-tight text-center">Mutual<br/>Window</span>
                     </div>
                   );
                } else {
                   // Admin Matching Workspace 'SELECT' block
                   content = (
                     <div className="absolute inset-1 bg-white border-2 border-primary text-primary flex items-center justify-center rounded shadow-sm hover:bg-primary hover:text-white transition-colors z-10">
                       <span className="text-[10px] font-bold tracking-widest">SELECT</span>
                     </div>
                   );
                }
              }

              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={cellClass}
                  onClick={() => toggleSlot(day, hour)}
                >
                  <div className="w-full h-full border border-transparent rounded group relative">
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
