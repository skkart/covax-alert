import React, { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from "prop-types";
import endpoints from './endpoints';
import axios from 'axios';
import './Preferences.css';


function Preferences({setUserSetting}) {
    const [stateList, setStateList] = useState(window.stateList);
    const [districtList, setDistrictList] = useState(window.districtList);
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
    const watchAllFields = watch();
    const watchSearchBy = watch("SEARCH_BY");
    const watchStateBy = watch("State");
    console.log(watchAllFields);

    const onPrefSubmit = (dt) => {
        const { State, District, PIN, SEARCH_BY, Paid, Free, Covishield, Covaxin, AGE_18, AGE_45 } = dt;
        const userData = {};
        if (SEARCH_BY && (PIN || District)) {
            console.log("submit", dt);
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

            setUserSetting(userData);
        }
       
    };

    useLayoutEffect(() => {
        console.log("useLayoutEffect")
        const srcBy = sessionStorage.getItem('SEARCH_BY');
        setTimeout(() => {
            if (srcBy) {
                console.log("useLayoutEffect srcBy")
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
        }, 500)
    }, []);

    useLayoutEffect(() => {
        if (watchSearchBy === "DISTRICT") {
            if (!stateList || !stateList.length) {
                async function fetchStateList() {
                    console.log("Fetch state")
                    const stateApiUrl = `${endpoints.cowinApi}/v2/admin/location/states`;
                    const resp = await axios.get(stateApiUrl);
                    console.log(resp);
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
                console.log("Fetch district")
                const distApiUrl = `${endpoints.cowinApi}/v2/admin/location/districts/${stateObj.state_id}`;
                const resp = await axios.get(distApiUrl);
                console.log(resp);
                if (resp.data && resp.data.districts) {
                    window.districtList = resp.data.districts;
                    setDistrictList(window.districtList);
                    setTimeout(() => {
                        const districtVal = sessionStorage.getItem('District');
                        setValue("District", districtVal, {
                            shouldValidate: true,
                            shouldDirty: true
                        });
                    }, 500);
                }
            }
            fetchDistList();
        }

    }, [stateList, watchStateBy])

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
                        </div>
                    )
                }

                {
                    watchAllFields.SEARCH_BY && (
                        <div className="preferenceBlock">
                            <label>18+
                                <input type="checkbox" placeholder="18+" {...register("AGE_18", {})} />
                            </label>
                            <label>45+
                                <input type="checkbox" placeholder="45+" {...register("AGE_45", {})} />
                            </label>
                            <label>Covishield
                                <input type="checkbox" placeholder="Covishield" {...register("Covishield", {})} />
                            </label>
                            <label>Covaxin
                                <input type="checkbox" placeholder="Covaxin" {...register("Covaxin", {})} />
                            </label>
                            <label>Free
                                <input type="checkbox" placeholder="Free" {...register("Free", {})} />
                            </label>
                            <label>Paid
                                <input type="checkbox" placeholder="Paid" {...register("Paid", {})} />
                            </label>
                        </div>
                    )
                }

                <input type="submit" />

            </form>
        </div>
    );
};

Preferences.propTypes = {
    setUserSetting: PropTypes.func
};

export default Preferences;
