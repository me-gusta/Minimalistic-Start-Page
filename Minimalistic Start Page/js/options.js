document.addEventListener("DOMContentLoaded", function () {

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    function saveMainBgImg() {
        let imgURL = document.getElementById('main-bg-input').value
        let displayGoogleLogo = document.getElementById('displayGoogleLogo').checked

        chrome.storage.local.set({
            "mainBgImg": imgURL,
            "displayGoogleLogo": displayGoogleLogo
        });
    }
    document.getElementById("save-main-bg").onclick = saveMainBgImg


    function saveBookmarksBarSettings() {
        let displayBookmarksBar = document.getElementById('displayBookmarksBar').checked
        let barColor = document.getElementById('barColor').value
        chrome.storage.local.set({
            "displayBookmarksBar": displayBookmarksBar,
            "barColor": barColor
        });
    }
    document.getElementById("saveBookmarksBar").onclick = saveBookmarksBarSettings

    function removeSite() {
        let rows = document.querySelectorAll(".siteRow")
        if (!rows.length) {
            return
        }
        rows[rows.length - 1].remove()
    }

    document.getElementById("remove").onclick = removeSite

    function saveSite() {
        let sitesAmount = 0
        document.querySelectorAll(".title-input").forEach(elem => {
            let title = elem.value
            let url = document.getElementById(`url${elem.id}`).value
            if (!title || !url) {
                return
            }

            let imgURL = document.getElementById(`imgURL${elem.id}`).value
            let bgColor = document.getElementById(`bgColor${elem.id}`).value
            let customcss = document.getElementById(`customcss${elem.id}`).value

            if (!bgColor) {
                bgColor = 'transparent'
            }
            site = {
                id: elem.id,
                title: title,
                url: url,
                imgURL: imgURL,
                bgColor: bgColor,
                customcss: customcss
            }
            sitesAmount += 1
            chrome.storage.local.set({
                ["siteinfo" + elem.id]: site,
                "sitesAmount": sitesAmount
            });
        });
    }
    document.getElementById("saveSites").onclick = saveSite

    function addRow(site) {
        let tr = document.createElement("tr");
        tr.classList.add('siteRow')
        tr.innerHTML = `<td><span><input type="text" class="title-input" value="${site.title}" id="${site.id}"></span></td>\n<td><span><input type="text" value="${site.url}" id="url${site.id}"</span></td>\n<td><input class="img-input" id="imgURL${site.id}" type="text" value="${site.imgURL}"></td>\n<td><span><input id="bgColor${site.id}" class="bgcolor-input" type="text" value="${site.bgColor}"></span></td>\n<td><span><input id="customcss${site.id}" class="customcss-input" type="text" value="${site.customcss}"></span></td>`
        document.getElementById("tile-table").appendChild(tr);
    }

    function addEmptyRow() {
        siteID = document.getElementById("tile-table").children.length
        addRow({
            title: '',
            url: '',
            id: siteID + 1,
            imgURL: '',
            bgColor: '',
            customcss: ''
        });
    }
    document.getElementById("add").onclick = addEmptyRow

    function initPage() {
        chrome.storage.local.get([`sitesAmount`, `mainBgImg`, 'displayGoogleLogo','displayBookmarksBar','barColor'], function (result) {
            if (isEmpty(result)) {
                chrome.storage.local.set({
                    [`sitesAmount`]: 1,
                    'mainBgImg': '',
                    'displayBookmarksBar': true,
                    'barColor': '#6d1212'
                });
                addEmptyRow()
                return
            }
            if (result.sitesAmount) {
                for (i = 1; i < result.sitesAmount + 1; i++) {
                    chrome.storage.local.get([`siteinfo${i}`], function (result) {
                        if (!isEmpty(result)) {
                            addRow(Object.values(result)[0])
                        }
                    });
                }
            }

            if (result.mainBgImg) {
                document.getElementById('main-bg-input').value = result.mainBgImg;
            }

            if (result.displayGoogleLogo) {
                document.getElementById('displayGoogleLogo').checked = result.displayGoogleLogo;
            }

            if (result.displayBookmarksBar) {
                document.getElementById('displayBookmarksBar').checked = result.displayBookmarksBar;
            }

            if (result.barColor) {
                document.getElementById('barColor').value = result.barColor;
            }
        });
    }

    initPage()
});