// Basic overlap utility ignoring complex timezone conversions for v1.
// A real app would use date-fns-tz or moment-timezone here.
function calculateOverlap(userSlots, mentorSlots) {
  const overlap = [];
  
  for (const us of userSlots) {
    for (const ms of mentorSlots) {
      if (us.day_of_week === ms.day_of_week) {
        const start = us.start_time > ms.start_time ? us.start_time : ms.start_time;
        const end = us.end_time < ms.end_time ? us.end_time : ms.end_time;
        
        if (start < end) {
          const startHour = parseInt(start.split(':')[0], 10);
          const endHour = parseInt(end.split(':')[0], 10);
          
          for (let hour = startHour; hour < endHour; hour++) {
            overlap.push({
              day_of_week: us.day_of_week,
              start_time: `${hour.toString().padStart(2, '0')}:00:00`,
              end_time: `${(hour + 1).toString().padStart(2, '0')}:00:00`,
              timezone: us.timezone
            });
          }
        }
      }
    }
  }
  return overlap;
}

module.exports = { calculateOverlap };
