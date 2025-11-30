import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './DirectRequest.css';

interface AddOn {
  id: number;
  name: string;
  price: number;
  checked: boolean;
}

const DirectRequest: React.FC = () => {
  const history = useHistory();
  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: 1, name: 'Oil Filter', price: 250, checked: false },
    { id: 2, name: 'Air Filter', price: 300, checked: false },
    { id: 3, name: 'Cabin Filter', price: 350, checked: false },
    { id: 4, name: 'Spark Plugs', price: 400, checked: false },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const servicePrice = 2500;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen && dateInputRef.current) {
      const rect = dateInputRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 4;
      const left = rect.left + window.scrollX;
      setCalendarPosition({ top, left });
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const goBack = () => {
    history.goBack();
  };

  const handleAddOnToggle = (id: number) => {
    setAddOns(addOns.map(addon => 
      addon.id === id ? { ...addon, checked: !addon.checked } : addon
    ));
  };

  const calculateTotal = () => {
    const addOnsTotal = addOns
      .filter(addon => addon.checked)
      .reduce((sum, addon) => sum + addon.price, 0);
    return servicePrice + addOnsTotal;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const today = new Date();

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(
        <button key={`prev-${i}`} className="day other-month" disabled>
          {prevMonthLastDay - i}
        </button>
      );
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const isToday = year === today.getFullYear() && 
                      month === today.getMonth() && 
                      i === today.getDate();
      const isSelected = selectedDate &&
                         year === selectedDate.getFullYear() &&
                         month === selectedDate.getMonth() &&
                         i === selectedDate.getDate();

      days.push(
        <button
          key={i}
          className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(i)}
        >
          {i}
        </button>
      );
    }

    // Next month days
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <button key={`next-${i}`} className="day other-month" disabled>
          {i}
        </button>
      );
    }

    return days;
  };

  const handleRequest = () => {
    console.log({
      service: 'Engine Oil Change',
      servicePrice,
      addOns: addOns.filter(addon => addon.checked),
      total: calculateTotal(),
      selectedDate,
      selectedTime
    });
    // Handle request submission
  };

  return (
    <IonPage>
      <IonContent className="direct-request-content">
        <div className="direct-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="direct-request-title">Direct Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="service-section">
              <div className="service-header">
                <h2 className="section-title">Service</h2>
              </div>
              <div className="service-detail">
                <div className="service-info">
                  <span className="service-name">Engine Oil Change</span>
                  <span className="service-price">₱{servicePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="addons-section">
              <h2 className="section-title">Add-ons</h2>
              <div className="addons-list">
                {addOns.map((addon) => (
                  <div key={addon.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`addon-${addon.id}`}
                      className="checkbox-input"
                      checked={addon.checked}
                      onChange={() => handleAddOnToggle(addon.id)}
                    />
                    <label htmlFor={`addon-${addon.id}`} className="checkbox-custom">
                      <span className="checkbox-check">check</span>
                    </label>
                    <label htmlFor={`addon-${addon.id}`} className="checkbox-label">
                      <span className="addon-name">{addon.name}</span>
                      <span className="addon-price">₱{addon.price.toLocaleString()}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            <div className="schedule-section">
              <h2 className="section-title">Schedule Service</h2>
              
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <div className="datepicker-container">
                  <input
                    ref={dateInputRef}
                    type="text"
                    className="datepicker-input"
                    placeholder="Choose a date"
                    value={selectedDate ? selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : ''}
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    readOnly
                  />
                  <span className="datepicker-icon material-icons-round">calendar_today</span>

                  {isCalendarOpen && (
                    <div 
                      className="calendar active" 
                      ref={calendarRef}
                      style={{
                        top: `${calendarPosition.top}px`,
                        left: `${calendarPosition.left}px`
                      }}
                    >
                      <div className="calendar-header">
                        <span className="calendar-month">
                          {currentMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <div className="calendar-nav">
                          <button className="nav-btn" onClick={() => changeMonth(-1)}>
                            <span className="material-icons-round">chevron_left</span>
                          </button>
                          <button className="nav-btn" onClick={() => changeMonth(1)}>
                            <span className="material-icons-round">chevron_right</span>
                          </button>
                        </div>
                      </div>

                      <div className="calendar-weekdays">
                        <div className="weekday">Sun</div>
                        <div className="weekday">Mon</div>
                        <div className="weekday">Tue</div>
                        <div className="weekday">Wed</div>
                        <div className="weekday">Thu</div>
                        <div className="weekday">Fri</div>
                        <div className="weekday">Sat</div>
                      </div>

                      <div className="calendar-days">{renderCalendar()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Input Time</label>
                <input
                  type="time"
                  className="time-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="divider"></div>

            <div className="total-section">
              <span className="total-label">Total Price</span>
              <span className="total-amount">₱{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-request" onClick={handleRequest}>
            <span className="material-icons-round icon-sm">send</span>
            Submit Request
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DirectRequest;
