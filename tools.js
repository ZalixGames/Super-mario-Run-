// AI API Integration
const AI_API_KEY = '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';
const AI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callAI(prompt) {
    try {
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'MultiToolsHub',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-coder',
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI API Error:', error);
        return 'Sorry, there was an error generating the content. Please try again.';
    }
}

// Instagram Bio Generator
async function loadInstagramBioGenerator() {
    const content = `
        <div class="tool-container">
            <h2>Instagram Bio Generator</h2>
            <div class="input-group">
                <input type="text" id="bioKeywords" placeholder="Enter keywords or themes for your bio">
                <button onclick="generateInstagramBio()">Generate Bio</button>
            </div>
            <div class="result-container">
                <textarea id="bioResult" readonly placeholder="Your generated bio will appear here..."></textarea>
                <button onclick="copyToClipboard('bioResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

async function generateInstagramBio() {
    const keywords = document.getElementById('bioKeywords').value;
    const prompt = `Generate a creative and engaging Instagram bio using these keywords: ${keywords}. Make it unique and trendy.`;
    const result = await callAI(prompt);
    document.getElementById('bioResult').value = result;
}

// YouTube Tags Generator
async function loadYouTubeTagsGenerator() {
    const content = `
        <div class="tool-container">
            <h2>YouTube Tags Generator</h2>
            <div class="input-group">
                <input type="text" id="videoTitle" placeholder="Enter your video title">
                <input type="text" id="videoDescription" placeholder="Enter your video description">
                <button onclick="generateYouTubeTags()">Generate Tags</button>
            </div>
            <div class="result-container">
                <textarea id="tagsResult" readonly placeholder="Your generated tags will appear here..."></textarea>
                <button onclick="copyToClipboard('tagsResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

async function generateYouTubeTags() {
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const prompt = `Generate relevant and optimized YouTube tags for a video with title: "${title}" and description: "${description}". Include trending and related tags.`;
    const result = await callAI(prompt);
    document.getElementById('tagsResult').value = result;
}

// Free Fire Nickname Generator
async function loadFreeFireNicknameGenerator() {
    const content = `
        <div class="tool-container">
            <h2>Free Fire Nickname Generator</h2>
            <div class="input-group">
                <input type="text" id="nicknameStyle" placeholder="Enter preferred style (e.g., cool, cute, scary)">
                <button onclick="generateFreeFireNickname()">Generate Nickname</button>
            </div>
            <div class="result-container">
                <textarea id="nicknameResult" readonly placeholder="Your generated nickname will appear here..."></textarea>
                <button onclick="copyToClipboard('nicknameResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

async function generateFreeFireNickname() {
    const style = document.getElementById('nicknameStyle').value;
    const prompt = `Generate a unique and creative Free Fire nickname in ${style} style. Include special characters and make it look cool.`;
    const result = await callAI(prompt);
    document.getElementById('nicknameResult').value = result;
}

// PUBG Nickname Generator
async function loadPUBGNicknameGenerator() {
    const content = `
        <div class="tool-container">
            <h2>PUBG Nickname Generator</h2>
            <div class="input-group">
                <input type="text" id="pubgStyle" placeholder="Enter preferred style (e.g., cool, cute, scary)">
                <button onclick="generatePUBGNickname()">Generate Nickname</button>
            </div>
            <div class="result-container">
                <textarea id="pubgNicknameResult" readonly placeholder="Your generated nickname will appear here..."></textarea>
                <button onclick="copyToClipboard('pubgNicknameResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

async function generatePUBGNickname() {
    const style = document.getElementById('pubgStyle').value;
    const prompt = `Generate a unique and creative PUBG nickname in ${style} style. Include special characters and make it look cool.`;
    const result = await callAI(prompt);
    document.getElementById('pubgNicknameResult').value = result;
}

// YouTube Video Downloader
function loadYouTubeDownloader() {
    const content = `
        <div class="tool-container">
            <h2>YouTube Video Downloader</h2>
            <div class="input-group">
                <input type="text" id="youtubeUrl" placeholder="Enter YouTube video URL">
                <button onclick="downloadYouTubeVideo()">Download</button>
            </div>
            <div class="result-container">
                <div id="downloadOptions"></div>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

// TikTok Video Downloader
function loadTikTokDownloader() {
    const content = `
        <div class="tool-container">
            <h2>TikTok Video Downloader</h2>
            <div class="input-group">
                <input type="text" id="tiktokUrl" placeholder="Enter TikTok video URL">
                <button onclick="downloadTikTokVideo()">Download</button>
            </div>
            <div class="result-container">
                <div id="tiktokDownloadOptions"></div>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

// USDT to PKR Converter
function loadCurrencyConverter() {
    const content = `
        <div class="tool-container">
            <h2>USDT to PKR Converter</h2>
            <div class="input-group">
                <div class="currency-input-wrapper">
                    <span class="currency-symbol">₮</span>
                    <input type="number" id="usdtAmount" placeholder="Enter USDT amount" step="0.01" min="0">
                </div>
                <button onclick="convertCurrency()" class="convert-btn">
                    <i class="fas fa-exchange-alt"></i> Convert
                </button>
            </div>
            <div class="result-container">
                <div id="conversionResult" class="conversion-result">
                    <div class="rate-info">Current Rate: <span id="currentRate">Loading...</span></div>
                    <div class="converted-amount">PKR: <span id="convertedAmount">0.00</span></div>
                </div>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
    // Fetch initial rate
    updateExchangeRate();
}

async function updateExchangeRate() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT');
        const data = await response.json();
        const usdtRate = parseFloat(data.price);
        
        // Get PKR rate from another API
        const pkrResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const pkrData = await pkrResponse.json();
        const pkrRate = pkrData.rates.PKR;
        
        const finalRate = usdtRate * pkrRate;
        document.getElementById('currentRate').textContent = `1 USDT = ${finalRate.toFixed(2)} PKR`;
        return finalRate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        document.getElementById('currentRate').textContent = 'Error fetching rate';
        return null;
    }
}

async function convertCurrency() {
    const amount = document.getElementById('usdtAmount').value;
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const rate = await updateExchangeRate();
    if (rate) {
        const convertedAmount = amount * rate;
        document.getElementById('convertedAmount').textContent = convertedAmount.toFixed(2);
    }
}

// Fancy Text Generator
async function loadFancyTextGenerator() {
    const content = `
        <div class="tool-container">
            <h2>Fancy Text Generator</h2>
            <div class="input-group">
                <input type="text" id="fancyText" placeholder="Enter your text">
                <button onclick="generateFancyText()">Generate</button>
            </div>
            <div class="result-container">
                <textarea id="fancyTextResult" readonly placeholder="Your fancy text will appear here..."></textarea>
                <button onclick="copyToClipboard('fancyTextResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

async function generateFancyText() {
    const text = document.getElementById('fancyText').value;
    const prompt = `Convert this text into fancy/stylish text with different fonts and styles: "${text}". Include multiple variations.`;
    const result = await callAI(prompt);
    document.getElementById('fancyTextResult').value = result;
}

// Password Generator
function loadPasswordGenerator() {
    const content = `
        <div class="tool-container">
            <h2>Password Generator</h2>
            <div class="input-group">
                <label>
                    <input type="checkbox" id="includeUppercase" checked> Uppercase
                </label>
                <label>
                    <input type="checkbox" id="includeNumbers" checked> Numbers
                </label>
                <label>
                    <input type="checkbox" id="includeSymbols" checked> Symbols
                </label>
                <input type="number" id="passwordLength" value="12" min="8" max="32">
                <button onclick="generatePassword()">Generate Password</button>
            </div>
            <div class="result-container">
                <input type="text" id="passwordResult" readonly>
                <button onclick="copyToClipboard('passwordResult')">Copy to Clipboard</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

function generatePassword() {
    const length = document.getElementById('passwordLength').value;
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;

    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('passwordResult').value = password;
}

// QR Code Generator
function loadQRGenerator() {
    const content = `
        <div class="tool-container">
            <h2>QR Code Generator</h2>
            <div class="input-group">
                <input type="text" id="qrContent" placeholder="Enter text or URL">
                <button onclick="generateQRCode()">Generate QR Code</button>
            </div>
            <div class="result-container">
                <div id="qrCodeResult"></div>
                <button onclick="downloadQRCode()">Download QR Code</button>
            </div>
        </div>
    `;
    modalContent.innerHTML = content;
}

// Utility Functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}

// Add loading animation styles
const style = document.createElement('style');
style.textContent = `
    .loading {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #666;
    }
    
    .tool-container {
        padding: 1.5rem;
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .input-group {
        margin-bottom: 1.5rem;
    }
    
    .input-group input,
    .input-group button {
        margin: 0.5rem 0;
        padding: 0.8rem;
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .input-group input:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        outline: none;
    }
    
    .input-group button {
        background: #3498db;
        color: white;
        border: none;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s ease;
    }
    
    .input-group button:hover {
        background: #2980b9;
    }
    
    .result-container {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .result-container textarea {
        width: 100%;
        min-height: 120px;
        margin-bottom: 0.8rem;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        resize: vertical;
    }

    .currency-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .currency-symbol {
        position: absolute;
        left: 12px;
        color: #666;
        font-size: 1.2rem;
    }

    .currency-input-wrapper input {
        padding-left: 35px;
    }

    .conversion-result {
        text-align: center;
        padding: 1rem;
    }

    .rate-info {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
    }

    .converted-amount {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
    }

    .convert-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style); 