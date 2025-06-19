/**
 * Time Utilities for 15-minute snapping (Google Calendar style)
 */

/**
 * Snap a time to the nearest 15-minute interval
 * @param {Date} date - The date to snap
 * @returns {Date} - The snapped date
 */
export function snapToNearestQuarter(date) {
  const snapped = new Date(date);
  const minutes = snapped.getMinutes();
  const remainder = minutes % 15;
  
  if (remainder < 7.5) {
    // Round down
    snapped.setMinutes(minutes - remainder);
  } else {
    // Round up
    snapped.setMinutes(minutes + (15 - remainder));
  }
  
  snapped.setSeconds(0);
  snapped.setMilliseconds(0);
  
  return snapped;
}

/**
 * Snap a time string to the nearest 15-minute interval
 * @param {string} timeString - Time in format "HH:MM AM/PM" or "HH:MM"
 * @returns {string} - Snapped time string
 */
export function snapTimeStringToQuarter(timeString) {
  if (!timeString) return '';
  
  try {
    // Parse the time string
    const today = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period) {
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }
    }
    
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour24, minutes);
    const snapped = snapToNearestQuarter(date);
    
    // Format back to string
    return formatTimeString(snapped);
  } catch (error) {
    console.warn('Error snapping time string:', timeString, error);
    return timeString;
  }
}

/**
 * Format a Date object to time string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time string "H:MM AM/PM"
 */
export function formatTimeString(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Generate all 15-minute time slots for a day
 * @param {number} startHour - Starting hour (0-23)
 * @param {number} endHour - Ending hour (0-23)
 * @returns {Array<{time: string, hour24: number, minutes: number}>} - Array of time slots
 */
export function generateTimeSlots(startHour = 0, endHour = 23) {
  const slots = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const date = new Date();
      date.setHours(hour, minutes, 0, 0);
      
      slots.push({
        time: formatTimeString(date),
        hour24: hour,
        minutes: minutes,
        slotId: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      });
    }
  }
  
  return slots;
}

/**
 * Get the current time snapped to nearest 15-minute interval
 * @returns {string} - Current time snapped to quarter hour
 */
export function getCurrentSnappedTime() {
  return formatTimeString(snapToNearestQuarter(new Date()));
}

/**
 * Calculate the position (in pixels) for a time slot in a grid
 * @param {string} timeString - Time string to position
 * @param {number} slotHeight - Height of each 15-minute slot in pixels
 * @param {number} startHour - Starting hour of the grid (default 0)
 * @returns {number} - Y position in pixels
 */
export function getTimeSlotPosition(timeString, slotHeight = 20, startHour = 0) {
  try {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period) {
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }
    }
    
    // Calculate slot index (4 slots per hour)
    const hourOffset = hour24 - startHour;
    const quarterIndex = Math.floor(minutes / 15);
    const slotIndex = (hourOffset * 4) + quarterIndex;
    
    return slotIndex * slotHeight;
  } catch (error) {
    console.warn('Error calculating time slot position:', timeString, error);
    return 0;
  }
}

/**
 * Convert Y position to time string
 * @param {number} yPosition - Y position in pixels
 * @param {number} slotHeight - Height of each 15-minute slot in pixels
 * @param {number} startHour - Starting hour of the grid (default 0)
 * @returns {string} - Time string for the position
 */
export function positionToTimeString(yPosition, slotHeight = 20, startHour = 0) {
  const slotIndex = Math.floor(yPosition / slotHeight);
  const hour = startHour + Math.floor(slotIndex / 4);
  const minutes = (slotIndex % 4) * 15;
  
  const date = new Date();
  date.setHours(hour, minutes, 0, 0);
  
  return formatTimeString(date);
}

/**
 * Check if two time strings are in the same 15-minute slot
 * @param {string} time1 - First time string
 * @param {string} time2 - Second time string
 * @returns {boolean} - True if both times are in the same slot
 */
export function isSameTimeSlot(time1, time2) {
  const snapped1 = snapTimeStringToQuarter(time1);
  const snapped2 = snapTimeStringToQuarter(time2);
  return snapped1 === snapped2;
} 