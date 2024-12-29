let scrapeEmails = document.getElementById("scrapeEmails");

// handler to get emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received", request);
    let emailList = document.getElementById("emailList");

    // get emails
    let emails = request.emails;
    if (emails) {
        let emailArr = [];
        for (let email of emails) {
            const emailExists = emailArr.includes(email);
            // create list item
            if (emailExists) {
                continue;
            } else {
                emailArr.push(email);
                let li = document.createElement("li");
                li.innerText = email;
                emailList.appendChild(li);
            }
        }
        // After collecting emails, trigger CSV download
        if (emailArr.length > 0) {
            createCSVDownload(emailArr);
        }
    } else {
        alert("No emails found");
        let li = document.createElement("li");
        li.innerText = "No emails found";
        emailList.appendChild(li);
    }
});

// btn click event listener
scrapeEmails.addEventListener("click", async () => {
    // getting the current active tab of chrome window
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Active tab:", tab); 
    // script to parse emails on page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeEmailsFromPage,
    });
});

// function to scrape emails
function scrapeEmailsFromPage() {
    const emailRegex = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
    // parse emails from html of the page
    let emails = document.body.innerHTML.match(emailRegex);
    chrome.runtime.sendMessage({
        emails,
    });
}

// function to create and download CSV using chrome.downloads.download
function createCSVDownload(emailArr) {
    console.log("email array:" + emailArr);

    // Create CSV content
    const csvContent = "Email\n" + emailArr.join("\n");

    // Create Blob from CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Use chrome.downloads.download API to download the CSV file
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: "emails.csv",  // Name of the CSV file
        saveAs: true,            // Prompt the user to choose the location
    }, (downloadId) => {
        // Optional: Handle any post-download actions if needed
        console.log("Download started, ID:", downloadId);
        // Revoke the object URL to free memory after download is initiated
        URL.revokeObjectURL(url);
    });
}
