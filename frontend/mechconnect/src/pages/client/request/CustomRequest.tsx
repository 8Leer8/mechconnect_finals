import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './CustomRequest.css';

const CustomRequest: React.FC = () => {
  const history = useHistory();
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<'urgent' | 'freely'>('urgent');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRequestTypeChange = (type: 'urgent' | 'freely') => {
    setRequestType(type);
    if (type === 'urgent') {
      setSelectedDate(null);
      setSelectedTime('');
    }
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
      problemDescription,
      selectedImage,
      requestType,
      selectedDate,
      selectedTime,
      estimatedBudget
    });
    // Handle request submission
  };

  return (
    <IonPage>
      <IonContent className="custom-request-content">
        <div className="custom-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="custom-request-title">Custom Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="form-section">
              <label className="form-label">Problem Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the problem with your vehicle..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Attach Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {selectedImage ? (
                <div className="image-preview-container">
                  <img src={selectedImage} alt="Preview" className="image-preview" />
                  <button className="remove-image-btn" onClick={handleRemoveImage}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ) : (
                <div className="image-upload-box" onClick={handleImageClick}>
                  <span className="material-icons-round upload-icon">add_photo_alternate</span>
                  <span className="upload-text">Click to upload image</span>
                </div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Set Location</label>
              <div className="location-grid">
                <input type="text" className="location-input" placeholder="House/Building No" />
                <input type="text" className="location-input" placeholder="Street Name" />
                <input type="text" className="location-input" placeholder="Subdivision/Village" />
                <input type="text" className="location-input" placeholder="Barangay" />
                <input type="text" className="location-input" placeholder="City/Municipality" />
                <input type="text" className="location-input" placeholder="Province" />
                <input type="text" className="location-input" placeholder="Region" />
                <input type="text" className="location-input" placeholder="Postal Code" />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Estimated Budget</label>
              <input
                type="text"
                className="budget-input"
                placeholder="Enter your estimated budget (e.g., ₱5,000)"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Schedule Type</label>
              <div className="schedule-type-buttons">
                <button
                  className={`schedule-btn ${requestType === 'urgent' ? 'active' : ''}`}
                  onClick={() => handleRequestTypeChange('urgent')}
                >
                  <span className="material-icons-round icon-sm">emergency</span>
                  Urgent
                </button>
                <button
                  className={`schedule-btn ${requestType === 'freely' ? 'active' : ''}`}
                  onClick={() => handleRequestTypeChange('freely')}
                >
                  <span className="material-icons-round icon-sm">schedule</span>
                  Freely
                </button>
              </div>
            </div>

            {requestType === 'freely' && (
              <>
                <div className="form-section">
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

                <div className="form-section">
                  <label className="form-label">Input Time</label>
                  <input
                    type="time"
                    className="time-input"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </>
            )}
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

export default CustomRequest;
