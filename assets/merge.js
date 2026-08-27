window.universallength = 0;
window.universalloaded = 0;
  
window.mergeFiles = function(fileParts) {
    return new Promise((resolve, reject) => {
        let buffers = [];

        function fetchPart(index) {
            if (index >= fileParts.length) {
                let mergedBlob = new Blob(buffers);
                let mergedFileUrl = URL.createObjectURL(mergedBlob);
                resolve(mergedFileUrl);
                return;
            }
            fetch(fileParts[index]).then((response) => {
                if (!response.ok) throw new Error("Missing part: " + fileParts[index]);
                return response.arrayBuffer();
            }).then((data) => {
                window.universalloaded++;
                document.getElementById("loading-text").textContent = "LOADING... "+window.universalloaded+"/"+window.universallength;
                buffers.push(data);
                fetchPart(index + 1);
            }).catch(reject);
        }
        fetchPart(0);
    });
};

window.getParts = function(file, start, end) {
    let parts = [];
    for (let i = start; i <= end; i++) {
        parts.push(file + ".part" + i);
    }
    window.universallength = window.universallength+parts.length;
    return parts;
};
