const { createApp, ref, nextTick, onMounted, computed } = Vue;

createApp({
    setup() {
        // --- State ---
        const currentView = ref('hero'); // hero, loading, dashboard
        const locationQuery = ref('');
        const loadingStatus = ref('Connecting...');
        const userMessage = ref('');
        const isTyping = ref(false);
        const messages = ref([]); // { role: 'user'|'assistant', content: '...' }
        const sessionData = ref({ location: '', weather: '', crop: '' });

        // --- Config ---
        const API_BASE = "http://localhost:8000";

        // --- Methods ---

        const suggestions = ref([]);
        const isDemoMode = ref(false);
        let debounceTimer = null;

        // --- Methods ---

        const fetchSuggestions = async () => {
            const query = locationQuery.value.trim();

            // Clear if empty
            if (query.length < 3) {
                suggestions.value = [];
                return;
            }

            if (isDemoMode.value) {
                // Return Mock Locations
                const mocks = [
                    { name: "Madanapalle", city: "Annamayya", state: "Andhra Pradesh", country: "India" },
                    { name: "Tirupati", city: "Tirupati", state: "Andhra Pradesh", country: "India" },
                    { name: "Kuppam", city: "Chittoor", state: "Andhra Pradesh", country: "India" },
                    { name: "Kadapa", city: "YSR Kadapa", state: "Andhra Pradesh", country: "India" },
                    { name: "Vijayawada", city: "NTR", state: "Andhra Pradesh", country: "India" }
                ].filter(m => m.name.toLowerCase().includes(query.toLowerCase()));

                suggestions.value = mocks.map(m => ({
                    display_name: `${m.name}, ${m.city}, ${m.state}`,
                    full_data: m
                }));
                return;
            }

            // Debounce
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                try {
                    // Call Backend Proxy (Avoids CORS/Blocking)
                    const res = await axios.get(`${API_BASE}/search`, {
                        params: {
                            q: query
                        }
                    });

                    // Photon returns { features: [ ... ] } via proxy
                    suggestions.value = res.data.map(f => {
                        const p = f.properties;
                        const label = [p.name, p.city, p.state, p.country].filter(Boolean).join(', ');
                        return {
                            display_name: label,
                            full_data: p
                        };
                    });
                } catch (e) {
                    console.error("Autosuggest Error:", e);
                }
            }, 300); // 300ms delay
        };

        const selectSuggestion = (place) => {
            locationQuery.value = place.display_name;
            suggestions.value = []; // Hide dropdown
        };

        const renderMarkdown = (text) => {
            return marked.parse(text);
        };

        const scrollToBottom = () => {
            nextTick(() => {
                const container = document.getElementById('chat-container');
                if (container) container.scrollTop = container.scrollHeight;
            });
        };

        const resetApp = () => {
            currentView.value = 'hero';
            messages.value = [];
            locationQuery.value = '';
            suggestions.value = [];
        };

        const quickSearch = (loc) => {
            locationQuery.value = loc;
            startAnalysis();
        };

        const startAnalysis = async () => {
            if (!locationQuery.value.trim()) return;

            // Transition to Loading
            currentView.value = 'loading';

            // Simulation Steps
            const steps = [
                "📡 Connecting to ISRO Satellite Nodes...",
                "📊 Fetching Real-Time Soil Data...",
                "🌦️ Analyzing Weather Patterns...",
                "🤖 Constructing Agronomist Profile..."
            ];

            let i = 0;
            const interval = setInterval(() => {
                if (i < steps.length) {
                    loadingStatus.value = steps[i];
                    i++;
                }
            }, 800);

            if (isDemoMode.value) {
                // Mock Analysis Response
                setTimeout(() => {
                    clearInterval(interval);
                    sessionData.value = {
                        location: locationQuery.value,
                        weather: "28°C",
                        crop: "sugar-cane",
                        full_data: { inputs_used: { N: 180, P: 45 } }
                    };

                    messages.value.push({
                        role: 'assistant',
                        content: `## Analysis Complete for ${locationQuery.value} 🌾\n\nI have analyzed the soil and weather conditions (DEMO MODE).\n\n**Primary Recommendation:** SUGARCANE\n\n### 📝 AI Audit Report\n**Assessment:** Excellent\n**Reasoning:** The soil Nitrogen levels (180) and moderate rainfall are perfect for Sugarcane in this region.\n\n---\n*How can I help you further? Ask about profit, fertilizers, or specific farming tips.*`
                    });

                    currentView.value = 'dashboard';
                    nextTick(() => lucide.createIcons());
                }, 2500);
                return;
            }

            try {
                // API Call
                const response = await axios.post(`${API_BASE}/predict`, {
                    district: "Chittoor", // Default/Inferred
                    village: locationQuery.value
                });

                const data = response.data;
                clearInterval(interval);

                // Setup Session Data
                sessionData.value = {
                    location: locationQuery.value,
                    weather: `${data.inputs_used.temperature}°C`,
                    crop: data.recommended_crop,
                    full_data: data
                };

                // Add Initial AI Message (The Audit)
                messages.value.push({
                    role: 'assistant',
                    content: `## Analysis Complete for ${locationQuery.value} 🌾\n\nI have analyzed the soil and weather conditions.\n\n**Primary Recommendation:** ${data.recommended_crop.toUpperCase()}\n\n### 📝 AI Audit Report\n${data.ai_audit}\n\n---\n*How can I help you further? Ask about profit, fertilizers, or specific farming tips.*`
                });

                // Transition to Dashboard
                currentView.value = 'dashboard';
                nextTick(() => lucide.createIcons()); // Re-init icons

            } catch (error) {
                clearInterval(interval);
                console.error(error);
                let errMsg = "Backend Connection Failed! Is the server running?";
                if (error.response && error.response.data && error.response.data.detail) {
                    errMsg = "Error: " + error.response.data.detail;
                } else if (error.message) {
                    errMsg = "Error: " + error.message;
                }
                alert(errMsg);
                currentView.value = 'hero';
            }
        };

        const sendMessage = async () => {
            if (!userMessage.value.trim() || isTyping.value) return;

            const text = userMessage.value;
            userMessage.value = ''; // Clear input

            // Add User Message
            messages.value.push({ role: 'user', content: text });
            scrollToBottom();
            isTyping.value = true;

            if (isDemoMode.value) {
                setTimeout(() => {
                    messages.value.push({
                        role: 'assistant',
                        content: `(DEMO REPLY) That's a great question about ${text}! Based on the soil report for ${sessionData.value.location}, I recommend checking the current market price for rice as well, which is around ₹2100/quintal in AP.`
                    });
                    isTyping.value = false;
                    scrollToBottom();
                    nextTick(() => lucide.createIcons());
                }, 1000);
                return;
            }

            try {
                // Prepare Context
                const context = {
                    crop: sessionData.value.crop,
                    location: sessionData.value.location,
                    soil: `N:${sessionData.value.full_data.inputs_used.N} P:${sessionData.value.full_data.inputs_used.P}`,
                    weather: sessionData.value.weather
                };

                // Simplify History for API (last 6 messages)
                const apiHistory = messages.value.slice(-6).map(m => ({
                    role: m.role,
                    content: m.content
                }));

                const response = await axios.post(`${API_BASE}/chat`, {
                    user_query: text,
                    history: apiHistory,
                    context: context
                });

                // Add AI Reply
                messages.value.push({
                    role: 'assistant',
                    content: response.data.reply
                });

            } catch (error) {
                messages.value.push({
                    role: 'assistant',
                    content: "⚠️ **Connection Error**: I couldn't reach the server. Please try again."
                });
            } finally {
                isTyping.value = false;
                scrollToBottom();
                nextTick(() => lucide.createIcons());
            }
        };

        // Lifecycle loops
        onMounted(() => {
            console.log("🚀 Crop Recommendation AI Frontend Loaded");
            lucide.createIcons();
        });

        const toggleDemo = () => {
            isDemoMode.value = !isDemoMode.value;
            // Give Vue a tick to update DOM then re-draw icons for the new button state
            nextTick(() => lucide.createIcons());
        };

        return {
            currentView,
            locationQuery,
            loadingStatus,
            messages,
            userMessage,
            isTyping,
            sessionData,
            chatHistory: computed(() => messages.value.filter(m => m.role === 'user')),
            startAnalysis,
            sendMessage,
            renderMarkdown,
            resetApp,
            quickSearch,
            suggestions,
            fetchSuggestions,
            selectSuggestion,
            isDemoMode,
            toggleDemo
        };
    }
}).mount('#app');
