let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";
let latestFlightData = "";
let latestHotelData = "";
let latestItineraryDraft = "";
let timerInterval = null;
let stepInterval = null;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initTextarea();
    initThreadBadge();
});

function initThreadBadge() {
    const threadInfo = document.getElementById("threadInfo");
    if (threadInfo && currentThreadId) {
        threadInfo.textContent = `Thread ID: ${currentThreadId.slice(0, 14)}...`;
        threadInfo.setAttribute("title", `Full Thread ID: ${currentThreadId} (Click to copy)`);
    }
}

function initTextarea() {
    const input = document.getElementById("userInput");
    const charCount = document.getElementById("charCount");

    if (input) {
        input.addEventListener("input", () => {
            if (charCount) {
                const len = input.value.length;
                charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
            }
            // Auto-expand textarea slightly based on content
            input.style.height = "auto";
            input.style.height = Math.min(Math.max(input.scrollHeight, 120), 320) + "px";
        });
    }
}

function setPrompt(text) {
    const input = document.getElementById("userInput");
    if (!input) return;

    input.value = text;
    input.dispatchEvent(new Event("input"));
    input.focus();

    // Smooth scroll to input area if needed
    input.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearInput() {
    const input = document.getElementById("userInput");
    if (!input) return;

    input.value = "";
    input.dispatchEvent(new Event("input"));
    input.style.height = "120px";
    input.focus();
}

function startNewSession() {
    currentThreadId = null;
    localStorage.removeItem("travel_thread_id");

    const threadInfo = document.getElementById("threadInfo");
    if (threadInfo) {
        threadInfo.textContent = "Thread ID: New Session";
    }

    const resultSection = document.getElementById("resultSection");
    if (resultSection) {
        resultSection.classList.add("hidden");
    }

    clearInput();
    hideError();

    // Visual notification
    showToast("✨ Started new travel planning session!");
}

function copyThreadId() {
    if (!currentThreadId) {
        showToast("No active session ID yet.");
        return;
    }

    navigator.clipboard.writeText(currentThreadId)
        .then(() => {
            showToast("Copied Thread ID to clipboard!");
        })
        .catch(() => {
            showToast("Thread ID: " + currentThreadId);
        });
}

function showToast(msg) {
    let toast = document.getElementById("appToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function setLoading(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");
    const agentTracker = document.getElementById("agentTracker");

    if (sendBtn) sendBtn.disabled = isLoading;

    if (isLoading) {
        if (btnText) btnText.classList.add("hidden");
        if (btnLoader) btnLoader.classList.remove("hidden");
        if (agentTracker) {
            agentTracker.classList.remove("hidden");
            startAgentTrackerAnimation();
        }
    } else {
        if (btnText) btnText.classList.remove("hidden");
        if (btnLoader) btnLoader.classList.add("hidden");
        if (agentTracker) {
            stopAgentTrackerAnimation();
            agentTracker.classList.add("hidden");
        }
    }
}

function startAgentTrackerAnimation() {
    const timerElem = document.getElementById("trackerTimer");
    const statusTitle = document.getElementById("trackerStatusTitle");
    const statusDesc = document.getElementById("trackerStatusDesc");

    const steps = [
        {
            id: "step-flight",
            title: "Flight Agent: Querying AviationStack...",
            desc: "Scanning live international routes and schedules",
            duration: 0
        },
        {
            id: "step-hotel",
            title: "Hotel Agent: Scouting Verified Stays...",
            desc: "Extracting top accommodations & amenities via Tavily",
            duration: 5
        },
        {
            id: "step-itinerary",
            title: "Itinerary Agent: Structuring Day-by-Day Journey...",
            desc: "Synthesizing schedule, pacing, and local attractions",
            duration: 12
        },
        {
            id: "step-final",
            title: "Master Synthesis: Assembling Executive Dossier...",
            desc: "Finalizing budget, travel recommendations, and packing guide",
            duration: 19
        }
    ];

    let seconds = 0;
    if (timerElem) timerElem.textContent = "0s";

    // Reset step styles
    ["step-flight", "step-hotel", "step-itinerary", "step-final"].forEach((stepId, index) => {
        const el = document.getElementById(stepId);
        if (el) {
            el.className = index === 0 ? "tracker-step active" : "tracker-step";
            const badge = el.querySelector(".step-badge");
            if (badge) badge.textContent = index === 0 ? "Processing" : "Waiting";
        }
    });

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        if (timerElem) timerElem.textContent = `${seconds}s`;

        // Update active step based on elapsed time
        if (seconds >= 19) {
            setStepState("step-final", "Processing", statusTitle, steps[3].title, statusDesc, steps[3].desc);
            markCompleted("step-itinerary");
        } else if (seconds >= 12) {
            setStepState("step-itinerary", "Processing", statusTitle, steps[2].title, statusDesc, steps[2].desc);
            markCompleted("step-hotel");
        } else if (seconds >= 5) {
            setStepState("step-hotel", "Processing", statusTitle, steps[1].title, statusDesc, steps[1].desc);
            markCompleted("step-flight");
        }
    }, 1000);
}

