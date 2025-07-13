class AudiobookApp {
    constructor() {
        this.audiobooks = [];
        this.currentAudio = null;
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = null;
        this.isPlaying = false;
        this.availableVoices = [];
        this.settings = this.loadSettings();
        this.filteredAudiobooks = [];
        
        this.init();
    }

    init() {
        this.loadAudiobooks();
        this.setupEventListeners();
        this.setupAudioControls();
        this.loadVoices();
        this.setupQuickListen();
        this.setupSettings();
        this.setupSearch();
        this.setupTextStats();
    }

    loadSettings() {
        const saved = localStorage.getItem('audiobookSettings');
        return saved ? JSON.parse(saved) : {
            defaultVoice: '',
            defaultRate: 0.9,
            autoPlay: true,
            showWordCount: true
        };
    }

    saveSettings() {
        localStorage.setItem('audiobookSettings', JSON.stringify(this.settings));
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('audiobookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAudiobook();
        });

        // Modal close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Quick listen toggle
        document.getElementById('toggleQuickListen').addEventListener('click', () => {
            this.toggleQuickListen();
        });
    }

    setupAudioControls() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const restartBtn = document.getElementById('restartBtn');
        const volumeSlider = document.getElementById('volume');

        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        stopBtn.addEventListener('click', () => {
            this.stopAudio();
        });

        restartBtn.addEventListener('click', () => {
            this.restartAudio();
        });

        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
    }

    setupQuickListen() {
        const quickPlayBtn = document.getElementById('quickPlayBtn');
        const quickStopBtn = document.getElementById('quickStopBtn');
        const quickText = document.getElementById('quickText');

        quickPlayBtn.addEventListener('click', () => {
            const text = quickText.value.trim();
            if (text) {
                this.playQuickText(text);
            }
        });

        quickStopBtn.addEventListener('click', () => {
            this.stopAudio();
        });

        // Quick voice and rate controls
        document.getElementById('quickRate').addEventListener('input', (e) => {
            if (this.speechUtterance) {
                this.speechUtterance.rate = parseFloat(e.target.value);
            }
        });
    }

    setupSettings() {
        // Settings controls
        document.getElementById('defaultRate').addEventListener('input', (e) => {
            this.settings.defaultRate = parseFloat(e.target.value);
            document.getElementById('defaultRateValue').textContent = `${e.target.value}x`;
            this.saveSettings();
        });

        document.getElementById('autoPlay').addEventListener('change', (e) => {
            this.settings.autoPlay = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('showWordCount').addEventListener('change', (e) => {
            this.settings.showWordCount = e.target.checked;
            this.saveSettings();
            this.renderAudiobooks();
        });

        // Export/Import
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filterAudiobooks(e.target.value);
        });
    }

    setupTextStats() {
        const contentTextarea = document.getElementById('content');
        contentTextarea.addEventListener('input', (e) => {
            this.updateTextStats(e.target.value);
        });
    }

    updateTextStats(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        document.getElementById('wordCount').textContent = `${words} words`;
        document.getElementById('charCount').textContent = `${chars} characters`;
    }

    loadVoices() {
        const loadVoices = () => {
            this.availableVoices = this.speechSynthesis.getVoices();
            this.populateVoiceSelects();
        };

        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }

    populateVoiceSelects() {
        const voiceSelects = [
            'voiceSelect',
            'quickVoiceSelect',
            'defaultVoice'
        ];

        voiceSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;

            // Keep the first option (auto-select)
            const firstOption = select.firstElementChild;
            select.innerHTML = '';
            select.appendChild(firstOption);

            this.availableVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                select.appendChild(option);
            });
        });

        // Set default values
        if (this.settings.defaultVoice) {
            document.getElementById('defaultVoice').value = this.settings.defaultVoice;
        }
    }

    async loadAudiobooks() {
        try {
            const response = await fetch('/api/audiobooks');
            this.audiobooks = await response.json();
            this.filteredAudiobooks = [...this.audiobooks];
            this.renderAudiobooks();
        } catch (error) {
            console.error('Error loading audiobooks:', error);
            this.showError('Failed to load audiobooks');
        }
    }

    filterAudiobooks(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredAudiobooks = [...this.audiobooks];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredAudiobooks = this.audiobooks.filter(ab => 
                ab.title.toLowerCase().includes(term) ||
                ab.author.toLowerCase().includes(term) ||
                ab.content.toLowerCase().includes(term)
            );
        }
        this.renderAudiobooks();
    }

    async createAudiobook() {
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const content = document.getElementById('content').value.trim();
        const voice = document.getElementById('voiceSelect').value;
        const rate = parseFloat(document.getElementById('speechRate').value);

        if (!title || !content) {
            this.showError('Please fill in all required fields');
            return;
        }

        const submitBtn = document.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Creating...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/audiobooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author, content, voice, rate }),
            });

            if (!response.ok) {
                throw new Error('Failed to create audiobook');
            }

            const newAudiobook = await response.json();
            this.audiobooks.unshift(newAudiobook);
            this.filteredAudiobooks = [...this.audiobooks];
            this.renderAudiobooks();
            
            // Reset form
            document.getElementById('audiobookForm').reset();
            this.updateTextStats('');
            this.showSuccess('Audiobook created successfully!');
        } catch (error) {
            console.error('Error creating audiobook:', error);
            this.showError('Failed to create audiobook');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    renderAudiobooks() {
        const container = document.getElementById('audiobooksList');
        
        if (this.filteredAudiobooks.length === 0) {
            const searchTerm = document.getElementById('searchInput').value.trim();
            if (searchTerm) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No audiobooks found</h3>
                        <p>No audiobooks match your search: "${searchTerm}"</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-headphones"></i>
                        <h3>No audiobooks yet</h3>
                        <p>Create your first audiobook by adding some text above!</p>
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = this.filteredAudiobooks.map(audiobook => `
            <div class="audiobook-card">
                <h3>${this.escapeHtml(audiobook.title)}</h3>
                <p><strong>Author:</strong> ${this.escapeHtml(audiobook.author)}</p>
                <p><strong>Created:</strong> ${new Date(audiobook.createdAt).toLocaleDateString()}</p>
                ${this.settings.showWordCount ? `<p><strong>Length:</strong> ${this.getTextLength(audiobook.content)}</p>` : ''}
                <div class="audiobook-actions">
                    <button class="btn btn-small btn-listen" onclick="app.listenToAudiobook('${audiobook.id}')">
                        <i class="fas fa-play"></i> Listen
                    </button>
                    <button class="btn btn-small btn-delete" onclick="app.deleteAudiobook('${audiobook.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    listenToAudiobook(id) {
        const audiobook = this.audiobooks.find(ab => ab.id === id);
        if (!audiobook) return;

        this.openModal(audiobook);
        if (this.settings.autoPlay) {
            this.playText(audiobook.content, audiobook.voice, audiobook.rate);
        }
    }

    openModal(audiobook) {
        document.getElementById('modalTitle').textContent = audiobook.title;
        document.getElementById('modalAuthor').textContent = `Author: ${audiobook.author}`;
        document.getElementById('modalDate').textContent = `Created: ${new Date(audiobook.createdAt).toLocaleDateString()}`;
        document.getElementById('modalContent').textContent = audiobook.content;
        
        document.getElementById('audioModal').style.display = 'block';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.stopAudio();
    }

    openSettingsModal() {
        // Populate settings with current values
        document.getElementById('defaultRate').value = this.settings.defaultRate;
        document.getElementById('defaultRateValue').textContent = `${this.settings.defaultRate}x`;
        document.getElementById('autoPlay').checked = this.settings.autoPlay;
        document.getElementById('showWordCount').checked = this.settings.showWordCount;
        
        document.getElementById('settingsModal').style.display = 'block';
    }

    toggleQuickListen() {
        const content = document.getElementById('quickListenContent');
        const icon = document.querySelector('#toggleQuickListen i');
        
        if (content.classList.contains('active')) {
            content.classList.remove('active');
            icon.className = 'fas fa-chevron-up';
        } else {
            content.classList.add('active');
            icon.className = 'fas fa-chevron-down';
        }
    }

    playQuickText(text) {
        const voice = document.getElementById('quickVoiceSelect').value;
        const rate = parseFloat(document.getElementById('quickRate').value);
        this.playText(text, voice, rate);
    }

    playText(text, voice = null, rate = null) {
        // Stop any currently playing audio
        this.stopAudio();

        // Create new speech utterance
        this.speechUtterance = new SpeechSynthesisUtterance(text);
        
        // Configure speech settings
        this.speechUtterance.rate = rate || this.settings.defaultRate;
        this.speechUtterance.pitch = 1;
        this.speechUtterance.volume = document.getElementById('volume').value;

        // Set voice
        if (voice) {
            const selectedVoice = this.availableVoices.find(v => v.name === voice);
            if (selectedVoice) {
                this.speechUtterance.voice = selectedVoice;
            }
        } else if (this.settings.defaultVoice) {
            const defaultVoice = this.availableVoices.find(v => v.name === this.settings.defaultVoice);
            if (defaultVoice) {
                this.speechUtterance.voice = defaultVoice;
            }
        } else {
            // Auto-select best voice
            const preferredVoice = this.availableVoices.find(voice => 
                voice.lang.includes('en') && voice.name.includes('Google')
            ) || this.availableVoices.find(voice => voice.lang.includes('en')) || this.availableVoices[0];
            
            if (preferredVoice) {
                this.speechUtterance.voice = preferredVoice;
            }
        }

        // Event listeners for speech
        this.speechUtterance.onstart = () => {
            this.isPlaying = true;
            this.updatePlayButton();
        };

        this.speechUtterance.onend = () => {
            this.isPlaying = false;
            this.updatePlayButton();
        };

        this.speechUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isPlaying = false;
            this.updatePlayButton();
            this.showError('Error playing audio. Please try again.');
        };

        // Start speaking
        this.speechSynthesis.speak(this.speechUtterance);
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.resumeAudio();
        }
    }

    pauseAudio() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }

    resumeAudio() {
        if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
            this.isPlaying = true;
            this.updatePlayButton();
        }
    }

    stopAudio() {
        if (this.speechSynthesis.speaking || this.speechSynthesis.paused) {
            this.speechSynthesis.cancel();
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }

    restartAudio() {
        this.stopAudio();
        const modalContent = document.getElementById('modalContent');
        if (modalContent.textContent) {
            this.playText(modalContent.textContent);
        }
    }

    setVolume(volume) {
        if (this.speechUtterance) {
            this.speechUtterance.volume = volume;
        }
    }

    updatePlayButton() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (this.isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playPauseBtn.classList.remove('btn-play');
            playPauseBtn.classList.add('btn-stop');
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            playPauseBtn.classList.remove('btn-stop');
            playPauseBtn.classList.add('btn-play');
        }
    }

    async deleteAudiobook(id) {
        if (!confirm('Are you sure you want to delete this audiobook?')) {
            return;
        }

        try {
            const response = await fetch(`/api/audiobooks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete audiobook');
            }

            this.audiobooks = this.audiobooks.filter(ab => ab.id !== id);
            this.filteredAudiobooks = this.filteredAudiobooks.filter(ab => ab.id !== id);
            this.renderAudiobooks();
            this.showSuccess('Audiobook deleted successfully!');
        } catch (error) {
            console.error('Error deleting audiobook:', error);
            this.showError('Failed to delete audiobook');
        }
    }

    exportData() {
        const data = {
            audiobooks: this.audiobooks,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audiobooks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Audiobooks exported successfully!');
    }

    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.audiobooks && Array.isArray(data.audiobooks)) {
                // Import audiobooks
                for (const audiobook of data.audiobooks) {
                    try {
                        await fetch('/api/audiobooks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(audiobook)
                        });
                    } catch (error) {
                        console.error('Error importing audiobook:', error);
                    }
                }
                
                // Reload audiobooks
                await this.loadAudiobooks();
                this.showSuccess(`Imported ${data.audiobooks.length} audiobooks successfully!`);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showError('Failed to import audiobooks. Please check the file format.');
        }
    }

    getTextLength(text) {
        const words = text.split(' ').length;
        const estimatedMinutes = Math.ceil(words / 150); // Average reading speed
        return `${words} words (~${estimatedMinutes} min)`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AudiobookApp();
});

// Handle speech synthesis voices loading
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
    };
} 