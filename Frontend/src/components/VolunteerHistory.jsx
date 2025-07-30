import { useState,  useEffect} from 'react';
import './VolunteerHistory.css';
import './VolunteerDash.css';
import * as VhHelpers from '../helpers/volunteerHistoryHelpers.js';
import NavigationBar from './Navigation.jsx';
import { ArrowUpDown } from 'lucide-react';
import {checkTokenTime} from "../helpers/authHelpers"

export default function VolunteerHistoryTable(){

    // State used to contain sliced volunteer data
    const [paginatedData, setPaginatedData] = useState([]);
    // State used to track current index within table
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // State to track which field is actively being sorted
    const [activeSort, setActiveSort] = useState({
        field: null,      
        direction: null    
    });

    // Wrapper function for sortByField to simplify the process of passing parameters
    function handleSort(field) {

        // Check if field is already being sorted
        const isSameField = activeSort.field === field;

        // Update direction
        // Note: if isSameField is false, we’re switching to a new field,
        // so sorting should start in ascending order by default.
        const newDirection = isSameField && activeSort.direction === "asc" ? "desc" : "asc";

        // Update state of activeSort
        setActiveSort({ field, direction: newDirection });

        // Determine if ascending or not
        const isAscending = newDirection === "asc"; // True or False

        // Call sort field
        VhHelpers.sortByField(paginatedData, setPaginatedData, field, isAscending);
    }


    // Get volunteer history data once on mount
    useEffect(() => {
        async function fetchVolutneerHistory(){

            const res = await VhHelpers.getVolunteerHistory();

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
                    <th>
                        <div className="th-div">
                            Event Name
                            <button
                            className={
                                activeSort.field === "event_name" ? "active" : "not-sorted"
                            }
                            onClick={() => handleSort("event_name")}
                            >
                            <ArrowUpDown size={20} />
                            </button>
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Event Description
                            {/* No sort button here */}
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Location
                            {/* No sort button here */}
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Required Skills
                            {/* No sort button here */}
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Urgency
                            <button
                            className={
                                activeSort.field === "urgency" ? "active" : "not-sorted"
                            }
                            onClick={() => handleSort("urgency")}
                            >
                            <ArrowUpDown size={20} />
                            </button>
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Event Date
                            <button
                            className={
                                activeSort.field === "event_date" ? "active" : "not-sorted"
                            }
                            onClick={() => handleSort("event_date")}
                            >
                            <ArrowUpDown size={20} />
                            </button>
                        </div>
                        </th>

                        <th>
                        <div className="th-div">
                            Participation Status
                            <button
                            className={
                                activeSort.field === "participationStatus" ? "active" : "not-sorted"
                            }
                            onClick={() => handleSort("participation_status")}
                            >
                            <ArrowUpDown size={20} />
                            </button>
                        </div>
                        </th>


                </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 &&
                    paginatedData[currentPageIndex].map((event, i) => (
                        <tr key={i}>
                        <td>{event.event_name}</td>
                        <td>{event.event_description}</td>
                        <td>{event.location_name}</td>
                        <td>{event.required_skills}</td>
                        <td>{event.urgency}</td>
                        <td>{event.date}</td>
                        <td>{event.participation_status}</td>
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