function setStepState(stepId, badgeText, titleElem, title, descElem, desc) {
    const el = document.getElementById(stepId);
    if (el && !el.classList.contains("done")) {
        el.className = "tracker-step active";
        const badge = el.querySelector(".step-badge");
        if (badge) badge.textContent = badgeText;
    }
    if (titleElem && title) titleElem.textContent = title;
    if (descElem && desc) descElem.textContent = desc;
}

function markCompleted(stepId) {
    const el = document.getElementById(stepId);
    if (el) {
        el.className = "tracker-step done";
        const badge = el.querySelector(".step-badge");
        if (badge) badge.textContent = "✓ Complete";
    }
}

function stopAgentTrackerAnimation() {
    clearInterval(timerInterval);
    clearInterval(stepInterval);
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");

    if (errorText) {
        errorText.textContent = message;
    } else if (errorBox) {
        errorBox.textContent = message;
    }

    if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function hideError() {
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");

    if (errorBox) {
        errorBox.classList.add("hidden");
    }
    if (errorText) {
        errorText.textContent = "";
    }
}

function switchResultTab(tabKey) {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabBtns.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
    });
    tabPanes.forEach(pane => pane.classList.remove("active"));

    const tabMap = {
        master: { btnIdx: 0, paneId: "tabPaneMaster" },
        flights: { btnIdx: 1, paneId: "tabPaneFlights" },
        hotels: { btnIdx: 2, paneId: "tabPaneHotels" },
        draft: { btnIdx: 3, paneId: "tabPaneDraft" }
    };

    const target = tabMap[tabKey] || tabMap.master;
    if (tabBtns[target.btnIdx]) {
        tabBtns[target.btnIdx].classList.add("active");
        tabBtns[target.btnIdx].setAttribute("aria-selected", "true");
    }

    const pane = document.getElementById(target.paneId);
    if (pane) {
        pane.classList.add("active");
    }
}

