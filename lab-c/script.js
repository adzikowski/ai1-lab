let map = L.map('map').setView([53.430127, 14.564802], 18);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);

let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("<strong>Hello!</strong><br>This is a popup.");

document.getElementById("saveButton").addEventListener("click", function () {
    leafletImage(map, function (err, canvas) {
        let rasterMap = document.getElementById("rasterMap");
        let rasterContext = rasterMap.getContext("2d");
        rasterContext.drawImage(canvas, 0, 0, 300, 150);
        console.log("Saved image to rasterMap canvas.");
    });
});

document.getElementById("getLocation").addEventListener("click", function (event) {
    if (!navigator.geolocation) {
        console.log("No geolocation.");
    }

    navigator.geolocation.getCurrentPosition(position => {
        console.log("Current position:", position);
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        console.log("Setting map view to:", [lat, lon]);
        map.setView([lat, lon]);
    }, positionError => {
        console.error("Error getting position:", positionError);
    });
});

document.getElementById("createPuzzle").addEventListener("click", function () {
    console.log("Creating puzzle...");

    let rasterMap = document.getElementById("rasterMap");

    let blocksContainer = document.createElement("div");
    blocksContainer.id = "blocksContainer";
    document.body.appendChild(blocksContainer);

    blocksContainer.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    blocksContainer.addEventListener("drop", function (event) {
        event.preventDefault();
        let data = event.dataTransfer.getData("text/plain");
        let draggedBlock = document.getElementById(data);
        blocksContainer.appendChild(draggedBlock);
        console.log("Block dropped into container.");
    });

    let numBlocksX = 4;
    let numBlocksY = 4;
    let blockWidthVW = 12;
    let blockHeightVW = 6.25;
    let blockWidth = (blockWidthVW * window.innerWidth) / 100;
    let blockHeight = (blockHeightVW * window.innerWidth) / 100;

    for (let i = 0; i < numBlocksX; i++) {
        for (let j = 0; j < numBlocksY; j++) {
            let blockCanvas = document.createElement("canvas");
            blockCanvas.draggable = true;
            blockCanvas.width = blockWidth;
            blockCanvas.height = blockHeight;
            let blockId = i * numBlocksY + j;
            blockCanvas.id = blockId.toString();
            let blockContext = blockCanvas.getContext("2d");
            let originalWidth = rasterMap.width / numBlocksX;
            let originalHeight = rasterMap.height / numBlocksY;
            let originalX = i * originalWidth;
            let originalY = j * originalHeight;
            blockContext.drawImage(rasterMap, originalX, originalY, originalWidth, originalHeight, 0, 0, blockWidth, blockHeight);
            blocksContainer.appendChild(blockCanvas);
            console.log("Created block:", blockId);
        }
    }

    let emptyBlock = createEmptyBlock();
    document.body.replaceChild(emptyBlock, rasterMap);
    console.log("Empty block created.");

    let blocks = blocksContainer.querySelectorAll("canvas");

    blocks.forEach(function (block) {
        block.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", block.id);
            console.log("Block dragged:", block.id);
        });
    });

    emptyBlock.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    emptyBlock.addEventListener("drop", function (event) {
        event.preventDefault();
        let data = event.dataTransfer.getData("text/plain");
        let draggedBlock = document.getElementById(data);
        let cell = findCellUnderMouse(event, emptyBlock);

        if (cell && !cell.hasChildNodes()) {
            cell.appendChild(draggedBlock);
            console.log("Block dropped into cell:", cell.id);
        }

        if (isAllCellsFilled()) {
            console.log("All cells are filled!");
            if (isFilledCorrectly()) {
                showNotification("Congratulations! You've completed the puzzle!");
                console.log("Puzzle completed successfully!");
            } else {
                showNotification("Failed to complete the puzzle :(")
                console.log("Puzzle completed incorrectly.");
            }
        } else {
            console.log("Not all cells are filled.");
        }
    });
});

function createEmptyBlock() {
    let emptyBlock = document.createElement("table");
    emptyBlock.id = "puzzleTable";

    for (let i = 0; i < 4; i++) {
        let row = emptyBlock.insertRow();
        for (let j = 0; j < 4; j++) {
            let cell = row.insertCell();
            let cellId = j * 4 + i;
            cell.id = "cell_" + cellId;
            console.log("Created Cell ID:", cell.id);
        }
    }

    return emptyBlock;
}

function findCellUnderMouse(event, emptyBlock) {
    let rect = emptyBlock.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let cellWidth = emptyBlock.clientWidth / 4;
    let cellHeight = emptyBlock.clientHeight / 4;
    let cellX = Math.floor(mouseX / cellWidth);
    let cellY = Math.floor(mouseY / cellHeight);

    if (cellX >= 0 && cellX < 4 && cellY >= 0 && cellY < 4) {
        return emptyBlock.rows[cellY].cells[cellX];
    } else {
        return null;
    }
}

function isAllCellsFilled() {
    let emptyBlock = document.getElementById("puzzleTable");
    let cells = emptyBlock.getElementsByTagName("td");

    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].hasChildNodes()) {
            return false;
        }
    }

    return true;
}

function isFilledCorrectly() {
    let emptyBlock = document.getElementById("puzzleTable");
    let cells = emptyBlock.getElementsByTagName("td");

    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let cellContent = cell.querySelector("canvas");

        if (cellContent && cellContent.id !== cell.id.replace('cell_', '')) {
            console.log("Error: Cell ID", cell.id, "does not match block ID", cellContent.id);
            return false;
        }
    }

    return true;
}


function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification(message);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
}