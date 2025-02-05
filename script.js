const el = document.getElementById("wrapper")
const toggleButton = document.getElementById("menu-toggle")

toggleButton.onclick = () => {
  el.classList.toggle("toggled")
}

// Attendance Chart
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("attendanceChart").getContext("2d")
  // Import Chart.js library.  This assumes Chart.js is included in your HTML file via a `<script>` tag.
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["On Time", "Late", "WFH", "Absent", "Sick Leave"],
      datasets: [
        {
          data: [1254, 32, 658, 14, 68],
          backgroundColor: ["#4e73df", "#f6c23e", "#1cc88a", "#e74a3b", "#36b9cc"],
          hoverBackgroundColor: ["#2e59d9", "#dda20a", "#13855c", "#be2617", "#2a96a5"],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false,
      },
      cutoutPercentage: 80,
    },
  })
})

// Form navigation functions
function showProfileForm() {
  document.getElementById("profileSection").style.display = "block"
  document.getElementById("dashboardContent").style.display = "none"
}

function showDashboard() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "block"
}

// Add event listener to show dashboard on page load
document.addEventListener("DOMContentLoaded", showDashboard)

// Profile photo update function
function updateProfilePhoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      document.getElementById("profileImage").src = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Initialize Bootstrap tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

