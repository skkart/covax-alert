import React, { useLayoutEffect, useState } from 'react';
import PropTypes from "prop-types";
import endpoints from './endpoints';
import axios from 'axios';

function Centers({ searchBy, pinCode, districtCode, covaxin, covishield, age_18, age_45, paid, free }) {
    const [centers, setCenters] = useState([]);
    const [foundResults, setFoundResults] = useState([]);

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
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        today = dd + '-' + mm + '-' + yyyy;
        if (searchBy === "PINCODE" && pinCode) {
            async function fetchCentersByPin() {
                console.log("Fetch state")
                const pinApiUrl = `${endpoints.cowinApi}/v2/appointment/sessions/public/calendarByPin?pincode=${pinCode}&date=${today}`;
                const resp = await axios.get(pinApiUrl);
                console.log(resp);
                if (resp.data && resp.data.centers) {
                    setCenters(resp.data.centers);
                }

            }
            fetchCentersByPin();
        } else if (searchBy === "DISTRICT" && districtCode) {
            async function fetchCentersByDistrict() {
                console.log("Fetch state")
                const distApiUrl = `${endpoints.cowinApi}/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtCode}&date=${today}`;
                const resp = await axios.get(distApiUrl);
                console.log(resp);
                if (resp.data && resp.data.centers) {
                    setCenters(resp.data.centers);
                }

            }
            fetchCentersByDistrict();
        }
    }, [pinCode, districtCode]);

    useLayoutEffect(() => {
        const foundCenters = [];
        centers.forEach((center) => {
            if (fee_type && fee_type !== center.fee_type) {
                return;
            }
            let isFound = false;
            center.sessions.forEach(session => {
                if (vaccine && vaccine !== session.vaccine) {
                    return;
                }
                if (min_age_limit && min_age_limit !== session.min_age_limit) {
                    return;
                }

                if (session.available_capacity === 0) {
                    isFound = true;
                    return true;
                }
            });
            if (isFound) {
                foundCenters.push(center);
            }
        });
        setFoundResults(foundCenters);
        console.log(foundCenters);

    }, [centers, covaxin, covishield, age_18, age_45, paid, free])

    return (
        <div className="centers">
            <ul>
                {
                    foundResults && foundResults.map(ctr => <li key={ctr.center_id}>{ctr.name}</li>)
                }
            </ul>
        </div>
    );
}

Centers.propTypes = {
    searchBy: PropTypes.string,
    pinCode: PropTypes.string,
    districtCode: PropTypes.string,
    districtName: PropTypes.string,
    paid: PropTypes.bool,
    free: PropTypes.bool,
    covaxin: PropTypes.bool,
    covishield: PropTypes.bool,
    age_18: PropTypes.bool,
    age_45: PropTypes.bool
}

export default Centers;