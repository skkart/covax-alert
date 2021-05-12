import React, { useState } from 'react';
import PropTypes from "prop-types";
import './switch.css';

function SlotControlSwitch({ onSwitch, availableSwitch }) {
    // const [switchVal, setSwitchVal] = useState(switchState);
    return (
        <label className="switch">
            <input type="checkbox" checked={availableSwitch} onClick={onSwitch}/>
            <div className="slider round">
                <span className="on">Available</span>
                <span className="off">ALL</span>
            </div>
        </label>
    )
};

SlotControlSwitch.propTypes = {
    onSwitch: PropTypes.func,
    availableSwitch: PropTypes.bool
};

export default SlotControlSwitch;