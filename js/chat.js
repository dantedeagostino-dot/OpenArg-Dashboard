/**
 * OpenArg AI Chat — Frontend Module
 * Especialista en Modernización Municipal y Datos Abiertos
 * Laboratorio Colossus
 */
(function () {
    'use strict';

    // ── Config ──
    const API_URL = '/api/chat';
    const MAX_HISTORY = 20;
    const MAX_MESSAGE_LENGTH = 4000;
    const RETRY_DELAYS = [1000, 3000, 8000];

    // ── State ──
    let isOpen = false;
    let isLoading = false;
    let conversationHistory = [];
    let messageCount = 0;

    // ── Suggestion Chips ──
    const SUGGESTIONS = [
        '¿Cuál es el estado actual de datos abiertos en Argentina?',
        '¿Cómo inicio la modernización de mi municipio?',
        '¿Qué es el Estado Agéntico?',
        '¿Cómo implemento expediente electrónico?',
        '¿Qué ranking de transparencia tiene mi provincia?',
        '¿Qué es la interoperabilidad y por qué importa?'
    ];

    // ── Initialize ──
    function init() {
        const fab = document.getElementById('openarg-chat-fab');
        const chatWindow = document.getElementById('openarg-chat-window');
        const closeBtn = document.getElementById('openarg-chat-close');
        const form = document.getElementById('openarg-chat-form');
        const input = document.getElementById('openarg-chat-input');
        const clearBtn = document.getElementById('openarg-chat-clear');
        const exportBtn = document.getElementById('openarg-chat-export');

        if (!fab || !chatWindow) return;

        fab.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);
        form.addEventListener('submit', handleSubmit);
        clearBtn.addEventListener('click', clearChat);
        exportBtn.addEventListener('click', exportPDF);

        // Suggestion chips
        document.querySelectorAll('.openarg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.textContent;
                handleSubmit(new Event('submit'));
            });
        });

        // Enter to send, Shift+Enter for newline
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Welcome message
        addMessage('assistant', '¡Hola! 👋 Soy **OpenArg AI**, tu asistente especializado en modernización municipal y datos abiertos de Argentina.\n\nPodés preguntarme sobre:\n- 📊 Rankings de transparencia provincial\n- 🏛️ Cómo modernizar tu municipio paso a paso\n- 🤖 El Estado Agéntico y la IA en gobierno\n- 📋 Expediente electrónico, firma digital, interoperabilidad\n\n¿En qué puedo ayudarte?');
    }

    // ── Toggle Chat ──
    function toggleChat() {
        isOpen = !isOpen;
        const chatWindow = document.getElementById('openarg-chat-window');
        const fab = document.getElementById('openarg-chat-fab');

        if (isOpen) {
            chatWindow.classList.add('open');
            fab.classList.add('hidden');
            setTimeout(() => {
                document.getElementById('openarg-chat-input')?.focus();
            }, 300);
        } else {
            chatWindow.classList.remove('open');
            fab.classList.remove('hidden');
        }
    }

    // ── Handle Submit ──
    async function handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('openarg-chat-input');
        const message = input.value.trim();
        if (!message || isLoading) return;
        if (message.length > MAX_MESSAGE_LENGTH) {
            addMessage('assistant', '⚠️ El mensaje es demasiado largo. Por favor, acortalo a menos de 4,000 caracteres.');
            return;
        }

        input.value = '';
        input.style.height = 'auto';
        hideChips();

        addMessage('user', message);
        conversationHistory.push({ role: 'user', parts: message });

        const context = gatherContext();
        await sendMessage(message, context);
    }

    // ── Send Message with Retry ──
    async function sendMessage(message, context, attempt = 0) {
        isLoading = true;
        showTyping();

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    history: conversationHistory.slice(-MAX_HISTORY),
                    context
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Error ${res.status}`);
            }

            const data = await res.json();
            hideTyping();

            addMessage('assistant', data.reply);
            conversationHistory.push({ role: 'model', parts: data.reply });

        } catch (error) {
            hideTyping();

            if (error.name === 'AbortError') {
                addMessage('assistant', '⏱️ La respuesta tardó demasiado. Intentá de nuevo con una pregunta más corta.');
            } else if (attempt < RETRY_DELAYS.length && (error.message.includes('429') || error.message.includes('500') || error.message.includes('fetch'))) {
                addMessage('assistant', `⏳ Reintentando en ${RETRY_DELAYS[attempt] / 1000}s...`);
                await sleep(RETRY_DELAYS[attempt]);
                removeLastMessage();
                return sendMessage(message, context, attempt + 1);
            } else {
                addMessage('assistant', `❌ ${error.message || 'Error de conexión. Verificá tu internet e intentá de nuevo.'}`);
            }
        } finally {
            isLoading = false;
        }
    }

    // ── Gather Dashboard Context ──
    function gatherContext() {
        const parts = [];
        // Active tab
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id?.replace('tab-', '') || '';
            const tabNames = {
                inicio: 'Inicio (KPIs generales)',
                transparencia: 'Transparencia y Datos (rankings INTRA/ITPP, infraestructura)',
                desafios: 'Desafíos 2026 (talento, ciberseguridad, sistemas heredados)',
                democracia: 'Democracia e IA Agéntica (Estado Agéntico, 12 capas)',
                datasets: 'Exploración de Datasets (32 portales, 23,101 archivos)',
                tecnologias: 'Laboratorio Colossus Lab (proyectos)'
            };
            parts.push(`Tab activo: ${tabNames[tabId] || tabId}`);
        }
        // Theme
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        parts.push(`Tema: ${theme}`);
        return parts.join('. ');
    }

    // ── Add Message to Chat ──
    function addMessage(role, text) {
        messageCount++;
        const container = document.getElementById('openarg-chat-messages');
        const div = document.createElement('div');
        div.className = `openarg-msg openarg-msg-${role}`;
        div.id = `msg-${messageCount}`;

        const bubble = document.createElement('div');
        bubble.className = 'openarg-bubble';
        bubble.innerHTML = role === 'assistant' ? renderMarkdown(text) : escapeHtml(text);

        const time = document.createElement('div');
        time.className = 'openarg-msg-time';
        time.textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        div.appendChild(bubble);
        div.appendChild(time);
        container.appendChild(div);

        // Animate in
        requestAnimationFrame(() => {
            div.style.opacity = '0';
            div.style.transform = 'translateY(10px)';
            requestAnimationFrame(() => {
                div.style.transition = 'opacity 0.3s, transform 0.3s';
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            });
        });

        scrollToBottom();
    }

    // ── Remove Last Message (for retry) ──
    function removeLastMessage() {
        const container = document.getElementById('openarg-chat-messages');
        const last = container.lastElementChild;
        if (last) last.remove();
    }

    // ── Typing Indicator ──
    function showTyping() {
        const container = document.getElementById('openarg-chat-messages');
        const div = document.createElement('div');
        div.className = 'openarg-msg openarg-msg-assistant';
        div.id = 'openarg-typing';
        div.innerHTML = `<div class="openarg-bubble openarg-typing"><span></span><span></span><span></span></div>`;
        container.appendChild(div);
        scrollToBottom();
    }

    function hideTyping() {
        document.getElementById('openarg-typing')?.remove();
    }

    // ── Suggestion Chips ──
    function hideChips() {
        const chips = document.getElementById('openarg-chat-chips');
        if (chips) chips.style.display = 'none';
    }

    // ── Clear Chat ──
    function clearChat() {
        conversationHistory = [];
        const container = document.getElementById('openarg-chat-messages');
        container.innerHTML = '';
        const chips = document.getElementById('openarg-chat-chips');
        if (chips) chips.style.display = 'flex';
        addMessage('assistant', '🔄 Conversación reiniciada. ¿En qué puedo ayudarte?');
    }

    // ── Export PDF ──
    function exportPDF() {
        const messages = document.querySelectorAll('.openarg-msg');
        if (messages.length <= 1) return;

        let content = '# Conversación OpenArg AI\n';
        content += `Fecha: ${new Date().toLocaleDateString('es-AR')}\n\n---\n\n`;

        messages.forEach(msg => {
            const isUser = msg.classList.contains('openarg-msg-user');
            const bubble = msg.querySelector('.openarg-bubble');
            const time = msg.querySelector('.openarg-msg-time');
            const role = isUser ? '**Vos**' : '**OpenArg AI**';
            content += `${role} (${time?.textContent || ''}):\n${bubble?.textContent || ''}\n\n---\n\n`;
        });

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpenArg_Chat_${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── Markdown Renderer ──
    function renderMarkdown(text) {
        if (!text) return '';
        let html = escapeHtml(text);

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h4 class="openarg-md-h4">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 class="openarg-md-h3">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 class="openarg-md-h2">$1</h2>');
        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr class="openarg-md-hr">');
        // Unordered lists
        html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="openarg-md-list">$&</ul>');
        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        // Clean up
        html = html.replace(/<br><br>/g, '</p><p>');
        html = html.replace(/<br>(<h[234])/g, '$1');
        html = html.replace(/(<\/h[234]>)<br>/g, '$1');
        html = html.replace(/<br>(<ul)/g, '$1');
        html = html.replace(/(<\/ul>)<br>/g, '$1');
        html = html.replace(/<br>(<hr)/g, '$1');
        html = html.replace(/(<hr[^>]*>)<br>/g, '$1');

        return html;
    }

    // ── Helpers ──
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function scrollToBottom() {
        const container = document.getElementById('openarg-chat-messages');
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ── Boot ──
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
