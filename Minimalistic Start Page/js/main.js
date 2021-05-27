document.addEventListener("DOMContentLoaded", function () {
    function sortBookmarks() {

        let hiddenBm = document.getElementById("hiddenBM")
        let hiddenBmContent = hiddenBm.getElementsByClassName("content")[0];
        let availableSpace = window.innerWidth - 100

        let BmBar = this.document.querySelector('#bookmarks-bar');
        let widthSum = 0
        for (let bm of BmBar.children) {
            widthSum += bm.clientWidth;

            if (!bm.dataset.width) {
                bm.dataset.width = bm.clientWidth
            }
        }

        let iter = BmBar.children.length - 2
        while (availableSpace < widthSum || iter < 0) {
            let elem = BmBar.children[iter];
            let elemSize = elem.dataset.width
            widthSum -= elemSize
            hiddenBmContent.appendChild(elem);
            iter--;
        }


        let hiddenBmElements = document.querySelectorAll("#hiddenBM .bm");
        for (var i = hiddenBmElements.length - 1; i >= 0; i--) {
            elem = hiddenBmElements[i]
            elementSize = parseInt(elem.dataset.width)
            if (widthSum + elementSize < availableSpace) {
                BmBar.insertBefore(elem, this.document.getElementById('hiddenBM'))
                widthSum += elementSize
                continue
            }
            break
        }


        if (!hiddenBmContent.children.length) {
            hiddenBm.style.display = 'none'
        } else {
            hiddenBm.style.display = 'block'
        }
    }

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    function addTile(site) {
        let overlay = document.createElement("div");
        overlay.classList.add("tile-overlay");
        let tile = document.createElement("a");
        tile.classList.add("tile");
        tile.id = "tile" + site.id;
        tile.href = site.url;
        tile.appendChild(overlay);
        tile.style.backgroundImage = `url(${site.imgURL})`;
        tile.style.backgroundColor = site.bgColor
        document.getElementById("tile-grid").appendChild(tile);

        if (site.customcss) {
            var styleSheet = document.createElement("style")
            styleSheet.type = "text/css"
            styleSheet.innerText = `#${tile.id} {${site.customcss}}`
            document.head.appendChild(styleSheet)
        }
    }


    function initPage() {
        chrome.storage.local.get(['sitesAmount', 'mainBgImg', 'displayGoogleLogo', 'displayBookmarksBar', 'barColor'], function (result) {
            if (isEmpty(result)) {
                return
            }
            if (result.sitesAmount) {
                if (result.sitesAmount % 4 == 1) {
                    document.getElementById("tile-grid").style.width = '35em'
                }

                for (i = 1; i < result.sitesAmount + 1; i++) {
                    chrome.storage.local.get([`siteinfo${i}`], function (result) {
                        if (!isEmpty(result)) {
                            addTile(Object.values(result)[0])
                        }
                    });
                }
            }

            if (result.mainBgImg) {
                document.getElementById("body").style.backgroundImage = `url(${result.mainBgImg})`
            }

            if (!result.displayGoogleLogo) {
                document.getElementById("logo-wrapper").style.display = 'none'
            }

            if (result.displayBookmarksBar) {
                chrome.bookmarks.getTree(bookmarks => {
                    let mainBookmarks = bookmarks[0].children[0].children
                    let otherBookmarksFolder = bookmarks[0].children[1]

                    let bookmarksbar = document.createElement("div")
                    if (result.barColor) {
                        bookmarksbar.style.backgroundColor = result.barColor
                        bookmarksbar.style.setProperty('--content-color', result.barColor)
                    }

                    bookmarksbar.classList.add("bookmarks-bar")
                    bookmarksbar.id = "bookmarks-bar"
                    for (let child of mainBookmarks) {
                        bookmarksbar.appendChild(createBookmark(child, false))
                    }

                    bookmarksbar.appendChild(createBookmark(otherBookmarksFolder, false))

                    let hiddenBookmarks = document.createElement("div")
                    hiddenBookmarks.style.display = 'none'
                    hiddenBookmarks.id = 'hiddenBM'
                    hiddenBookmarks.classList.add("folder")
                    hiddenBookmarks.classList.add("hidden")
                    hiddenBookmarks.innerHTML = '<div class="elem"><i class="icon"></i></div><div class="content"></div>'
                    bookmarksbar.appendChild(hiddenBookmarks)

                    document.getElementById("body").appendChild(bookmarksbar)
                    sortBookmarks()
                });
            }
        });



        window.addEventListener('resize', sortBookmarks, true);
    }

    function createBookmark(bookmark, nested = true) {
        let isFolder = bookmark.hasOwnProperty('children')

        let bookmarkElem = document.createElement("div")
        if (!nested) {
            bookmarkElem.classList.add("bm")
        }

        if (isFolder) {
            bookmarkElem.classList.add("folder")
            if (nested) {
                bookmarkElem.classList.add("nested")
            }

            let elem = document.createElement("div")
            elem.classList.add("elem")
            elem.innerHTML = `<i class="icon"></i><span class="text">${bookmark.title}</span>`
            bookmarkElem.appendChild(elem)

            let content = document.createElement("div")
            content.classList.add("content")
            for (let child of bookmark.children) {
                content.appendChild(createBookmark(child))
            }
            bookmarkElem.appendChild(content)
            return bookmarkElem
        } else {
            bookmarkElem.classList.add("elem")
            bookmarkElem.classList.add("bookmark")
            let faviconURL = new URL(bookmark.url)
            faviconURL = 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + faviconURL.origin
            bookmarkElem.innerHTML = `<i class="icon" style="background-image: url('${faviconURL}')"></i><a class="text" href="${bookmark.url}">${bookmark.title}</a></div>`
            return bookmarkElem
        }
    }

    initPage()
});