import React, { useLayoutEffect, useState, useEffect } from 'react';
import PropTypes from "prop-types";
import endpoints from './endpoints';
import axios from 'axios';
import CenterTable from "./CentersTable";
import moment from "moment";
import SlotControlSwitch from './switch';
import cloneDeep from "lodash/cloneDeep";
import useAudio from './ChatAudio'

function Centers({ searchBy, pinCode, districtCode, covaxin, covishield, age_18, age_45, paid, free, refreshCount }) {
    const [centers, setCenters] = useState([]);
    const [foundResults, setFoundResults] = useState([]);
    const [availableSwitch, setAvailableSwitch] = useState(true);
    const [currentDate, setCurrentDate] = useState(moment());
    const [playing, play] = useAudio();
    
    let vaccine = "";
    if (covaxin && covishield) {
        vaccine = "";
    } else if (covaxin) {
        vaccine = "COVAXIN"
    } else if (covishield) {
        vaccine = "COVISHIELD"
    }

    let min_age_limit = 0;
    if (age_18 && age_45) {
        min_age_limit = 0;
    } else if (age_18) {
        min_age_limit = 18
    } else if (covishield) {
        min_age_limit = 45
    }

    let fee_type = "";
    if (paid && free) {
        fee_type = "";
    } else if (paid) {
        fee_type = "Paid"
    } else if (free) {
        fee_type = "Free"
    }

    useLayoutEffect(() => {
        const todayStr = currentDate.format("DD-MM-YYYY");
        if (searchBy === "PINCODE" && pinCode) {
            async function fetchCentersByPin() {
                const pinApiUrl = `${endpoints.cowinApi}/v2/appointment/sessions/public/calendarByPin?pincode=${pinCode}&date=${todayStr}`;
                const resp = await axios.get(pinApiUrl);
                if (resp.data && resp.data.centers) {
                    setCenters(resp.data.centers);
                }

            }
            fetchCentersByPin();
        } else if (searchBy === "DISTRICT" && districtCode) {
            async function fetchCentersByDistrict() {
                const distApiUrl = `${endpoints.cowinApi}/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtCode}&date=${todayStr}`;
                const resp = await axios.get(distApiUrl);
                if (resp.data && resp.data.centers) {
                    setCenters(resp.data.centers);
                }

            }
            fetchCentersByDistrict();
        }
    }, [pinCode, districtCode, currentDate, refreshCount]);

    useLayoutEffect(() => {
        const foundCenters = [];
        centers.forEach((center) => {
            if (fee_type && fee_type !== center.fee_type) {
                return;
            }
            let isFound = false;
            const newAvSessions = [];
            center.sessions.forEach(session => {
                if (vaccine && vaccine !== session.vaccine) {
                    return;
                }
                if (min_age_limit && min_age_limit !== session.min_age_limit) {
                    return;
                }

                if (session.available_capacity > 0) {
                    isFound = true;
                    newAvSessions.push(session);
                }
            });
            if (isFound) {
                const clonedCenter = cloneDeep(center);
                clonedCenter.sessions = newAvSessions;
                foundCenters.push(clonedCenter);
            }
        });
        if (foundCenters.length) {
            !playing && play();
        }
        setFoundResults(foundCenters);
        console.log(foundCenters);

    }, [centers, covaxin, covishield, age_18, age_45, paid, free]);

    const coviCenters = availableSwitch ? foundResults : centers;

    return (
        <div className="centers">
            {/* <ul>
                {
                    foundResults && foundResults.map(ctr => <li key={ctr.center_id}>{ctr.name}</li>)
                }
            </ul> */}
            <SlotControlSwitch availableSwitch={availableSwitch} onSwitch={() => setAvailableSwitch(val => !val)} />
            <CenterTable centers={coviCenters} availableSwitch={availableSwitch} currentDate={currentDate} />
        </div>
    );
}

Centers.propTypes = {
    searchBy: PropTypes.string,
    pinCode: PropTypes.string,
    districtCode: PropTypes.number,
    districtName: PropTypes.string,
    paid: PropTypes.bool,
    free: PropTypes.bool,
    covaxin: PropTypes.bool,
    covishield: PropTypes.bool,
    age_18: PropTypes.bool,
    age_45: PropTypes.bool,
    refreshCount: PropTypes.number
}

export default Centers;