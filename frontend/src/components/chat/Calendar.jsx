// CalendarPage.jsx - Full Page Version with Proper Spacing
import { useState, useEffect, useCallback } from "react";
import api, { getMeetings, getTasks } from "../chat/index";
import "../styles/calendar.css";

/* ════════════════════════════════════════════════════════════════
   CONSTANTS & UTILITIES
════════════════════════════════════════════════════════════════ */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

const MEET_COLORS = [
  "#3bd2f0",
  "#22c55e",
  "#a78bfa",
  "#f59e0b",
  "#f87171",
  "#fb923c",
];
const getMeetColor = (str) =>
  MEET_COLORS[
    [...str].reduce((a, c) => a + c.charCodeAt(0), 0) % MEET_COLORS.length
  ];

const TASK_COLORS = { overdue: "#f85149", pending: "#f59e0b", done: "#22c55e" };

const formatTime = (date) =>
  date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
const formatDateTime = (raw) =>
  raw
    ? new Date(raw).toLocaleString("en-KE", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "—";

/* ════════════════════════════════════════════════════════════════
   CUSTOM HOOK: Calendar Data
════════════════════════════════════════════════════════════════ */
function useCalendarData() {
  const [events, setEvents] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [meetingsRes, tasksRes] = await Promise.allSettled([
        api.get("/ai-agent/api/meetings/"),
        getTasks(),
      ]);

      const eventMap = {};

      // Process meetings
      if (meetingsRes.status === "fulfilled") {
        const meetings =
          meetingsRes.value.data?.results ??
          (Array.isArray(meetingsRes.value.data) ? meetingsRes.value.data : []);

        meetings.forEach((meeting) => {
          if (!meeting.start_time) return;
          const dateKey = meeting.start_time.slice(0, 10);
          const start = new Date(meeting.start_time);
          const end = new Date(meeting.end_time || meeting.start_time);

          eventMap[dateKey] = eventMap[dateKey] || [];
          eventMap[dateKey].push({
            id: meeting.id,
            type: "meeting",
            title: meeting.title || "Untitled meeting",
            date: dateKey,
            time: formatTime(start),
            timeRaw: meeting.start_time,
            duration: Math.round((end - start) / 60000) || 60,
            participants: meeting.participants || "",
            notes: meeting.notes || "",
            color: getMeetColor(meeting.title),
          });
        });
      }

      // Process tasks
      const taskList =
        tasksRes.status === "fulfilled"
          ? Array.isArray(tasksRes.value)
            ? tasksRes.value
            : tasksRes.value?.results || []
          : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const normalizedTasks = taskList.map((task) => {
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const state = task.completed
          ? "done"
          : dueDate && dueDate < today
            ? "overdue"
            : "pending";
        return { ...task, dueDate, state };
      });

      setTasks(normalizedTasks);

      // Add tasks to events
      normalizedTasks.forEach((task) => {
        if (!task.due_date) return;
        const dateKey = task.due_date.slice(0, 10);
        eventMap[dateKey] = eventMap[dateKey] || [];
        eventMap[dateKey].push({
          id: task.id,
          type: "task",
          title: task.title,
          date: dateKey,
          time: "",
          color: TASK_COLORS[task.state],
          state: task.state,
          completed: task.completed,
        });
      });

      setEvents(eventMap);
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { events, tasks, loading, lastSync, reload: loadData };
}

/* ════════════════════════════════════════════════════════════════
   COMPONENTS
════════════════════════════════════════════════════════════════ */

// Event Pill Component
const EventPill = ({ event }) => (
  <div
    className="calendar-event-pill"
    style={{
      background: `${event.color}15`,
      borderColor: `${event.color}30`,
      color: event.color,
    }}
  >
    <span className="calendar-event-icon">
      {event.type === "task" ? "✓" : "●"}
    </span>
    {event.time && <span className="calendar-event-time">{event.time}</span>}
    <span className="calendar-event-title">{event.title}</span>
  </div>
);

// Day Detail Panel
const DayDetail = ({ date, events, tasks, onSchedule }) => {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayEvents = events[dateKey] || [];
  const meetings = dayEvents.filter((e) => e.type === "meeting");
  const taskEvents = dayEvents.filter((e) => e.type === "task");

  const dateObj = date;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.dueDate <= dateObj &&
      !t.completed &&
      t.due_date?.slice(0, 10) !== dateKey,
  );

  if (!meetings.length && !taskEvents.length) {
    return (
      <div className="day-detail-empty">
        <div className="empty-icon">📅</div>
        <h3>Nothing scheduled</h3>
        <p>No meetings or tasks for this day</p>
        <button className="schedule-btn" onClick={onSchedule}>
          + Schedule a meeting
        </button>
      </div>
    );
  }

  return (
    <div className="day-detail-content">
      {meetings.length > 0 && (
        <div className="detail-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h3>Meetings ({meetings.length})</h3>
          </div>
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              style={{ borderLeftColor: meeting.color }}
            >
              <div className="meeting-header">
                <h4>{meeting.title}</h4>
                <span className="meeting-time">{meeting.time}</span>
              </div>
              <div className="meeting-duration">
                ⏱️ {meeting.duration} minutes
              </div>
              {meeting.participants && (
                <div className="meeting-participants">
                  <span className="participants-label">👥 Participants:</span>
                  {meeting.participants.split(",").map((p) => (
                    <span key={p} className="participant-tag">
                      {p.trim()}
                    </span>
                  ))}
                </div>
              )}
              {meeting.notes && (
                <div className="meeting-notes">📝 {meeting.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {taskEvents.length > 0 && (
        <div className="detail-section">
          <div className="section-header">
            <span className="section-icon">✅</span>
            <h3>Tasks ({taskEvents.length})</h3>
          </div>
          {taskEvents.map((task) => (
            <div
              key={task.id}
              className="task-card"
              style={{ borderLeftColor: task.color }}
            >
              <div className="task-info">
                <span
                  className="task-status-dot"
                  style={{ background: task.color }}
                />
                <span className="task-title">{task.title}</span>
                <span
                  className="task-badge"
                  style={{ background: `${task.color}20`, color: task.color }}
                >
                  {task.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {overdueTasks.length > 0 && (
        <div className="overdue-section">
          <div className="section-header">
            <span className="section-icon">⚠️</span>
            <h3>Overdue Tasks ({overdueTasks.length})</h3>
          </div>
          {overdueTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="overdue-item">
              <span className="overdue-dot">•</span>
              <span className="overdue-title">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Mini Calendar
const MiniCalendar = ({
  year,
  month,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  events,
}) => {
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const prevMonthDays = daysInMonth(year, month === 0 ? 11 : month - 1);

  const days = [];
  for (let i = startDay - 1; i >= 0; i--)
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  for (let d = 1; d <= totalDays; d++)
    days.push({ day: d, isCurrentMonth: true });
  while (days.length % 7 !== 0)
    days.push({
      day: days.length - totalDays - startDay + 1,
      isCurrentMonth: false,
    });

  const isToday = (day) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const hasEvent = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events[dateKey] && events[dateKey].length > 0;
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button onClick={onPrevMonth} className="mini-nav-btn">
          ←
        </button>
        <span className="mini-month">
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNextMonth} className="mini-nav-btn">
          →
        </button>
      </div>
      <div className="mini-weekdays">
        {SHORT_DAYS.map((day) => (
          <div key={day} className="mini-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="mini-days-grid">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`mini-day ${!day.isCurrentMonth ? "other-month" : ""} ${isToday(day.day) ? "today" : ""} ${selectedDay === day.day && day.isCurrentMonth ? "selected" : ""}`}
            onClick={() => day.isCurrentMonth && onSelectDay(day.day)}
          >
            {day.day}
            {hasEvent(day.day) && <div className="event-indicator" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Upcoming Meetings Widget
const UpcomingMeetings = ({ meetings }) => {
  if (!meetings.length) return null;

  return (
    <div className="upcoming-section">
      <div className="section-header">
        <span className="section-icon">⏰</span>
        <h3>Upcoming Meetings</h3>
      </div>
      {meetings.map((meeting) => (
        <div key={meeting.id} className="upcoming-meeting">
          <div className="meeting-date">
            <span className="meeting-day">
              {new Date(meeting.date).getDate()}
            </span>
            <span className="meeting-month">
              {MONTHS[new Date(meeting.date).getMonth()].slice(0, 3)}
            </span>
          </div>
          <div className="meeting-info">
            <div className="meeting-title">{meeting.title}</div>
            <div className="meeting-time">{meeting.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Schedule Meeting Modal
const ScheduleModal = ({ open, onClose, onScheduled, selectedDate }) => {
  const [form, setForm] = useState({
    title: "",
    date: selectedDate || "",
    startTime: "09:00",
    endTime: "10:00",
    participants: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, date: selectedDate || "" }));
  }, [open, selectedDate]);
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date)
      return setStatus({
        type: "error",
        message: "Title and date are required.",
      });

    const startISO = `${form.date}T${form.startTime}:00`;
    const endISO = `${form.date}T${form.endTime}:00`;
    if (endISO <= startISO)
      return setStatus({
        type: "error",
        message: "End time must be after start time.",
      });

    setSaving(true);
    setStatus(null);
    try {
      await api.post("/ai-agent/api/meetings/", {
        title: form.title,
        start_time: startISO,
        end_time: endISO,
        participants: form.participants,
        notes: form.notes,
      });
      setStatus({ type: "success", message: `"${form.title}" scheduled!` });
      setTimeout(() => {
        onClose();
        onScheduled?.();
      }, 900);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-icon">📅</div>
          <div>
            <div className="modal-title">Schedule Meeting</div>
            <div className="modal-subtitle">
              Create a new meeting in your calendar
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          {status && (
            <div className={`modal-alert ${status.type}`}>{status.message}</div>
          )}

          <div className="form-group">
            <label>Meeting Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., Quarterly Review, Client Meeting"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Participants (comma-separated emails)</label>
            <input
              type="text"
              value={form.participants}
              onChange={(e) =>
                setForm((p) => ({ ...p, participants: e.target.value }))
              }
              placeholder="alice@company.com, bob@company.com"
            />
          </div>

          <div className="form-group">
            <label>Notes / Agenda</label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Add meeting agenda, location, or call link..."
              rows={4}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN CALENDAR PAGE COMPONENT
════════════════════════════════════════════════════════════════ */
export default function CalendarPage({ onBack, openSchedule = false }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(openSchedule);
  const [view, setView] = useState("month");

  const { events, tasks, loading, lastSync, reload } = useCalendarData();

  const goPrevMonth = () =>
    month === 0
      ? (setMonth(11), setYear((y) => y - 1))
      : setMonth((m) => m - 1);
  const goNextMonth = () =>
    month === 11
      ? (setMonth(0), setYear((y) => y + 1))
      : setMonth((m) => m + 1);
  const goToday = () => {
    const todayDate = new Date();
    setYear(todayDate.getFullYear());
    setMonth(todayDate.getMonth());
    setSelectedDate(todayDate);
  };

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const prevMonthDays = daysInMonth(year, month === 0 ? 11 : month - 1);

  const calendarDays = [];
  for (let i = startDay - 1; i >= 0; i--)
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  for (let d = 1; d <= totalDays; d++)
    calendarDays.push({ day: d, isCurrentMonth: true });
  while (calendarDays.length % 7 !== 0)
    calendarDays.push({
      day: calendarDays.length - totalDays - startDay + 1,
      isCurrentMonth: false,
    });

  const isToday = (day) => {
    const todayDate = new Date();
    return (
      year === todayDate.getFullYear() &&
      month === todayDate.getMonth() &&
      day === todayDate.getDate()
    );
  };

  const getEventsForDay = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events[dateKey] || [];
  };

  const onSelectDay = (day) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
  };

  const upcomingMeetings = Object.values(events)
    .flat()
    .filter(
      (e) =>
        e.type === "meeting" && new Date(e.timeRaw || e.date) >= new Date(),
    )
    .sort(
      (a, b) => new Date(a.timeRaw || a.date) - new Date(b.timeRaw || b.date),
    )
    .slice(0, 6);

  return (
    <div className="calendar-page-container">
      {/* Page Header */}
      <div className="calendar-page-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
          <div className="page-title">
            <h1>Calendar</h1>
            <p>Manage your meetings and tasks</p>
          </div>
        </div>
        <div className="header-right">
          <button className="sync-button" onClick={reload}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Sync
          </button>
          <button
            className="schedule-button"
            onClick={() => setModalOpen(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="calendar-main-content">
        {/* Left Column - Calendar Grid */}
        <div className="calendar-grid-container">
          <div className="calendar-toolbar">
            <div className="view-selector">
              <button
                className={`view-btn ${view === "month" ? "active" : ""}`}
                onClick={() => setView("month")}
              >
                Month
              </button>
              <button
                className={`view-btn ${view === "week" ? "active" : ""}`}
                onClick={() => setView("week")}
              >
                Week
              </button>
              <button
                className={`view-btn ${view === "day" ? "active" : ""}`}
                onClick={() => setView("day")}
              >
                Day
              </button>
            </div>
            <div className="month-navigation">
              <button className="nav-btn" onClick={goPrevMonth}>
                ←
              </button>
              <button className="today-btn" onClick={goToday}>
                Today
              </button>
              <button className="nav-btn" onClick={goNextMonth}>
                →
              </button>
              <span className="current-month">
                {MONTHS[month]} {year}
              </span>
            </div>
          </div>

          <div className="calendar-weekdays">
            {DAYS.map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((cell, idx) => {
              const dayEvents = cell.isCurrentMonth
                ? getEventsForDay(cell.day)
                : [];
              const isSelected =
                cell.isCurrentMonth &&
                selectedDate.getDate() === cell.day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              return (
                <div
                  key={idx}
                  className={`calendar-day ${!cell.isCurrentMonth ? "other-month" : ""} ${isToday(cell.day) ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => cell.isCurrentMonth && onSelectDay(cell.day)}
                >
                  <div className="day-number">{cell.day}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventPill key={event.id} event={event} />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="more-events">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="calendar-sidebar-container">
          {/* Mini Calendar */}
          <MiniCalendar
            year={year}
            month={month}
            selectedDay={selectedDate.getDate()}
            onSelectDay={onSelectDay}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            events={events}
          />

          {/* Selected Day Details */}
          <div className="selected-day-card">
            <div className="card-header">
              <span className="card-icon">📅</span>
              <h3>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>
            <DayDetail
              date={selectedDate}
              events={events}
              tasks={tasks}
              onSchedule={() => setModalOpen(true)}
            />
          </div>

          {/* Tasks Summary */}
          <div className="tasks-summary-card">
            <div className="card-header">
              <span className="card-icon">✅</span>
              <h3>Tasks Overview</h3>
            </div>
            <div className="tasks-stats">
              <div className="stat-item">
                <span className="stat-value">
                  {tasks.filter((t) => t.state === "pending").length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {tasks.filter((t) => t.state === "overdue").length}
                </span>
                <span className="stat-label">Overdue</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {tasks.filter((t) => t.state === "done").length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <UpcomingMeetings meetings={upcomingMeetings} />
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onScheduled={() => {
          setModalOpen(false);
          reload();
        }}
        selectedDate={selectedDate.toISOString().slice(0, 10)}
      />
    </div>
  );
}
