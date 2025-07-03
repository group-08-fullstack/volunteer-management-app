import { useState,  useEffect} from 'react';
import './VolunteerHistory.css';
import './VolunteerDash.css';
import * as VhHelpers from '../helpers/volunteerHistoryHelpers.js';
import NavigationBar from './Navigation';

export default function VolunteerHistoryTable(){

    // State used to contain sliced volunteer data
    const [paginatedData, setPaginatedData] = useState([]);
    // State used to track current index within table
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // Get volunteer history data once on mount
    useEffect(() => {
        async function fetchVolutneerHistory(){
            const res = await getVolunteerHistory();

            // Paginate response
            const pageSize = 5;
            const pages = [];
                for (let i = 0; i < res.length; i += pageSize) {
                    pages.push(res.slice(i, i + pageSize));
                }
            setPaginatedData(pages);
        }

        fetchVolutneerHistory();

    }, []);

    return(
    <div className="dashboard">
        {/* Navbar */}
        <NavigationBar extraLinks={[]} title={"Volunteer History"}/>

        {/* Table*/}
        <div className='history-div'>
        <table className='history-table'> 
                <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Event Description</th>
                    <th>Location</th>
                    <th>Required Skills</th>
                    <th>Urgency</th>
                    <th>Event Date</th>
                    <th>Participation Status </th>
                </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 &&
                    paginatedData[currentPageIndex].map((event, i) => (
                        <tr key={i}>
                        <td>{event.eventName}</td>
                        <td>{event.eventDescription}</td>
                        <td>{event.location}</td>
                        <td>{event.requiredSkills.join(", ")}</td>
                        <td>{event.urgency}</td>
                        <td>{event.eventDate}</td>
                        <td>{event.participationStatus}</td>
                        </tr>
                    ))}
                </tbody>

                <tfoot>
                    <tr>
                        <td colSpan="7">
                        <div className="tfoot-div">
                            <button
                            onClick={() =>
                                setCurrentPageIndex((prevIndex) =>
                                 prevIndex - 1
                                )
                            }
                            disabled={currentPageIndex === 0}
                            >
                            Previous Page
                            </button>

                            <span>Page {currentPageIndex + 1} of {paginatedData.length}</span>

                            <button
                            onClick={() =>
                                setCurrentPageIndex((prevIndex) =>
                                    prevIndex + 1
                                )
                            }
                            disabled={currentPageIndex === paginatedData.length - 1}
                            >
                            Next Page
                            </button>
                        </div>
                        </td>
                    </tr>
                </tfoot>

        </table> 
        </div>


    </div>

    )
}

