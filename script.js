const el = document.getElementById("wrapper")
const toggleButton = document.getElementById("menu-toggle")

toggleButton.onclick = () => {
  el.classList.toggle("toggled")
}

// Attendance Chart
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("attendanceChart").getContext("2d")
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
  document.getElementById("profileSection").classList.add("fade-in")
}

function showDashboard() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "block"
  document.getElementById("dashboardContent").classList.add("fade-in")
}

// Add event listener to show dashboard on page load
document.addEventListener("DOMContentLoaded", showDashboard)

// Profile photo update function
function updateProfilePhoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const profileImage = document.getElementById("profileImage")
      profileImage.src = e.target.result
      profileImage.classList.add("fade-in")
    }
    reader.readAsDataURL(file)
  }
}

// Initialize Bootstrap tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

// Punch In/Out functionality
let isPunchedIn = false
let punchInTime = null
let timerInterval = null

const punchButton = document.getElementById("punchButton")
const punchStatus = document.getElementById("punchStatus")
const punchDateTime = document.getElementById("punchDateTime")
const punchTime = document.getElementById("punchTime")
const selfieContainer = document.getElementById("selfieContainer")
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const captureButton = document.getElementById("captureButton")
const selfieImage = document.getElementById("selfieImage")

function updateTimer() {
  const now = new Date()
  const timeDiff = now - punchInTime
  const hours = Math.floor(timeDiff / 3600000)
  const minutes = Math.floor((timeDiff % 3600000) / 60000)
  const seconds = Math.floor((timeDiff % 60000) / 1000)
  punchTime.textContent = `Time elapsed: ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function formatDateTime(date) {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

function saveAttendance(type, time, imageDataUrl) {
  const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
  attendance.push({ type, time, imageDataUrl })
  localStorage.setItem("attendance", JSON.stringify(attendance))
  displayAttendance()
}

punchButton.addEventListener("click", () => {
  if (!isPunchedIn) {
    // Punch In
    isPunchedIn = true
    punchInTime = new Date()
    punchButton.textContent = "Punch Out"
    punchStatus.textContent = "You are currently punched in."
    punchDateTime.textContent = `Punch In: ${formatDateTime(punchInTime)}`
    timerInterval = setInterval(updateTimer, 1000)
    selfieContainer.style.display = "block"
    startCamera()
    video.style.display = "block"
    captureButton.style.display = "inline-block"
    selfieImage.style.display = "none"
    punchButton.classList.add("btn-danger")
    punchButton.classList.remove("btn-primary")
  } else {
    // Punch Out
    isPunchedIn = false
    clearInterval(timerInterval)
    const punchOutTime = new Date()
    punchButton.textContent = "Punch In"
    punchStatus.textContent = "You have punched out."
    punchDateTime.textContent += ` | Punch Out: ${formatDateTime(punchOutTime)}`
    punchTime.textContent = `Total time: ${punchTime.textContent.split(": ")[1]}`
    selfieContainer.style.display = "block"
    startCamera()
    video.style.display = "block"
    captureButton.style.display = "inline-block"
    selfieImage.style.display = "none"
    punchButton.classList.add("btn-primary")
    punchButton.classList.remove("btn-danger")
  }
})

captureButton.addEventListener("click", () => {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageDataUrl = canvas.toDataURL("image/jpeg")

  // Display the captured image
  selfieImage.src = imageDataUrl
  selfieImage.style.display = "block"
  selfieImage.classList.add("fade-in")
  video.style.display = "none"
  captureButton.style.display = "none"

  // Stop the camera
  stopCamera()

  // Save attendance data
  saveAttendance(isPunchedIn ? "punch_in" : "punch_out", new Date(), imageDataUrl)

  // Show notification
  showNotification("Attendance recorded successfully!", "success")
})

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream
      video.play()
    })
    .catch((err) => {
      console.log("An error occurred: " + err)
    })
}

function stopCamera() {
  const stream = video.srcObject
  const tracks = stream.getTracks()

  tracks.forEach((track) => {
    track.stop()
  })

  video.srcObject = null
}

// Function to display attendance data
function displayAttendance() {
  const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
  const attendanceTableBody = document.getElementById("attendanceTableBody")
  attendanceTableBody.innerHTML = ""

  const groupedAttendance = groupAttendanceByDate(attendance)

  for (const [date, records] of Object.entries(groupedAttendance)) {
    let punchInTime = ""
    let punchInSelfie = ""
    let punchOutTime = ""
    let punchOutSelfie = ""
    let totalTime = ""

    records.forEach((record) => {
      const time = new Date(record.time).toLocaleTimeString()
      const selfie = `<img src="${record.imageDataUrl}" alt="Selfie" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">`

      if (record.type === "punch_in") {
        punchInTime = time
        punchInSelfie = selfie
      } else {
        punchOutTime = time
        punchOutSelfie = selfie
      }
    })

    if (punchInTime && punchOutTime) {
      const punchIn = new Date(`${date} ${punchInTime}`)
      const punchOut = new Date(`${date} ${punchOutTime}`)
      const diff = punchOut - punchIn
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      totalTime = `${hours}h ${minutes}m`
    }

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${date}</td>
            <td>${punchInTime}</td>
            <td>${punchInSelfie}</td>
            <td>${punchOutTime}</td>
            <td>${punchOutSelfie}</td>
            <td>${totalTime}</td>
        `
    attendanceTableBody.appendChild(row)
  }
}

// Call displayAttendance when the page loads
document.addEventListener("DOMContentLoaded", displayAttendance)

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    })
  })
})

// Add animation to cards on hover
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-5px)"
    card.style.boxShadow = "0 0.5rem 2rem 0 rgba(58, 59, 69, 0.2)"
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)"
    card.style.boxShadow = "0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)"
  })
})

// Implement a simple dark mode toggle
const darkModeToggle = document.createElement("button")
darkModeToggle.textContent = "Toggle Dark Mode"
darkModeToggle.classList.add("btn", "btn-secondary", "position-fixed", "bottom-0", "end-0", "m-3")
document.body.appendChild(darkModeToggle)

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode")
})

// Add dark mode styles
const style = document.createElement("style")
style.textContent = `
  body.dark-mode {
    background-color: #1a1a1a;
    color: #f0f0f0;
  }

  body.dark-mode .card {
    background-color: #2a2a2a;
    color: #f0f0f0;
  }

  body.dark-mode .bg-white {
    background-color: #2a2a2a !important;
  }

  body.dark-mode .text-dark {
    color: #f0f0f0 !important;
  }

  body.dark-mode .navbar {
    background-color: #2a2a2a !important;
  }

  body.dark-mode .list-group-item {
    background-color: #2a2a2a;
    color: #f0f0f0;
  }

  body.dark-mode .form-control {
    background-color: #3a3a3a;
    color: #f0f0f0;
    border-color: #4a4a4a;
  }

  body.dark-mode .btn-outline-light {
    color: #f0f0f0;
    border-color: #f0f0f0;
  }

  body.dark-mode .btn-outline-light:hover {
    background-color: #f0f0f0;
    color: #2a2a2a;
  }
