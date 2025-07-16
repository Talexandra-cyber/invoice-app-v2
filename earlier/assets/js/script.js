class QRBrandStudio {
    constructor() {
        this.currentQRCode = null;
        this.logoFile = null;
        this.logoDataURL = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateSampleQR();
    }

    bindEvents() {
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });

        // Real-time updates
        document.getElementById('qr-input').addEventListener('input', () => {
            this.debounceGenerate();
        });

        document.getElementById('foreground-color').addEventListener('change', () => {
            this.generateQRCode();
        });

        document.getElementById('background-color').addEventListener('change', () => {
            this.generateQRCode();
        });

        document.getElementById('qr-size').addEventListener('change', () => {
            this.generateQRCode();
        });

        // Logo upload
        document.getElementById('logo-input').addEventListener('change', (e) => {
            this.handleLogoUpload(e);
        });

        // Download buttons
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadQRCode('png');
        });

        document.getElementById('download-svg-btn').addEventListener('click', () => {
            this.downloadQRCode('svg');
        });
    }

    debounceGenerate() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.generateQRCode();
        }, 500);
    }

    generateSampleQR() {
        document.getElementById('qr-input').value = 'https://qrbrandstudio.com';
        this.generateQRCode();
    }

    async generateQRCode() {
        const input = document.getElementById('qr-input').value.trim();
        const foregroundColor = document.getElementById('foreground-color').value;
        const backgroundColor = document.getElementById('background-color').value;
        const size = parseInt(document.getElementById('qr-size').value);
        const qrDisplay = document.getElementById('qr-display');
        const actionButtons = document.getElementById('action-buttons');

        if (!input) {
            qrDisplay.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-qrcode"></i>
                    <p>Enter text or URL to generate QR code</p>
                </div>
            `;
            actionButtons.style.display = 'none';
            return;
        }

        try {
            // Clear previous QR code
            qrDisplay.innerHTML = '<div class="loading">Generating QR code...</div>';

            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.id = 'qr-canvas';
            
            // Generate QR code
            await QRCode.toCanvas(canvas, input, {
                width: size,
                height: size,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor
                },
                errorCorrectionLevel: 'M',
                margin: 2
            });

            // If logo is uploaded, add it to the QR code
            if (this.logoDataURL) {
                await this.addLogoToQR(canvas);
            }

            // Display the QR code
            qrDisplay.innerHTML = '';
            qrDisplay.appendChild(canvas);

            // Show action buttons
            actionButtons.style.display = 'flex';

            // Store current QR code
            this.currentQRCode = canvas;

        } catch (error) {
            console.error('Error generating QR code:', error);
            qrDisplay.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error generating QR code. Please try again.</p>
                </div>
            `;
            actionButtons.style.display = 'none';
        }
    }

    async addLogoToQR(canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            img.onload = () => {
                const logoSize = canvas.width * 0.15; // 15% of QR code size
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;

                // Create a white background circle for the logo
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
                ctx.fill();

                // Draw the logo
                ctx.drawImage(img, x, y, logoSize, logoSize);
                resolve();
            };
            
            img.onerror = reject;
            img.src = this.logoDataURL;
        });
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        const logoPreview = document.getElementById('logo-preview');

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.logoFile = file;
                this.logoDataURL = e.target.result;
                
                // Show logo preview
                logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo preview">`;
                logoPreview.style.display = 'block';
                
                // Regenerate QR code with logo
                this.generateQRCode();
            };
            
            reader.readAsDataURL(file);
        } else {
            // Clear logo
            this.logoFile = null;
            this.logoDataURL = null;
            logoPreview.style.display = 'none';
            logoPreview.innerHTML = '';
            
            // Regenerate QR code without logo
            this.generateQRCode();
        }
    }

    downloadQRCode(format) {
        if (!this.currentQRCode) {
            alert('Please generate a QR code first!');
            return;
        }

        const input = document.getElementById('qr-input').value.trim();
        const filename = `qr-code-${Date.now()}`;

        if (format === 'png') {
            // Download as PNG
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = this.currentQRCode.toDataURL();
            link.click();
        } else if (format === 'svg') {
            // Generate SVG version
            this.generateSVGQRCode(input, filename);
        }
    }

    async generateSVGQRCode(input, filename) {
        const foregroundColor = document.getElementById('foreground-color').value;
        const backgroundColor = document.getElementById('background-color').value;
        const size = parseInt(document.getElementById('qr-size').value);

        try {
            // Generate SVG QR code
            const svgString = await QRCode.toString(input, {
                type: 'svg',
                width: size,
                height: size,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor
                },
                errorCorrectionLevel: 'M',
                margin: 2
            });

            // Create download link
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${filename}.svg`;
            link.href = url;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating SVG:', error);
            alert('Error generating SVG. Please try again.');
        }
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        info: '#17a2b8',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('QR Brand Studio initialized');
    new QRBrandStudio();
    
    // Add some interactive feedback
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', () => {
        showNotification('QR code generated successfully!', 'success');
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate QR code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('generate-btn').click();
    }
    
    // Ctrl/Cmd + D to download PNG
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn.style.display !== 'none') {
            downloadBtn.click();
        }
    }
});

// Add some Easter eggs and fun interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add sparkle effect to the logo
    const logo = document.querySelector('.logo i');
    if (logo) {
        logo.addEventListener('click', () => {
            logo.style.transform = 'rotate(360deg) scale(1.2)';
            logo.style.transition = 'transform 0.6s ease';
            setTimeout(() => {
                logo.style.transform = 'rotate(0deg) scale(1)';
            }, 600);
            showNotification('✨ Welcome to QR Brand Studio!', 'info');
        });
    }
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}); 