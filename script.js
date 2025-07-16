const apiKey = 'AIzaSyDaSfgPlMI9tETf7roHiHtEchpmxonM8N4';

document.addEventListener('DOMContentLoaded', () => {
  console.log('The Vibe Check page loaded');
  
  const imageUploader = document.getElementById('image-uploader');
  const imagePreview = document.getElementById('image-preview');
  const jsonOutput = document.getElementById('json-output');
  const voiceSelector = document.getElementById('voice-selector');
  
  // Load available voices
  loadVoices();
  
  // Load voices when they become available (some browsers load them asynchronously)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
  
  imageUploader.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
      // Display the image preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        
        // Analyze the image after it's displayed
        await analyzeImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
});

function loadVoices() {
  const voiceSelector = document.getElementById('voice-selector');
  const voices = speechSynthesis.getVoices();
  
  // Clear existing options
  voiceSelector.innerHTML = '';
  
  if (voices.length === 0) {
    voiceSelector.innerHTML = '<option value="">Loading voices...</option>';
    return;
  }
  
  // Filter to English voices and sort by quality/type
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  // Categorize voices
  const premiumVoices = englishVoices.filter(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Microsoft') ||
    !voice.localService
  );
  
  const systemVoices = englishVoices.filter(voice => 
    voice.localService && 
    !voice.name.includes('Google') && 
    !voice.name.includes('Microsoft')
  );
  
  // Add premium voices first
  if (premiumVoices.length > 0) {
    const premiumGroup = document.createElement('optgroup');
    premiumGroup.label = '🌟 Premium Voices';
    premiumVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      premiumGroup.appendChild(option);
    });
    voiceSelector.appendChild(premiumGroup);
  }
  
  // Add system voices
  if (systemVoices.length > 0) {
    const systemGroup = document.createElement('optgroup');
    systemGroup.label = '🔧 System Voices';
    systemVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      systemGroup.appendChild(option);
    });
    voiceSelector.appendChild(systemGroup);
  }
  
  // Select a good default voice (prefer British or premium voices)
  const defaultVoice = englishVoices.find(voice => 
    voice.name.includes('British') || 
    voice.name.includes('UK') ||
    voice.name.includes('Google') ||
    voice.lang.includes('en-GB')
  ) || englishVoices[0];
  
  if (defaultVoice) {
    voiceSelector.value = defaultVoice.name;
  }
}

async function analyzeImage(base64Image) {
  const jsonOutput = document.getElementById('json-output');
  
  // Show loading message
  jsonOutput.textContent = 'Loading...';
  
  try {
    // Extract base64 data and MIME type from the data URL
    const [mimeTypePart, base64Data] = base64Image.split(',');
    const mimeType = mimeTypePart.match(/data:([^;]+)/)[1];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Analyze the following image and return a JSON object with three keys: "product_name" (e.g., "sneaker"), "main_colors" (an array of strings), and "style" (e.g., "vintage").'
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the text response from Gemini
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON from the AI response
    try {
      // Look for JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      
      const parsedJson = JSON.parse(jsonString);
      
      // Display the data in a user-friendly format
      jsonOutput.textContent = `Product: ${parsedJson.product_name}
Colors: ${parsedJson.main_colors.join(', ')}
Style: ${parsedJson.style}`;
      
      // Automatically generate the hype blurb after successful analysis
      await generateHypeBlurb(parsedJson);
      
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      jsonOutput.textContent = `Error parsing JSON: ${aiResponse}`;
    }
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    jsonOutput.textContent = `Error: ${error.message}`;
  }
}

async function generateHypeBlurb(productInfo) {
  const blurbOutput = document.getElementById('blurb-output');
  
  // Show loading message
  blurbOutput.textContent = 'Loading...';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a marketing copywriter for a Gen Z brand. Using the following product attributes, write a short, exciting hype blurb (1-2 sentences): ${JSON.stringify(productInfo)}`
          }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the text response from Gemini
    const hypeBlurb = data.candidates[0].content.parts[0].text;
    
    // Display the hype blurb
    blurbOutput.textContent = hypeBlurb.trim();
    
    // Add event listener to play audio button
    const playAudioBtn = document.getElementById('play-audio-btn');
    playAudioBtn.onclick = () => playHypeAudio(hypeBlurb.trim());
    
  } catch (error) {
    console.error('Error generating hype blurb:', error);
    blurbOutput.textContent = `Error: ${error.message}`;
  }
}

function sanitizeTextForSpeech(text) {
  // Step 1: Replace em-dashes and en-dashes with commas for natural pauses
  let cleanedText = text.replace(/[—–]/g, ',');
  
  // Step 2: Simple Valley Girl replacements (no awkward commas)
  cleanedText = cleanedText.replace(/\byeehaw\b/gi, "Yee haw");
  cleanedText = cleanedText.replace(/\bomg\b/gi, "oh my god");
  
  // Step 3: Remove emojis and other non-alphanumeric characters except standard punctuation
  cleanedText = cleanedText.replace(/[^\w\s.,!?;:'"()-]/g, '');
  
  return cleanedText.trim();
}

function getBestVoice() {
  return new Promise((resolve) => {
    const findBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        // Voices not loaded yet, wait for the event
        return null;
      }
      
      let selectedVoice = null;
      
      // Priority 1: Look for Google voices (highest quality)
      selectedVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.lang.includes('en')
      );
      
      // Priority 2: Look for Microsoft voices
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.includes('Microsoft') && voice.lang.includes('en')
        );
      }
      
      // Priority 3: Look for non-local service voices (cloud-based, higher quality)
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          !voice.localService && voice.lang.includes('en')
        );
      }
      
      // Priority 4: Look for any English voice with good names
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          (voice.name.includes('Samantha') || 
           voice.name.includes('Alex') || 
           voice.name.includes('Karen') ||
           voice.name.includes('Zira')) && 
          voice.lang.includes('en')
        );
      }
      
      // Priority 5: Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('en'));
      }
      
      return selectedVoice;
    };
    
    // Try to find voice immediately
    const voice = findBestVoice();
    if (voice) {
      resolve(voice);
      return;
    }
    
    // If no voices found, wait for voices to load
    const handleVoicesChanged = () => {
      const voice = findBestVoice();
      if (voice) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voice);
      }
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback timeout in case voices never load
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(null);
    }, 3000);
  });
}

async function playHypeAudio(text) {
  // Check if speech synthesis is supported
  if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support text-to-speech!');
    return;
  }
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Sanitize the text for speech
    const sanitizedText = sanitizeTextForSpeech(text);
    
    if (!sanitizedText) {
      alert('No valid text to speak!');
      return;
    }
    
    // Get the selected voice from dropdown
    const voiceSelector = document.getElementById('voice-selector');
    const selectedVoiceName = voiceSelector.value;
    
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
    
    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    
    // Configure the voice settings for natural, energetic speech
    utterance.rate = 1.1; // Slightly faster for energy
    utterance.pitch = 1.05; // Just slightly higher pitch
    utterance.volume = 1.0; // Full volume
    
    // Set the selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using selected voice:', selectedVoice.name);
    } else {
      console.log('Using default voice');
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
  } catch (error) {
    console.error('Error playing audio:', error);
    alert('Error playing audio. Please try again.');
  }
} 