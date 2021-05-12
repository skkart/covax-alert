import React, { useLayoutEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from "prop-types";
import endpoints from './endpoints';
import axios from 'axios';
import './Preferences.css';


function Preferences({ setUserSetting }) {
    const [timer, setTimer] = useState(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [stateList, setStateList] = useState(window.stateList);
    const [districtList, setDistrictList] = useState(window.districtList);
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
    const watchAllFields = watch();
    const watchSearchBy = watch("SEARCH_BY");
    const watchStateBy = watch("State");
    const watchAge45 = watch("AGE_45");
    const watchAge18 = watch("AGE_18");
    const watchCovishield = watch("Covishield");
    const watchCovaxin = watch("Covaxin");
    const watchFree = watch("Free");
    const watchPaid = watch("Paid");
    const submitRef = useRef(null);

    
    const onPrefSubmit = (dt) => {
        const { State, District, PIN, SEARCH_BY, Paid, Free, Covishield, Covaxin, AGE_18, AGE_45 } = dt;
        const userData = {};
        if (SEARCH_BY && (PIN || District)) {
            sessionStorage.clear();
            sessionStorage.setItem('SEARCH_BY', SEARCH_BY);
            userData.searchBy = SEARCH_BY;
            if (SEARCH_BY === "DISTRICT") {
                sessionStorage.setItem('STATE', State);
                sessionStorage.setItem('District', District);
                sessionStorage.removeItem('PIN');
                const distObj = window.districtList.find(dt => dt.district_name === District);
                userData.districtCode = distObj.district_id;
                userData.districtName = District;
            } else if (SEARCH_BY === "PINCODE") {
                sessionStorage.setItem('PIN', PIN);
                sessionStorage.removeItem('STATE');
                sessionStorage.removeItem('District');
                userData.pinCode = PIN;
            }

            // Submit preferences
            sessionStorage.setItem('Paid', Paid);
            userData.paid = Paid;
            sessionStorage.setItem('Free', Free);
            userData.free = Free;
            sessionStorage.setItem('Covishield', Covishield);
            userData.covishield = Covishield;
            sessionStorage.setItem('Covaxin', Covaxin);
            userData.covaxin = Covaxin;
            sessionStorage.setItem('AGE_18', AGE_18);
            userData.age_18 = AGE_18;
            sessionStorage.setItem('AGE_45', AGE_45);
            userData.age_45 = AGE_45;
            userData.refreshCount = refreshCount;

            setUserSetting(userData);
        }

        if (timer) {
            clearTimeout(timer);
        }

        setTimer(setTimeout(() => {
            setRefreshCount(ct => ct + 1);
            submitRef.current && submitRef.current.click();
          }, 10000));

    };

    useLayoutEffect(() => {
        const srcBy = sessionStorage.getItem('SEARCH_BY');
        setTimeout(() => {
            if (srcBy) {
                setValue("SEARCH_BY", srcBy, {
                    shouldValidate: true,
                    shouldDirty: true
                });

                if (srcBy === "PINCODE") {
                    const pinVal = sessionStorage.getItem('PIN');
                    setValue("PIN", pinVal, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }

                if (srcBy === "DISTRICT") {
                    // Set on load of fetch
                }

                // Set preferences
                const age18Val = sessionStorage.getItem('AGE_18');
                const age45Val = sessionStorage.getItem('AGE_45');
                const Covishield = sessionStorage.getItem("Covishield");
                const Covaxin = sessionStorage.getItem("Covaxin");
                const Paid = sessionStorage.getItem("Paid");
                const Free = sessionStorage.getItem("Free");

                if (age18Val === "true") {
                    setValue("AGE_18", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }
                if (age45Val === "true") {
                    setValue("AGE_45", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }

                if (Covishield === "true") {
                    setValue("Covishield", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }
                if (Covaxin === "true") {
                    setValue("Covaxin", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }

                if (Paid === "true") {
                    setValue("Paid", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }
                if (Free === "true") {
                    setValue("Free", true, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                }
            }

            submitRef.current && submitRef.current.click();
        }, 500)
    }, []);

    useLayoutEffect(() => {
        if (watchSearchBy === "DISTRICT") {
            if (!stateList || !stateList.length) {
                async function fetchStateList() {
                    const stateApiUrl = `${endpoints.cowinApi}/v2/admin/location/states`;
                    const resp = await axios.get(stateApiUrl);
                    if (resp.data && resp.data.states) {
                        window.stateList = resp.data.states;
                        setStateList(window.stateList);
                        setTimeout(() => {
                            const stateVal = sessionStorage.getItem('STATE');
                            setValue("State", stateVal, {
                                shouldValidate: true,
                                shouldDirty: true
                            });
                        }, 500);
                    }

                }
                fetchStateList();
            }
        }

    }, [watchSearchBy]);

    useLayoutEffect(() => {
        if (stateList.length && watchStateBy) {
            async function fetchDistList() {
                const stateObj = stateList.find(st => st.state_name === watchStateBy);
                const distApiUrl = `${endpoints.cowinApi}/v2/admin/location/districts/${stateObj.state_id}`;
                const resp = await axios.get(distApiUrl);
                if (resp.data && resp.data.districts) {
                    window.districtList = resp.data.districts;
                    setDistrictList(window.districtList);
                    setTimeout(() => {
                        const districtVal = sessionStorage.getItem('District');
                        setValue("District", districtVal, {
                            shouldValidate: true,
                            shouldDirty: true
                        });
                        submitRef.current && submitRef.current.click();
                    }, 500);
                }
            }
            fetchDistList();
        }

    }, [stateList, watchStateBy]);

    useLayoutEffect(() => {
        console.log("Filter updated")
        submitRef.current && submitRef.current.click();
    }, [watchAge18, watchAge45, watchCovaxin, watchCovishield, watchFree, watchPaid]);


    return (
        <div>
            Covi Alert
            <form onSubmit={handleSubmit(onPrefSubmit)}>
                <div aria-label="SEARCH BY" className="searchBy">
                    <label className="label">Search by PIN&nbsp;
                    <input {...register("SEARCH_BY", { required: true })} type="radio" value="PINCODE" />
                    </label>
                    <label className="label">Search by District&nbsp;
                    <input {...register("SEARCH_BY", { required: true })} type="radio" value="DISTRICT" />
                    </label>
                </div>
                {
                    watchAllFields.SEARCH_BY === "PINCODE" && (
                        <div className="pinBlock">
                            <label>Enter your PIN&nbsp;
                            <input type="text" placeholder="PIN" {...register("PIN", { required: true, maxLength: 100 })} />
                            </label>
                            <input className="searchButton" type="submit" ref={submitRef} value="Search"/>
                        </div>
                    )
                }
                {
                    watchAllFields.SEARCH_BY === "DISTRICT" && (
                        <div className="distBlock">
                            <label>State&nbsp;
                            <select {...register("State", { required: true })}>
                                    {
                                        stateList && stateList.map((st) => (<option value={st.state_name} key={st.state_name}>{st.state_name}</option>))
                                    }
                                </select>
                            </label>
                            <label>District&nbsp;
                            <select {...register("District", { required: true })}>
                                    {
                                        districtList && districtList.map((dt) => (<option value={dt.district_name} key={dt.district_name}>{dt.district_name}</option>))
                                    }
                                </select>
                            </label>
                            <input className="searchButton" type="submit" ref={submitRef} value="Search"/>
                        </div>
                    )
                }

                {
                    watchAllFields.SEARCH_BY && (
                        <div className="preferenceBlock">
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="18+" {...register("AGE_18", {})} /><span>18+</span>
                            </label>
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="45+" {...register("AGE_45", {})} /><span>45+</span>
                            </label>
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="Covishield" {...register("Covishield", {})} /><span>Covishield</span>
                            </label>
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="Covaxin" {...register("Covaxin", {})} /><span>Covaxin</span>
                            </label>
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="Free" {...register("Free", {})} /><span>Free</span>
                            </label>
                            <label>
                                <input className="badgeCheckbox" type="checkbox" placeholder="Paid" {...register("Paid", {})} /><span>Paid</span>
                            </label>
                        </div>
                    )
                }

            </form>
        </div>
    );
};

Preferences.propTypes = {
    setUserSetting: PropTypes.func
};

export default Preferences;
