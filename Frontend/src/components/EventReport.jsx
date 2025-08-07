import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, BarChart3, Calendar, MapPin, Users, Filter, Search, Settings, UserCheck, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './Navigation';
import { checkTokenTime } from "../helpers/authHelpers";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState([]);
  
  const navigate = useNavigate();

  const extraLinks = [
    {
      className: "nav-button",
      link: "/eventmanagement",
      logo: <Settings size={16} />,
      text: "Event Management"
    },
    {
      className: "nav-button",
      link: "/volunteermatch",
      logo: <UserCheck size={16} />,
      text: "Volunteer Matching"
    },
    {
      className: "nav-button",
      link: "/EventReview",
      logo: <ClipboardCheck size={16} />,
      text: "Event Review"
    },
  ];

  useEffect(() => {
    loadCompletedEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [completedEvents, searchTerm, dateFilter]);

  const loadCompletedEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      await checkTokenTime();
      
      if (!token) {
        alert('Please log in to view reports.');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/events/completed', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to load completed events');
      }

      const data = await response.json();
      console.log('Loaded completed events:', data);
      setCompletedEvents(data.events || []);
    } catch (error) {
      console.error('Error loading completed events:', error);
      alert('Failed to load completed events. Please try again.');
      setCompletedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = completedEvents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location_name && event.location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.city && event.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(event => new Date(event.date) >= filterDate);
    }

    setFilteredEvents(filtered);
  };

  const handleEventSelection = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const selectAllEvents = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

