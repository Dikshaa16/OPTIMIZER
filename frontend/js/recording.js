/* ═════════════════════════════════════════════════════════════
   RECORDING & EXPORT UTILITIES
   ═════════════════════════════════════════════════════════════ */

const RecordingUtils = {
    mediaRecorder: null,
    recordedChunks: [],
    isRecording: false,
    recordingCanvas: null,

    /**
     * Start recording a canvas element
     */
    async startCanvasRecording(canvasElement, fps = 30) {
        try {
            const stream = canvasElement.captureStream(fps);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const dest = audioContext.createMediaStreamDestination();
            stream.addTrack(dest.stream.getAudioTracks()[0]);

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            this.recordedChunks = [];
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
            };

            this.mediaRecorder.start();
            Utils.toast('Recording started 🎥', 'info');
            return true;
        } catch (err) {
            console.error('Recording error:', err);
            Utils.toast('Failed to start recording', 'error');
            return false;
        }
    },

    /**
     * Stop recording and download video
     */
    stopCanvasRecording(filename = 'animation.webm') {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                Utils.toast('No recording in progress', 'warning');
                resolve(false);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                Utils.toast(`Video downloaded: ${filename}`, 'success');
                this.recordedChunks = [];
                resolve(true);
            };

            this.mediaRecorder.stop();
        });
    },

    /**
     * Format recording time for display
     */
    formatRecordingTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

/**
 * Export Utilities for Charts and Images
 */
const ExportUtils = {
    /**
     * Export Plotly chart as PNG
     */
    exportPlotlyAsPNG(plotId, filename = 'chart.png') {
        if (!document.getElementById(plotId)) {
            Utils.toast('Chart not found', 'error');
            return;
        }

        Plotly.downloadImage(plotId, {
            format: 'png',
            width: 1200,
            height: 800,
            filename: filename
        });

        Utils.toast(`Exporting: ${filename}`, 'success');
    },

    /**
     * Export Plotly chart as PDF
     */
    exportPlotlyAsPDF(plotId, filename = 'chart.pdf') {
        if (!document.getElementById(plotId)) {
            Utils.toast('Chart not found', 'error');
            return;
        }

        Plotly.downloadImage(plotId, {
            format: 'pdf',
            width: 1200,
            height: 800,
            filename: filename
        });

        Utils.toast(`Exporting: ${filename}`, 'success');
    },

    /**
     * Export canvas as PNG
     */
    exportCanvasAsPNG(canvasElement, filename = 'canvas.png') {
        if (!canvasElement) {
            Utils.toast('Canvas not found', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvasElement.toDataURL('image/png');
        link.click();

        Utils.toast(`Exported: ${filename}`, 'success');
    },

    /**
     * Export canvas as SVG (for vector graphics)
     */
    exportCanvasAsSVG(canvasElement, filename = 'canvas.svg') {
        if (!canvasElement) {
            Utils.toast('Canvas not found', 'error');
            return;
        }

        const image = canvasElement.toDataURL('image/png');
        const svg = `<svg width="${canvasElement.width}" height="${canvasElement.height}" xmlns="http://www.w3.org/2000/svg">
            <image width="${canvasElement.width}" height="${canvasElement.height}" href="${image}"/>
        </svg>`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        link.click();

        Utils.toast(`Exported: ${filename}`, 'success');
    },

    /**
     * Export table data as CSV
     */
    exportTableAsCSV(tableElement, filename = 'data.csv') {
        if (!tableElement) {
            Utils.toast('Table not found', 'error');
            return;
        }

        let csv = [];
        const rows = tableElement.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                let text = cell.textContent.trim();
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                return text;
            });
            csv.push(rowData.join(','));
        });

        const link = document.createElement('a');
        link.download = filename;
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join('\n'));
        link.click();

        Utils.toast(`Exported: ${filename}`, 'success');
    },

    /**
     * Export JSON data
     */
    exportJSON(data, filename = 'data.json') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        link.click();

        Utils.toast(`Exported: ${filename}`, 'success');
    }
};
