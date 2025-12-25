// DOM Elements
const form = document.getElementById('log-form');
const dateInput = document.getElementById('date-input');
const exerciseInput = document.getElementById('exercise-input');
const weightInput = document.getElementById('weight-input');
const exerciseList = document.getElementById('exercise-list');
const exerciseFilter = document.getElementById('exercise-filter');
const ctx = document.getElementById('progressChart').getContext('2d');

// Chart Instance
let chart;

// Color Palette
const accentColor = '#bb86fc';
const gridColor = '#333';
const textColor = '#e0e0e0';

// Initialize
(async () => {
    // Set today's date
    dateInput.valueAsDate = new Date(); // Local time

    await loadAndRenderData();
})();

// Data Parsing Helper
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length < 3) continue; // Skip malformed

        // date, exercise, weight
        result.push({
            date: currentLine[0],
            exercise: currentLine[1],
            weight: parseFloat(currentLine[2])
        });
    }
    return result;
}

// Main logic to fetch data and update UI
async function loadAndRenderData(specificExercise = null) {
    const response = await window.api.getData();
    if (!response.success) {
        console.error('Failed to load data', response.error);
        return;
    }

    const allData = parseCSV(response.data);

    // Update Exercise Lists (Unique exercises)
    const uniqueExercises = [...new Set(allData.map(d => d.exercise))].sort();
    updateExerciseDropdowns(uniqueExercises);

    // If no specific filter enabled, try to default to the last used or first available
    // But prompt says "When an exercise is selected, the chart updates". 
    // Let's default to the *most recent* exercise added, or empty state.

    let currentExercise = specificExercise || exerciseFilter.value;

    // If "all" (default) or invalid, pick the first one if exists
    if ((currentExercise === 'all' || !currentExercise) && uniqueExercises.length > 0) {
        currentExercise = uniqueExercises[0];
        exerciseFilter.value = currentExercise;
    }

    const filteredData = allData
        .filter(d => d.exercise === currentExercise)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    renderChart(filteredData, currentExercise);
}

function updateExerciseDropdowns(exercises) {
    // Datalist for input
    exerciseList.innerHTML = exercises.map(ex => `<option value="${ex}">`).join('');

    // Select for filter
    // Preserve current selection if possible
    const currentSelection = exerciseFilter.value;

    let optionsHtml = `<option value="all" disabled>Select Exercise...</option>`;
    exercises.forEach(ex => {
        optionsHtml += `<option value="${ex}" ${ex === currentSelection ? 'selected' : ''}>${ex}</option>`;
    });
    exerciseFilter.innerHTML = optionsHtml;
}

function renderChart(data, label) {
    // Destroy old chart if exists
    if (chart) {
        chart.destroy();
    }

    // If no data, just show empty
    if (!data || data.length === 0) return;

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: `${label} Progress`,
                data: data.map(d => d.weight),
                borderColor: accentColor,
                backgroundColor: 'rgba(187, 134, 252, 0.1)',
                borderWidth: 2,
                tension: 0.3, // smooth curves
                pointRadius: 4,
                pointBackgroundColor: accentColor,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            }
        }
    });
}

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entry = {
        date: dateInput.value,
        exercise: exerciseInput.value,
        weight: weightInput.value
    };

    const res = await window.api.saveData(entry);
    if (res.success) {
        // success notification could go here
        // Refresh data
        exerciseFilter.value = entry.exercise; // Switch view to what we just added
        await loadAndRenderData(entry.exercise);

        // Clear weight but keep date/exercise as user might add another set? 
        // Usually logging Prs, maybe clear weight.
        weightInput.value = '';
    } else {
        alert('Error saving data: ' + res.error);
    }
});

exerciseFilter.addEventListener('change', (e) => {
    loadAndRenderData(e.target.value);
});