// Replace your generatePDF function with this updated version:
const generatePDF = () => {
  const eventsToExport = selectedEvents.length > 0 
    ? filteredEvents.filter(event => selectedEvents.includes(event.id))
    : filteredEvents;

  if (eventsToExport.length === 0) {
    alert('No events selected for PDF generation.');
    return;
  }

  try {
    // Create new PDF
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Volunteer Events Report', 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Events: ${eventsToExport.length}`, 20, 45);
    
    // Draw a line
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);
    
    let yPosition = 60;
    
    // Add events data with volunteer details
    eventsToExport.forEach((event, index) => {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Event header
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(`${index + 1}. ${event.event_name || 'Unnamed Event'}`, 20, yPosition);
      yPosition += 8;
      
      // Event details
      doc.setFontSize(10);
      doc.setTextColor(80);
      
      doc.text(`Date: ${event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Location: ${event.location_name || 'N/A'}, ${event.city || 'N/A'}, ${event.state || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Volunteers: ${event.volunteers_registered || 0}/${event.volunteers_needed || 0} registered, ${event.volunteers_attended || 0} attended`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Attendance Rate: ${event.attendance_rate || 0}%`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Duration: ${event.event_duration || 0} hours`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Urgency: ${event.urgency || 'N/A'}`, 25, yPosition);
      yPosition += 10;
      
      // Add volunteer details if available
      if (event.volunteers && event.volunteers.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(60);
        doc.text('Assigned Volunteers:', 25, yPosition);
        yPosition += 8;
        
        doc.setFontSize(9);
        doc.setTextColor(80);
        
        event.volunteers.forEach((volunteer, volIndex) => {
          // Check if we need a new page for volunteers
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const status = volunteer.participation_status || 'N/A';
          const rating = volunteer.performance ? ` (${volunteer.performance}/5)` : '';
          const location = volunteer.city && volunteer.state ? ` - ${volunteer.city}, ${volunteer.state}` : '';
          
          doc.text(`   • ${volunteer.name || 'Unknown'}${location}`, 30, yPosition);
          yPosition += 5;
          doc.text(`     Email: ${volunteer.email || 'N/A'} | Status: ${status}${rating}`, 30, yPosition);
          yPosition += 5;
          
          if (volunteer.notes && volunteer.notes.trim()) {
            doc.text(`     Notes: ${volunteer.notes.substring(0, 60)}${volunteer.notes.length > 60 ? '...' : ''}`, 30, yPosition);
            yPosition += 5;
          }
          yPosition += 2;
        });
        
        yPosition += 5;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('No volunteers assigned to this event.', 25, yPosition);
        yPosition += 10;
      }
      
      // Add a separator line
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
    });
    
    // Add summary on last page or new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Summary section
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    
    const totalNeeded = eventsToExport.reduce((sum, event) => sum + (event.volunteers_needed || 0), 0);
    const totalRegistered = eventsToExport.reduce((sum, event) => sum + (event.volunteers_registered || 0), 0);
    const totalAttended = eventsToExport.reduce((sum, event) => sum + (event.volunteers_attended || 0), 0);
    const totalDuration = eventsToExport.reduce((sum, event) => sum + (event.event_duration || 0), 0);
    const avgAttendanceRate = eventsToExport.reduce((sum, event) => sum + (event.attendance_rate || 0), 0) / eventsToExport.length;
    
    // Count unique volunteers across all events
    const allVolunteers = new Set();
    eventsToExport.forEach(event => {
      if (event.volunteers) {
        event.volunteers.forEach(vol => allVolunteers.add(vol.volunteer_id));
      }
    });
    
    doc.text(`Total Events: ${eventsToExport.length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Event Duration: ${totalDuration} hours`, 20, yPosition);
    yPosition += 8;
    doc.text(`Unique Volunteers Involved: ${allVolunteers.size}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Volunteers Needed: ${totalNeeded}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Volunteers Registered: ${totalRegistered}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Volunteers Attended: ${totalAttended}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Overall Registration Rate: ${totalNeeded > 0 ? ((totalRegistered / totalNeeded) * 100).toFixed(1) : 0}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Overall Attendance Rate: ${totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : 0}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Average Event Attendance Rate: ${avgAttendanceRate.toFixed(1)}%`, 20, yPosition);
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        'Volunteer Management System Report - Confidential',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
    
    // Save the PDF
    const fileName = `volunteer_events_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    alert(`PDF "${fileName}" with volunteer details generated successfully!`);
    
  } catch (error) {
    console.error('PDF Error:', error);
    alert(`PDF generation failed: ${error.message}`);
  }
};

const generateCSV = () => {
  const eventsToExport = selectedEvents.length > 0 
    ? filteredEvents.filter(event => selectedEvents.includes(event.id))
    : filteredEvents;

  if (eventsToExport.length === 0) {
    alert('No events selected for CSV generation.');
    return;
  }

  try {
    // Create two separate CSV datasets: Events summary and Volunteer details
    
    // 1. Events Summary CSV
    const eventHeaders = [
      'Event ID',
      'Event Name',
      'Date',
      'Location Name',
      'City',
      'State',
      'Zipcode',
      'Urgency',
      'Duration (hours)',
      'Volunteers Needed',
      'Volunteers Registered',
      'Volunteers Attended',
      'Registration Rate (%)',
      'Attendance Rate (%)',
      'Average Rating',
      'Event Status',
      'Required Skills',
      'Total Unique Volunteers'
    ];

    const eventRows = eventsToExport.map(event => [
      event.id || '',
      `"${(event.event_name || '').replace(/"/g, '""')}"`,
      event.date ? `"${new Date(event.date).toLocaleDateString()}"` : '',
      `"${(event.location_name || '').replace(/"/g, '""')}"`,
      `"${(event.city || '').replace(/"/g, '""')}"`,
      `"${(event.state || '').replace(/"/g, '""')}"`,
      `"${(event.zipcode || '').replace(/"/g, '""')}"`,
      event.urgency || '',
      event.event_duration || 0,
      event.volunteers_needed || 0,
      event.volunteers_registered || 0,
      event.volunteers_attended || 0,
      event.registration_rate || 0,
      event.attendance_rate || 0,
      event.avg_rating || 0,
      `"${(event.event_status || '').replace(/"/g, '""')}"`,
      `"${Array.isArray(event.required_skills) ? event.required_skills.join('; ') : (event.required_skills || '').replace(/"/g, '""')}"`,
      event.volunteers ? event.volunteers.length : 0
    ]);

    // 2. Volunteer Details CSV
    const volunteerHeaders = [
      'Event ID',
      'Event Name',
      'Event Date',
      'Volunteer ID',
      'Volunteer Name',
      'Volunteer Email',
      'Volunteer City',
      'Volunteer State',
      'Participation Status',
      'Performance Rating',
      'Notes'
    ];

    const volunteerRows = [];
    eventsToExport.forEach(event => {
      if (event.volunteers && event.volunteers.length > 0) {
        event.volunteers.forEach(volunteer => {
          volunteerRows.push([
            event.id || '',
            `"${(event.event_name || '').replace(/"/g, '""')}"`,
            event.date || '',
            volunteer.volunteer_id || '',
            `"${(volunteer.name || '').replace(/"/g, '""')}"`,
            `"${(volunteer.email || '').replace(/"/g, '""')}"`,
            `"${(volunteer.city || '').replace(/"/g, '""')}"`,
            `"${(volunteer.state || '').replace(/"/g, '""')}"`,
            `"${(volunteer.participation_status || '').replace(/"/g, '""')}"`,
            volunteer.performance || '',
            `"${(volunteer.notes || '').replace(/"/g, '""')}"`
          ]);
        });
      }
    });

    // 3. Summary Statistics
    const totalNeeded = eventsToExport.reduce((sum, event) => sum + (event.volunteers_needed || 0), 0);
    const totalRegistered = eventsToExport.reduce((sum, event) => sum + (event.volunteers_registered || 0), 0);
    const totalAttended = eventsToExport.reduce((sum, event) => sum + (event.volunteers_attended || 0), 0);
    const totalDuration = eventsToExport.reduce((sum, event) => sum + (event.event_duration || 0), 0);
    const avgAttendanceRate = eventsToExport.length > 0 ? 
      eventsToExport.reduce((sum, event) => sum + (event.attendance_rate || 0), 0) / eventsToExport.length : 0;

    // Count unique volunteers across all events
    const allVolunteers = new Set();
    eventsToExport.forEach(event => {
      if (event.volunteers) {
        event.volunteers.forEach(vol => allVolunteers.add(vol.volunteer_id));
      }
    });

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Events', eventsToExport.length],
      ['Total Event Duration (hours)', totalDuration],
      ['Unique Volunteers Involved', allVolunteers.size],
      ['Total Volunteers Needed', totalNeeded],
      ['Total Volunteers Registered', totalRegistered],
      ['Total Volunteers Attended', totalAttended],
      ['Overall Registration Rate (%)', totalNeeded > 0 ? ((totalRegistered / totalNeeded) * 100).toFixed(1) : 0],
      ['Overall Attendance Rate (%)', totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : 0],
      ['Average Event Attendance Rate (%)', avgAttendanceRate.toFixed(1)],
      ['Report Generated On', new Date().toLocaleDateString()]
    ];

    // Create comprehensive CSV content
    const csvSections = [
      '=== VOLUNTEER EVENTS SUMMARY ===',
      '',
      eventHeaders.join(','),
      ...eventRows.map(row => row.join(',')),
      '',
      '',
      '=== VOLUNTEER DETAILS ===',
      '',
      volunteerHeaders.join(','),
      ...volunteerRows.map(row => row.join(',')),
      '',
      '',
      '=== SUMMARY STATISTICS ===',
      '',
      ...summaryData.map(row => row.join(','))
    ];

    const csvContent = csvSections.join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `volunteer_events_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`CSV "${fileName}" with comprehensive volunteer details generated successfully!`);
    
  } catch (error) {
    console.error('CSV Error:', error);
    alert(`CSV generation failed: ${error.message}`);
  }
};

  const goBack = () => {
    navigate('/eventmanagement');
  };

  if (loading) {
    return (
      <div className="reports-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />
        <div className="main-content">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading completed events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .reports-container {
          min-height: 100vh;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        }

        .main-content {
          width: 100%;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          margin-bottom: 2rem;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #6b7280;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #4b5563;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          flex: 1;
          min-width: 250px;
        }

        .search-input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.875rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 0.875rem;
        }

        .actions-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .selection-info {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }

        .export-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pdf-button {
          background-color: #ef4444;
          color: white;
        }

        .pdf-button:hover:not(:disabled) {
          background-color: #dc2626;
          transform: translateY(-1px);
        }

        .csv-button {
          background-color: #10b981;
          color: white;
        }

        .csv-button:hover:not(:disabled) {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .content-section {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .event-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .event-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .event-card.selected {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
        }

        .event-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .event-checkbox {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .event-title {
          flex: 1;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .urgency-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .urgency-high {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .urgency-medium {
          background-color: #fef3c7;
          color: #d97706;
        }

        .urgency-low {
          background-color: #d1fae5;
          color: #059669;
        }

        .event-details {
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .event-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .actions-section {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .export-buttons {
            justify-content: center;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .event-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .reports-container {
            background-color: #111827;
          }

          .page-title {
            color: #f9fafb;
          }

          .search-box {
            background-color: #374151;
            border-color: #4b5563;
          }

          .search-input {
            background-color: transparent;
            color: #f9fafb;
          }

          .search-input::placeholder {
            color: #9ca3af;
          }

          .filter-select {
            background-color: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .actions-section {
            background-color: #1f2937;
            border: 1px solid #374151;
          }

          .checkbox-label {
            color: #e5e7eb;
          }

          .event-card {
            background-color: #1f2937;
            border: 1px solid #374151;
          }

          .event-title {
            color: #f9fafb;
          }

          .stat-value {
            color: #f9fafb;
          }

          .event-stats {
            border-top-color: #374151;
          }

          .empty-state h3 {
            color: #e5e7eb;
          }

          .loading-section {
            color: #9ca3af;
          }

          .content-section {
            background-color: #1f2937;
            border: 1px solid #374151;
          }
        }
      `}</style>

      <div className="reports-container">
        <NavigationBar extraLinks={extraLinks} title={"Admin Portal"} />

        <div className="main-content">
          <div className="header-section">
            <div className="header-top">
              <button className="back-button" onClick={goBack}>
                <ArrowLeft size={20} />
                Back to Event Management
              </button>
              <h1 className="page-title">
                <BarChart3 size={32} />
                Event Reports
              </h1>
            </div>

            <div className="filters-section">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <Filter size={16} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="quarter">Past 3 Months</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>

            <div className="actions-section">
              <div className="selection-info">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                    onChange={selectAllEvents}
                  />
                  Select All ({selectedEvents.length} of {filteredEvents.length} selected)
                </label>
              </div>

              <div className="export-buttons">
                <button 
                  className="export-button pdf-button"
                  onClick={generatePDF}
                  disabled={filteredEvents.length === 0}
                >
                  <FileText size={20} />
                  Generate PDF
                </button>
                <button 
                  className="export-button csv-button"
                  onClick={generateCSV}
                  disabled={filteredEvents.length === 0}
                >
                  <Download size={20} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="content-section">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={64} color="#9ca3af" />
                <h3>No Completed Events Found</h3>
                <p>
                  {completedEvents.length === 0 
                    ? "There are no completed events to generate reports for."
                    : "No events match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="events-grid">
                {filteredEvents.map(event => (
                  <div key={event.id} className={`event-card ${selectedEvents.includes(event.id) ? 'selected' : ''}`}>
                    <div className="event-header">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleEventSelection(event.id)}
                        className="event-checkbox"
                      />
                      <h3 className="event-title">{event.event_name}</h3>
                      <span className={`urgency-badge urgency-${event.urgency ? event.urgency.toLowerCase() : 'low'}`}>
                        {event.urgency || 'Low'}
                      </span>
                    </div>

                    <div className="event-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{event.location_name || 'N/A'}, {event.city || 'N/A'}, {event.state || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <Users size={16} />
                        <span>
                          {event.volunteers_registered || 0}/{event.volunteers_needed || 0} registered, 
                          {event.volunteers_attended || 0} attended
                        </span>
                      </div>
                    </div>

                 <div className="event-stats">
                    <div className="stat">
                        <span className="stat-label">Attendance Rate</span>
                        <span className="stat-value">
                        {event.attendance_rate || 0}%
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Duration</span>
                        <span className="stat-value">{event.event_duration || 0}h</span>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}