function showResult(answer, threadId) {
    latestAnswerMarkdown = answer;

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");
    const threadInfo = document.getElementById("threadInfo");
    const pdfDateStamp = document.getElementById("pdfDateStamp");

    // Render markdown with marked library
    if (typeof marked !== "undefined") {
        marked.setOptions({
            gfm: true,
            breaks: true
        });
        resultBox.innerHTML = marked.parse(answer);
    } else {
        resultBox.innerText = answer;
    }

    // Set thread info
    if (threadInfo) {
        const shortId = (threadId && threadId.length > 20) ? threadId.slice(0, 18) + '...' : (threadId || '-');
        threadInfo.textContent = `Thread ID: ${shortId}`;
        threadInfo.setAttribute("title", `Session ID: ${threadId} (Click to copy)`);
    }

    // Update Date Stamp on PDF export header
    if (pdfDateStamp) {
        const now = new Date();
        pdfDateStamp.textContent = now.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    // Switch to Master tab by default
    switchResultTab("master");

    if (resultSection) {
        resultSection.classList.remove("hidden");
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function populateAgentIntel(flightData, hotelData, itineraryDraft, llmCalls) {
    latestFlightData = flightData;
    latestHotelData = hotelData;
    latestItineraryDraft = itineraryDraft;

    const flightBox = document.getElementById("flightIntelBox");
    const hotelBox = document.getElementById("hotelIntelBox");
    const draftBox = document.getElementById("draftIntelBox");
    const llmCallsBadge = document.getElementById("llmCallsBadge");

    if (llmCallsBadge) {
        llmCallsBadge.innerHTML = `
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Swarm Iterations: ${llmCalls || 4}
        `;
    }

    if (flightBox) {
        if (flightData && flightData.trim()) {
            flightBox.innerHTML = typeof marked !== "undefined" ? marked.parse(flightData) : `<pre>${flightData}</pre>`;
        } else {
            flightBox.innerHTML = `<div class="intel-empty">✈️ Flight Agent was not triggered or no direct live flights were returned.</div>`;
        }
    }

    if (hotelBox) {
        if (hotelData && hotelData.trim()) {
            hotelBox.innerHTML = typeof marked !== "undefined" ? marked.parse(hotelData) : `<pre>${hotelData}</pre>`;
        } else {
            hotelBox.innerHTML = `<div class="intel-empty">🏨 Hotel Agent did not return additional external records.</div>`;
        }
    }

    if (draftBox) {
        if (itineraryDraft && itineraryDraft.trim()) {
            draftBox.innerHTML = typeof marked !== "undefined" ? marked.parse(itineraryDraft) : `<pre>${itineraryDraft}</pre>`;
        } else {
            draftBox.innerHTML = `<div class="intel-empty">🗺️ Intermediate draft synthesized directly into master itinerary.</div>`;
        }
    }
}

async function sendMessage() {
    hideError();

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        showError("Please enter your travel request or destination first.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/travel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Something went wrong while contacting the multi-agent swarm.");
        }

        currentThreadId = data.thread_id;
        localStorage.setItem("travel_thread_id", currentThreadId);

        // Populate agent telemetry tabs
        populateAgentIntel(
            data.flight_results,
            data.hotel_results,
            data.itinerary,
            data.llm_calls
        );

        // Display synthesized result
        showResult(data.answer, data.thread_id);

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function copyResult() {
    const resultBox = document.getElementById("resultBox");
    const textToCopy = latestAnswerMarkdown || (resultBox ? resultBox.innerText : "");

    if (!textToCopy) {
        showError("No travel plan available to copy.");
        return;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const copyBtn = document.querySelector(".copy-btn");
            if (copyBtn) {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style="color:#4ade80;">Copied!</span>
                `;
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                }, 1600);
            }
            showToast("Travel plan copied to clipboard!");
        })
        .catch(() => {
            showError("Could not copy result to clipboard.");
        });
}

function downloadPDF() {
    const pdfContent = document.getElementById("pdfContent");

    if (!latestAnswerMarkdown || !pdfContent) {
        showError("No travel plan available to download.");
        return;
    }

    const downloadBtn = document.querySelector(".download-btn");
    const oldHtml = downloadBtn ? downloadBtn.innerHTML : "";

    if (downloadBtn) {
        downloadBtn.innerHTML = `
            <span class="loader" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:6px;"></span>
            <span>Exporting...</span>
        `;
        downloadBtn.disabled = true;
    }

    // Set export-ready class
    pdfContent.classList.add("pdf-export-mode");

    const options = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: "traveloop-itinerary.pdf",
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        },
        pagebreak: {
            mode: ["avoid-all", "css", "legacy"]
        }
    };

    if (typeof html2pdf !== "undefined") {
        html2pdf()
            .set(options)
            .from(pdfContent)
            .save()
            .then(() => {
                pdfContent.classList.remove("pdf-export-mode");
                if (downloadBtn) {
                    downloadBtn.innerHTML = oldHtml;
                    downloadBtn.disabled = false;
                }
                showToast("PDF downloaded successfully!");
            })
            .catch((err) => {
                pdfContent.classList.remove("pdf-export-mode");
                if (downloadBtn) {
                    downloadBtn.innerHTML = oldHtml;
                    downloadBtn.disabled = false;
                }
                showError("Could not generate PDF: " + (err.message || "Unknown error"));
            });
    } else {
        pdfContent.classList.remove("pdf-export-mode");
        if (downloadBtn) {
            downloadBtn.innerHTML = oldHtml;
            downloadBtn.disabled = false;
        }
        window.print();
    }
}

// Global Keyboard Shortcut: Ctrl + Enter or Cmd + Enter
document.addEventListener("keydown", function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});