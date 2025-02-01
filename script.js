const payGrades = {
    "6": {"basicSalary": 84000, "probationPeriodMonths": 12, "probationSalary": null, "mainSalaryDuringProbation": true},
    "9": {"basicSalary": 52800, "probationPeriodMonths": 12, "probationSalary": null, "mainSalaryDuringProbation": true},
    "13": {"basicSalary": 31200, "probationPeriodMonths": 12, "probationSalary": null, "mainSalaryDuringProbation": true},
    "15": {"basicSalary": 24000, "probationPeriodMonths": 12, "probationSalary": null, "mainSalaryDuringProbation": true},
    "8": {"basicSalary": 62400, "probationPeriodMonths": 24, "probationSalary": 35600, "mainSalaryDuringProbation": false},
    "10": {"basicSalary": 48000, "probationPeriodMonths": 24, "probationSalary": 27100, "mainSalaryDuringProbation": false},
    "16": {"basicSalary": 21600, "probationPeriodMonths": 24, "probationSalary": 17045, "mainSalaryDuringProbation": false},
    "17": {"basicSalary": 20400, "probationPeriodMonths": 24, "probationSalary": 16550, "mainSalaryDuringProbation": false},
    "18": {"basicSalary": 18600, "probationPeriodMonths": 24, "probationSalary": 16220, "mainSalaryDuringProbation": false},
    "20": {"basicSalary": 16800, "probationPeriodMonths": 24, "probationSalary": 15550, "mainSalaryDuringProbation": false},
};

