let scrapeEmails = document.getElementById("scrapeEmails");

// handler to get emails from content script
// this is a service worker and we use onMessage this event to listen for messages from another part of my extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
                console.log(emailList);
            }
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
    // alert("hello world");

    // script to parse emails on page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeEmailsFromPage,
    });
});

// function to scrape emails
// this is the content script
function scrapeEmailsFromPage() {
    const emailRegex = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
    // parse emails from html of the page
    let emails = document.body.innerHTML.match(emailRegex);
    const sending = chrome.runtime.sendMessage({
        emails,
    });
    // alert(emails);
}
