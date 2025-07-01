import { useState,  useEffect } from 'react';
import './VolunteerHistory.css';
import './VolunteerDash.css';
import { Bell, User, LogOut, Calendar, Clock, MapPin, Users } from 'lucide-react';
import {getVolunteerHistory} from '../helpers/volunteerHistoryHelpers.js';

import { Bell, User, LogOut, Home  } from 'lucide-react';
import NavigationBar from './Navigation';

export default function VolunteerHistoryTable(){


    // State used to contain user volunteer history data
    const [volunteerHistory, setVolunteerHistory] = useState([]);

    // Get volunteer history once on mount
    useEffect(() => {
        async function fetchVolutneerHistory(){
            const data = await getVolunteerHistory();
            setVolunteerHistory(data);
        }

        fetchVolutneerHistory();

    }, []);

    return(<div className="dashboard">
      {/* Navbar */}
        <NavigationBar extraLinks={[]} />

      {/* Main Content */}
      <div>
            <table className='history-table'> 
                <tr>
                    <th>Event Name</th>
                    <th>Event Description</th>
                    <th>Location</th>
                    <th>Required Skills</th>
                    <th>Urgency</th>
                    <th>Event Date</th>
                    <th>Participation Status </th>
                </tr>
                   {volunteerHistory && volunteerHistory.map(event => {
                        return( 
                            <tr>
                                <td>{event.eventName}</td>
                                <td>{event.eventDescription}</td>
                                <td>{event.location}</td>
                                <td>{event.requiredSkills}</td>
                                <td>{event.urgency}</td>
                                <td>{event.eventDate}</td>
                                <td>Status: {event.participationStatus}</td>
                            </tr>
                        )
                    })}
            </table>
        </div>
    </div>

    )
}