function calculateMonthlySalary() {
    const payGrade = document.getElementById('payGrade').value;
    const joiningDateStr = document.getElementById('joiningDate').value;
    const selectedMonth = parseInt(document.getElementById('selectedMonth').value, 10);
    const selectedYear = parseInt(document.getElementById('selectedYear').value, 10);

    if (!(payGrade in payGrades)) {
        document.getElementById('salaryDetails').textContent = "Invalid pay grade.";
        return;
    }

    let joiningDate;
    try {
        joiningDate = new Date(joiningDateStr);
    } catch (e) {
        document.getElementById('salaryDetails').textContent = "Invalid joining date format. Use YYYY-MM-DD.";
        return;
    }

    const gradeDetails = payGrades[payGrade];
    const basicSalary = gradeDetails.basicSalary;
    const probationPeriodMonths = gradeDetails.probationPeriodMonths;
    const probationSalary = gradeDetails.probationSalary;
    const mainSalaryDuringProbation = gradeDetails.mainSalaryDuringProbation;
    const dayInAMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    ///////////////////////////
    const selectedDate = new Date(selectedYear, selectedMonth - 1, dayInAMonth);

    if (selectedDate < joiningDate) {
        document.getElementById('salaryDetails').textContent = "Selected date is before joining date.";
        return;
    }

    // const financialYearStart = selectedMonth >= 7 ? new Date(selectedYear, 6, 1) : new Date(selectedYear - 1, 6, 1);
    // const currentFinancialYear = selectedMonth >= 7 ? selectedYear : selectedYear - 1;
    // const monthsSinceJoining = (selectedDate.getFullYear() - joiningDate.getFullYear()) * 12 + (selectedDate.getMonth() - joiningDate.getMonth()) + (selectedDate.getDate() - joiningDate.getDate()) / dayInAMonth;
    // const onProbation = monthsSinceJoining <= probationPeriodMonths;
    // const yearsSinceJoining = (selectedDate - joiningDate) / (1000 * 60 * 60 * 24 * 365);
    // const incrementYears = Math.floor(Math.max(0, yearsSinceJoining - ((probationPeriodMonths + 6) / 12)));
    const financialYearStart = selectedMonth >= 7 ? new Date(selectedYear, 6, 1) : new Date(selectedYear - 1, 6, 1);
    const currentFinancialYear = (financialYearStart.getMonth() == 6 ? financialYearStart.getFullYear() : financialYearStart.getFullYear() + 1);
    const monthsSinceJoining = (selectedDate.getFullYear() - joiningDate.getFullYear()) * 12 + (selectedDate.getMonth() - joiningDate.getMonth()) + (selectedDate.getDate() - joiningDate.getDate()) / dayInAMonth;
    const onProbation = monthsSinceJoining <= probationPeriodMonths;
    const yearsSinceJoining = (selectedDate - joiningDate) / (1000 * 60 * 60 * 24 * 365);
    const incrementYears = Math.floor(Math.max(0, yearsSinceJoining - Math.floor((probationPeriodMonths + 6) / 12)));
//////////////////

    const incrementRate = parseInt(payGrade, 10) <= 10 ? 1.04 : 1.05;

    const basicSalaryWithIncrements = basicSalary * (incrementRate ** incrementYears);

    const govIncentive = currentFinancialYear >= 2023 ? Math.max(1000, 0.05 * basicSalaryWithIncrements) : 0;

    function calculateAllowances(basicSalary) {
        const houseRent = 0.40 * basicSalary;
        const projectAllowance = 0.40 * basicSalary;
        const medicalAllowance = 2500;
        return [houseRent, projectAllowance, medicalAllowance];
    }

    function proratedSalary(salary, days, totalDays) {
        return (salary / totalDays) * days;
    }

    const salaryDetails = {
        "Month": selectedMonth,
        "Year": selectedYear
    };

    if (onProbation) {
        if (mainSalaryDuringProbation) {
            const projectAllowance = 0.40 * basicSalaryWithIncrements;
            const medicalAllowance = 2500;
            const houseRent = 0;
            if (selectedMonth === joiningDate.getMonth() + 1 && selectedYear === joiningDate.getFullYear()) {
                const dutyDays = dayInAMonth - joiningDate.getDate();
                salaryDetails[`${dutyDays} Days of 1st Month Basic Salary`] = Math.round(proratedSalary(basicSalaryWithIncrements, dutyDays, dayInAMonth));
                salaryDetails[`${dutyDays} Days of 1st Month House Rent`] = houseRent;
                salaryDetails[`${dutyDays} Days of 1st Month Project Allowance`] = Math.round(proratedSalary(projectAllowance, dutyDays, dayInAMonth));
                salaryDetails[`${dutyDays} Days of 1st Month Medical Allowance`] = Math.round(proratedSalary(medicalAllowance, dutyDays, dayInAMonth));
                salaryDetails["Gov. Incentive"] = Math.round(govIncentive);
                salaryDetails[`${dutyDays} Days of 1st Month Total Salary`] = Math.round(
                    proratedSalary(basicSalaryWithIncrements, dutyDays, dayInAMonth) +
                    proratedSalary(projectAllowance, dutyDays, dayInAMonth) +
                    proratedSalary(medicalAllowance, dutyDays, dayInAMonth) +
                    govIncentive
                );
            } else {
                salaryDetails["Basic Salary"] = Math.round(basicSalaryWithIncrements);
                salaryDetails["House Rent"] = houseRent;
                salaryDetails["Project Allowance"] = Math.round(projectAllowance);
                salaryDetails["Medical Allowance"] = medicalAllowance;
                salaryDetails["Gov. Incentive"] = Math.round(govIncentive);
                salaryDetails["Total Salary"] = Math.round(basicSalaryWithIncrements + projectAllowance + medicalAllowance + govIncentive);
            }
        } else {
            if (selectedMonth === joiningDate.getMonth() + 1 && selectedYear === joiningDate.getFullYear()) {
                const dutyDays = dayInAMonth - joiningDate.getDate();
                salaryDetails[`${dutyDays} Days of 1st Month Probation Salary`] = Math.round(proratedSalary(probationSalary, dutyDays, dayInAMonth));
                salaryDetails["Gov. Incentive"] = 0;
            } else {
                salaryDetails["Probation Salary"] = probationSalary;
                salaryDetails["Gov. Incentive"] = 0;
            }
        }
    } else {
        const [houseRent, projectAllowance, medicalAllowance] = calculateAllowances(basicSalaryWithIncrements);
        const probationEndDate = new Date(joiningDate);
        probationEndDate.setMonth(probationEndDate.getMonth() + probationPeriodMonths);
        if (selectedMonth === probationEndDate.getMonth() + 1 && selectedYear === probationEndDate.getFullYear()) {
            const mainSalaryDays = Math.round((monthsSinceJoining - probationPeriodMonths) * dayInAMonth);
            const probationSalaryDays = dayInAMonth - mainSalaryDays;
            const tranProbationSalary = proratedSalary(probationSalary, probationSalaryDays, dayInAMonth);
            const tranMainSalary = proratedSalary(basicSalaryWithIncrements, mainSalaryDays, dayInAMonth);
            const [tranHouseRent, tranProjectAllowance, tranMedicalAllowance] = calculateAllowances(tranMainSalary);
            const totalSalary = tranProbationSalary + tranMainSalary + tranHouseRent + tranProjectAllowance + tranMedicalAllowance;
            salaryDetails[`${probationSalaryDays} Days of Probation Salary`] = Math.round(tranProbationSalary);
            salaryDetails[`${mainSalaryDays} Days of Basic Salary`] = Math.round(tranMainSalary);
            salaryDetails[`${mainSalaryDays} Days of House Rent`] = Math.round(tranHouseRent);
            salaryDetails[`${mainSalaryDays} Days of Project Allowance`] = Math.round(tranProjectAllowance);
            salaryDetails[`${mainSalaryDays} Days of Medical Allowance`] = Math.round(tranMedicalAllowance);
            salaryDetails["Gov. Incentive"] = Math.round(govIncentive);
            salaryDetails["Total Salary"] = Math.round(totalSalary);
        } else {
            const totalSalary = basicSalaryWithIncrements + houseRent + projectAllowance + medicalAllowance + govIncentive;
            salaryDetails["Basic Salary"] = Math.round(basicSalaryWithIncrements);
            salaryDetails["House Rent"] = Math.round(houseRent);
            salaryDetails["Project Allowance"] = Math.round(projectAllowance);
            salaryDetails["Medical Allowance"] = medicalAllowance;
            salaryDetails["Gov. Incentive"] = Math.round(govIncentive);
            salaryDetails["Total Salary"] = Math.round(totalSalary);
        }
    }

    document.getElementById('salaryDetails').textContent = JSON.stringify(salaryDetails, null, 2);
}
