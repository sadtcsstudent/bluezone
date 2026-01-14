<template>
  <div class="calendar-wrapper">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import nlLocale from '@fullcalendar/core/locales/nl'
import { useI18n } from 'vue-i18n'

export default {
  name: 'EventsCalendar',
  components: {
    FullCalendar
  },
  setup() {
    const { locale } = useI18n()
    return { currentLocale: locale }
  },
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-details'],
  computed: {
    calendarOptions() {
      return {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locales: [nlLocale],
        locale: this.currentLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: this.mapEvents(this.events),
        eventClick: this.handleEventClick,
        height: 'auto',
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: true
        }
      }
    }
  },
  methods: {
    mapEvents(events) {
      if (!events) return []
      return events.map(event => {
        let start = event.date
        let end = null

        // Try to parse time range "10:00 - 13:00"
        if (event.time && typeof event.time === 'string') {
            // Remove simple text that might be in time string (though seed data is clean)
            // Just look for HH:MM patterns
            const parts = event.time.split('-').map(t => t.trim())
            
            if (parts.length > 0) {
                // Get valid YYYY-MM-DD
                try {
                    const dateObj = new Date(event.date)
                    if (!isNaN(dateObj)) {
                        const datePart = dateObj.toISOString().split('T')[0]
                        const startTime = parts[0].split(' ')[0] // Handle potential "10:00 AM" if needed, but seed is 24h
                        start = `${datePart}T${startTime}:00`
                        
                        if (parts.length > 1) {
                             const endTime = parts[1].split(' ')[0]
                             end = `${datePart}T${endTime}:00`
                        }
                    }
                } catch (e) {
                    console.warn('Error parsing event date/time', e)
                }
            }
        }

        return {
          id: event.id,
          title: event.title,
          start: start,
          end: end,
          extendedProps: { ...event },
          classNames: `event-category-${this.slugify(event.category || 'default')}`
        }
      })
    },
    handleEventClick(info) {
      this.$emit('view-details', info.event.extendedProps)
    },
    slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           
            .replace(/[^\w\-]+/g, '')       
            .replace(/\-\-+/g, '-')         
            .replace(/^-+/, '')             
            .replace(/-+$/, '');            
    }
  }
}
</script>

<style scoped>
.calendar-wrapper {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-border));
}

/* Customize FullCalendar CSS variables */
.fc {
  --fc-border-color: rgb(var(--color-border));
  --fc-event-bg-color: rgb(var(--color-primary));
  --fc-event-border-color: rgb(var(--color-primary));
  --fc-today-bg-color: rgba(var(--color-primary), 0.05);
  --fc-neutral-bg-color: rgb(var(--color-background));
  --fc-page-bg-color: white;
}

:deep(.fc-button-primary) {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
  color: white;
  opacity: 1;
}

:deep(.fc-button-primary:hover) {
  background-color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-dark));
}

:deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background-color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-dark));
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

:deep(.fc-col-header-cell-cushion),
:deep(.fc-daygrid-day-number) {
  color: rgb(var(--color-text));
  text-decoration: none;
}

:deep(.fc-daygrid-event) {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
}
</style>
