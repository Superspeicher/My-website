document.addEventListener("DOMContentLoaded", () => {
    const primaryMedics = ["Laxshan", "Gio", "Leroy", "Vaniel", "Zul", "Danick", "Gabriel", "Sachin", "Jun Qiang", "Aqml", "Jaswanth", "Yuheng"];
    const additionalMedics = ["JCMC"];
    const blockOutDates = {};
    const numDays = 31;  // maximum number of days in month
    let selectedMonth = new Date().getMonth();

    const primaryMedicsContainer = document.getElementById("primaryMedicsContainer");
    const additionalMedicsContainer = document.getElementById("additionalMedicsContainer");
    const calendarContainer = document.getElementById("calendarContainer");
    const monthSelect = document.getElementById("monthSelect");

    // initialize month select dropdown
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthSelect.innerHTML = months.map((month, index) => `<option value="${index}" ${index === selectedMonth ? 'selected' : ''}>${month}</option>`).join('');

    // generate medic boxes for primary group
    primaryMedics.forEach(medic => {
        createMedicBox(medic, primaryMedicsContainer);
    });

    // generate single calendar for additional medics
    const additionalMedicsBox = document.getElementById("additionalMedicsBox");
    const additionalMedicsDateInput = document.getElementById("additionalMedicsDateInput");
    flatpickr(additionalMedicsDateInput, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        inline: true,
        onChange: (selectedDates) => handleAdditionalMedicDateChange(selectedDates)
    });

    // handle month selection
    monthSelect.addEventListener("change", (e) => {
        selectedMonth = parseInt(e.target.value, 10);
        updateCalendars();
    });

    function createMedicBox(medic, container) {
        const medicBox = document.createElement("div");
        medicBox.classList.add("medicBox");
        medicBox.textContent = medic;

        const dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.classList.add("dateInput");
        medicBox.appendChild(dateInput);

        container.appendChild(medicBox);

        flatpickr(dateInput, {
            mode: "multiple",
            dateFormat: "Y-m-d",
            inline: true,
            onChange: (selectedDates) => handleDateChange(selectedDates, medic)
        });

        medicBox.addEventListener('mouseenter', () => {
            medicBox.classList.add('active');
        });
        medicBox.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!dateInput.matches(':hover') && !medicBox.matches(':hover')) {
                    medicBox.classList.remove('active');
                }
            }, 100);
        });
        dateInput.addEventListener('mouseenter', () => {
            medicBox.classList.add('active');
        });
        dateInput.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!dateInput.matches(':hover') && !medicBox.matches(':hover')) {
                    medicBox.classList.remove('active');
                }
            }, 100);
        });
    }

    function updateCalendars() {
        document.querySelectorAll(".dateInput").forEach(input => {
            flatpickr(input, {
                mode: "multiple",
                dateFormat: "Y-m-d",
                inline: true,
                defaultDate: null //no default date
            });
        });
    }
    
    function handleDateChange(selectedDates, medic) {
        if (!blockOutDates[medic]) {
            blockOutDates[medic] = [];
        }

        blockOutDates[medic] = selectedDates.map(date => {
            const dateObj = new Date(date);
            return dateObj.getDate();
        });
    }

    function handleAdditionalMedicDateChange(selectedDates) {
        additionalMedics.forEach(medic => {
            if (!blockOutDates[medic]) {
                blockOutDates[medic] = [];
            }

            blockOutDates[medic] = selectedDates.map(date => {
                const dateObj = new Date(date);
                return dateObj.getDate();
            });
        });
    }

    document.getElementById("generateDuties").addEventListener("click", () => {
        const assignments = generateDuties();
        populateCalendarTable(assignments);
    });

    function isSaturday(day, month, year) {
        const date = new Date(year, month, day);
        return date.getDay() === 6; // 6 is Saturday
    }

    function generateDuties() {
        const assignments = {};
        const availableDays = Array.from({ length: numDays }, (_, i) => i + 1);

        // Remove blocked days and Saturdays
        const blockedDays = Object.values(blockOutDates).flat();
        const year = new Date().getFullYear();
        const availableDaysForDuty = availableDays.filter(day => {
            const isBlocked = blockedDays.includes(day);
            const isWeekend = isSaturday(day, selectedMonth, year);
            return !isBlocked && !isWeekend;
        });

        // randomly assign a medic to each available day, future updates to favour one person?
        availableDaysForDuty.forEach(day => {
            const randomMedic = primaryMedics[Math.floor(Math.random() * primaryMedics.length)];
            if (!assignments[day]) {
                assignments[day] = {};
            }

            if (!isDateUnavailable(day, randomMedic)) {
                assignments[day][randomMedic] = 'Duty';
            }
        });

        return assignments;
    }

    function isDateUnavailable(day, medic) {
        return (blockOutDates[medic] && blockOutDates[medic].includes(day));
    }

    function populateCalendarTable(assignments) {
        const year = new Date().getFullYear();
        const firstDay = new Date(year, selectedMonth, 1);
        const lastDay = new Date(year, selectedMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        let tableHtml = `<table><thead><tr><th>Date</th><th>Day</th>`;
        primaryMedics.forEach(medic => {
            tableHtml += `<th>${medic}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, selectedMonth, day);
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
            const isWeekend = (currentDate.getDay() === 0 || currentDate.getDay() === 6) ? 'weekend' : '';

            tableHtml += `<tr class="${isWeekend}"><td>${day}</td><td>${dayOfWeek}</td>`;
            primaryMedics.forEach(medic => {
                let cellClass = '';
                if (blockOutDates[medic] && blockOutDates[medic].includes(day)) {
                    cellClass = 'blocked';
                } else if (assignments[day] && assignments[day][medic] === 'Duty') {
                    cellClass = 'duty';
                }
                tableHtml += `<td class="${cellClass}">${cellClass ? (cellClass === 'blocked' ? 'X' : 'Duty') : ''}</td>`;
            });
            tableHtml += `</tr>`;
        }

        tableHtml += `</tbody></table>`;
        calendarContainer.innerHTML = tableHtml;
    }

    updateCalendars();
});