`
document.head.appendChild(style)

// Implement a simple loading animation
const loadingOverlay = document.createElement("div")
loadingOverlay.id = "loadingOverlay"
loadingOverlay.innerHTML =
  '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>'
document.body.appendChild(loadingOverlay)

// Add loading overlay styles
const loadingStyle = document.createElement("style")
loadingStyle.textContent = `
  #loadingOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    display: none;
  }
`
document.head.appendChild(loadingStyle)

// Function to show loading overlay
function showLoading() {
  loadingOverlay.style.display = "flex"
}

// Function to hide loading overlay
function hideLoading() {
  loadingOverlay.style.display = "none"
}

// Example usage of loading overlay
punchButton.addEventListener("click", () => {
  showLoading()
  setTimeout(() => {
    // Simulating some asynchronous operation
    hideLoading()
  }, 2000)
})

// Implement a simple notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.classList.add("notification", `notification-${type}`)
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

// Add notification styles
const notificationStyle = document.createElement("style")
notificationStyle.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .notification.show {
    opacity: 1;
  }

  .notification-info {
    background-color: #17a2b8;
  }

  .notification-success {
    background-color: #28a745;
  }

  .notification-warning {
    background-color: #ffc107;
    color: #212529;
  }

  .notification-error {
    background-color: #dc3545;
  }
`
document.head.appendChild(notificationStyle)

// Example usage of notification system
captureButton.addEventListener("click", () => {
  showNotification("Selfie captured successfully!", "success")
})

// Implement a simple modal system
function createModal(title, content) {
  const modal = document.createElement("div")
  modal.classList.add("modal", "fade")
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  return new bootstrap.Modal(modal)
}

// Example usage of modal system
const helpButton = document.createElement("button")
helpButton.textContent = "Help"
helpButton.classList.add("btn", "btn-info", "position-fixed", "bottom-0", "start-0", "m-3")
document.body.appendChild(helpButton)

helpButton.addEventListener("click", () => {
  const helpModal = createModal("Help", "<p>This is a help message. You can add more detailed instructions here.</p>")
  helpModal.show()
})

// Add responsive improvements
window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    document.getElementById("sidebar-wrapper").classList.add("toggled")
  } else {
    document.getElementById("sidebar-wrapper").classList.remove("toggled")
  }
})

// Implement lazy loading for images
document.addEventListener("DOMContentLoaded", () => {
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"))

  if ("IntersectionObserver" in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target
          lazyImage.src = lazyImage.dataset.src
          lazyImage.classList.remove("lazy")
          lazyImageObserver.unobserve(lazyImage)
        }
      })
    })

    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage)
    })
  }
})

// Attendance records functionality
document.addEventListener("DOMContentLoaded", () => {
  const attendanceLink = document.getElementById("attendanceLink")
  const attendanceRecords = document.getElementById("attendanceRecords")
  const dashboardContent = document.getElementById("dashboardContent").children

  attendanceLink.addEventListener("click", (e) => {
    e.preventDefault()
    attendanceRecords.style.display = "block"
    for (let i = 0; i < dashboardContent.length; i++) {
      if (dashboardContent[i] !== attendanceRecords) {
        dashboardContent[i].style.display = "none"
      }
    }
    displayAttendance()
  })
})

function groupAttendanceByDate(attendance) {
  return attendance.reduce((acc, record) => {
    const date = new Date(record.time).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(record)
    return acc
  }, {})
}

