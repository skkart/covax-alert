import React, { useLayoutEffect, useState } from 'react';
import PropTypes from "prop-types";
import './CenterTable.css';

function CenterTable({ centers, currentDate, availableSwitch }) {
    const [weekDates, setWeekDates] = useState([]);
    const [vaccineCenters, setVaccineCenters] = useState([]);

    useLayoutEffect(() => {
        const weeksArr = [];
        const crrDt = currentDate;
        for (let i = 0; i < 7; i++) {
            weeksArr.push(crrDt.clone().add(i, "days").format("DD-MM-YYYY"));
        }
        setWeekDates(weeksArr);

        const vccCenter = [];
        centers.forEach(ctr => {
            const sessionMap = {};
            ctr.sessions.forEach(session => {
                const date = session.date;
                session.status = session.available_capacity > 0 ? "avilable" : "booked";
                if (!sessionMap[date]) {
                    sessionMap[date] = session;
                }
            })
            ctr.sessionMap = sessionMap;
            vccCenter.push(ctr);
        });
        setVaccineCenters(vccCenter);
    }, [centers, currentDate]);

    return (
        <div className="centerMainBlock">

            <div className="centerTableBlock">
                <div className="centerCalanderBlock">
                    <div className="centerTableRowInner">
                        <div className="calenderVaccineCenter" style={{ width: "21%" }}>Vaccine Centers</div>
                        <div className="centerSlotRow">
                            <span>{"<"}</span>
                            <div className="calenderDates">
                                {
                                    weekDates.map(day => (
                                        <li key={day} className="dayCalander">
                                            <p>
                                                {day}
                                            </p>
                                        </li>
                                    ))
                                }
                            </div>
                            <span>{">"}</span>
                        </div>
                    </div>
                </div>
                <div className="centerSlotTable">
                    {
                        vaccineCenters.length ? vaccineCenters.map(center => (
                            <div className="centerTableRow" key={center.center_id}>
                                <div className="centerTableRowInner">
                                    <div className="centerCellHospital">
                                        <h5 className="centerName">
                                            {center.name}
                                            {
                                                center.fee_type === "Paid" && (<span className="isPaid">Paid</span>)
                                            }
                                        </h5>
                                        <p className="centerAddress">
                                            {center.address}
                                        </p>
                                        <p className="centerPin">
                                            {`PIN:${center.pincode}`}
                                        </p>
                                    </div>
                                    <div className="centerSlotRow">
                                        <ul className="slot">
                                            {
                                                center.sessions &&
                                                weekDates.map(day => (
                                                    <li className="slotInfo" key={day}>
                                                        {
                                                            center.sessionMap[day] && (
                                                                <div className="slotVaccineDiv">
                                                                    <a className={center.sessionMap[day].status}>
                                                                        {center.sessionMap[day].available_capacity > 0 ? center.sessionMap[day].available_capacity : "Booked"}
                                                                    </a>
                                                                    <div className="vaccineType">
                                                                        {center.sessionMap[day].vaccine}
                                                                    </div>
                                                                    <div className="ageType">
                                                                        {`${center.sessionMap[day].min_age_limit}+`}
                                                                    </div>
                                                                </div>)
                                                        }
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <h5>No Vaccination center is available for booking.</h5>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

CenterTable.PropsType = {
    centers: PropTypes.array,
    currentDate: PropTypes.object,
    availableSwitch: PropTypes.bool
}

export default CenterTable;