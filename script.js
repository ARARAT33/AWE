// Թաբերի փոփոխության ֆունկցիա Ուղեցույցների բաժնում
function openTab(evt, tabName) {
    // Թաքցնել բոլոր տաբերը
    const tabPanels = document.getElementsByClassName("tab-panel");
    for (let i = 0; i < tabPanels.length; i++) {
        tabPanels[i].classList.remove("active");
    }

    // Ակտիվացնել բոլոր կոճակների սովորական ոճը
    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Ցուցադրել ընտրված տաբը և ավելացնել "active" դասը
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Էկրանի սքրոլլի ժամանակ ակտիվ նավիգացիոն հղման թարմացում
window.addEventListener('sidebar', () => {
    // Այստեղ կարող ես ավելացնել լրացուցիչ UI էֆեկտներ
});
