// js/ui.js

/**
 * Module này quản lý tất cả các tương tác với giao diện người dùng (DOM).
 * Nó nhận dữ liệu và hiển thị chúng, nhưng không chứa logic nghiệp vụ cốt lõi
 * hay các lệnh gọi API trực tiếp.
 */

import { svgIcons } from '../icons.js';

// --- Khai báo các phần tử DOM ---
// Việc gom tất cả các bộ chọn DOM vào một nơi giúp dễ dàng quản lý và tìm kiếm.
export const DOM = {
    authContainer: document.getElementById('auth-container'),
    appContainer: document.getElementById('app-container'),
    loginView: document.getElementById('login-view'),
    registerView: document.getElementById('register-view'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    googleLoginBtn: document.getElementById('google-login-btn'),
    showRegisterBtn: document.getElementById('show-register'),
    showLoginBtn: document.getElementById('show-login'),
    authError: document.getElementById('auth-error'),
    personaSelectionScreen: document.getElementById('persona-selection-screen'),
    welcomeUserName: document.getElementById('welcome-user-name'),
    createPersonaBtn: document.getElementById('create-persona-btn'),
    customPersonaGrid: document.getElementById('custom-persona-grid'),
    emptyCustomPersonaState: document.getElementById('empty-custom-persona-state'),
    defaultPersonaGrid: document.getElementById('default-persona-grid'),
    logoutBtnPersona: document.getElementById('logout-btn-persona'),
    chatViewContainer: document.getElementById('chat-view-container'),
    mainHeader: document.getElementById('main-header'),
    menuBtn: document.getElementById('menu-btn'),
    chatHeaderInfo: document.getElementById('chat-header-info'),
    newTopicBtn: document.getElementById('new-topic-btn'),
    summarizeBtn: document.getElementById('summarize-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    logoutBtn: document.getElementById('logout-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    sidebar: document.getElementById('sidebar'),
    closeSidebarBtn: document.getElementById('close-sidebar-btn'),
    sidebarContent: document.getElementById('sidebar-content'),
    newChatBtn: document.getElementById('new-chat-btn'),
    pinnedChatsSection: document.getElementById('pinned-chats-section'),
    pinnedChatsList: document.getElementById('pinned-chats-list'),
    savedChatsList: document.getElementById('saved-chats-list'),
    savedChatsSkeleton: document.getElementById('saved-chats-skeleton'),
    welcomeScreen: document.getElementById('welcome-screen'),
    chatContainer: document.getElementById('chat-container'),
    notificationArea: document.getElementById('notification-area'),
    suggestionArea: document.getElementById('suggestion-area'),
    toggleSuggestionsBtn: document.getElementById('toggle-suggestions-btn'),
    suggestionsContainer: document.getElementById('suggestions-container'),
    promptInput: document.getElementById('prompt-input'),
    recordBtn: document.getElementById('record-btn'),
    sendBtn: document.getElementById('send-btn'),
    personaModalOverlay: document.getElementById('persona-modal-overlay'),
    personaModal: document.getElementById('persona-modal'),
    personaModalTitle: document.getElementById('persona-modal-title'),
    closePersonaModalBtn: document.getElementById('close-persona-modal-btn'),
    personaForm: document.getElementById('persona-form'),
    personaIdInput: document.getElementById('persona-id'),
    personaNameInput: document.getElementById('persona-name'),
    personaIconInput: document.getElementById('persona-icon'),
    personaDescriptionInput: document.getElementById('persona-description'),
    personaPromptInput: document.getElementById('persona-prompt'),
    generatePromptBtn: document.getElementById('generate-prompt-btn'),
    cancelPersonaBtn: document.getElementById('cancel-persona-btn'),
    savePersonaBtn: document.getElementById('save-persona-btn'),
    referenceModalOverlay: document.getElementById('reference-modal-overlay'),
    referenceModal: document.getElementById('reference-modal'),
    referenceTitle: document.getElementById('reference-title'),
    closeReferenceModalBtn: document.getElementById('close-reference-modal-btn'),
    referenceContent: document.getElementById('reference-content'),
    referenceInputArea: document.getElementById('reference-input-area'),
    referencePromptInput: document.getElementById('reference-prompt-input'),
    referenceSendBtn: document.getElementById('reference-send-btn'),
    learningModeToggle: document.getElementById('learning-mode-toggle'),
    learningModeIndicator: document.getElementById('learning-mode-indicator'),
    scrollToTopBtn: document.getElementById("scrollToTopBtn"),
    confirmationModalOverlay: document.getElementById('confirmation-modal-overlay'),
    confirmationModal: document.getElementById('confirmation-modal'),
    confirmationModalIcon: document.getElementById('confirmation-modal-icon'),
    confirmationModalTitle: document.getElementById('confirmation-modal-title'),
    confirmationModalMessage: document.getElementById('confirmation-modal-message'),
    confirmationModalConfirmBtn: document.getElementById('confirmation-modal-confirm-btn'),
    confirmationModalCancelBtn: document.getElementById('confirmation-modal-cancel-btn'),
    welcomePersonaIcon: document.getElementById('welcome-persona-icon'),
    welcomePersonaName: document.getElementById('welcome-persona-name'),
    welcomePersonaDescription: document.getElementById('welcome-persona-description'),
    welcomeSuggestionsContainer: document.getElementById('welcome-suggestions-container'),
};


// --- Tiện ích Giao diện Chung ---

export function loadIcons() {
    document.querySelectorAll('[data-icon]').forEach(placeholder => {
        const iconName = placeholder.dataset.icon;
        if (svgIcons[iconName]) {
            const template = document.createElement('template');
            template.innerHTML = svgIcons[iconName];
            const svgElement = template.content.firstChild;
            placeholder.replaceWith(svgElement);
        }
    });
}

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    
    let bgColor, textColor, iconSVG;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-100 dark:bg-green-900';
            textColor = 'text-green-700 dark:text-green-200';
            iconSVG = svgIcons.toastSuccess;
            break;
        case 'error':
            bgColor = 'bg-red-100 dark:bg-red-900';
            textColor = 'text-red-700 dark:text-red-200';
            iconSVG = svgIcons.toastError;
            break;
        default:
            bgColor = 'bg-blue-100 dark:bg-blue-900';
            textColor = 'text-blue-700 dark:text-blue-200';
            iconSVG = svgIcons.toastInfo;
            break;
    }

    toast.className = `toast max-w-xs w-full ${bgColor} ${textColor} p-4 rounded-lg shadow-lg flex items-center space-x-3`;
    toast.innerHTML = `
        <div class="flex-shrink-0">${iconSVG}</div>
        <div class="flex-1 text-sm font-medium">${message}</div>
    `;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4000);
}

export function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Đã sao chép vào bộ nhớ đệm!', 'success');
    } catch (err) {
        showToast('Không thể sao chép.', 'error');
    }
    document.body.removeChild(textarea);
}

export function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    if (darkIcon) darkIcon.style.display = isDark ? 'none' : 'block';
    if (lightIcon) lightIcon.style.display = isDark ? 'block' : 'none';
}

export function adjustInputHeight() {
    DOM.promptInput.style.height = 'auto';
    DOM.promptInput.style.height = DOM.promptInput.scrollHeight + 'px';
}


// --- Quản lý Modals ---

export function showConfirmationModal({ title, message, confirmText = 'Xóa', confirmColor = 'red' }) {
    return new Promise(resolve => {
        // Lưu trữ hàm resolve để các nút có thể gọi nó
        DOM.confirmationModal.dataset.resolve = 'true'; 
        DOM.confirmationModal._resolver = resolve;

        DOM.confirmationModalTitle.textContent = title;
        DOM.confirmationModalMessage.textContent = message;
        DOM.confirmationModalConfirmBtn.textContent = confirmText;

        DOM.confirmationModalConfirmBtn.className = 'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto'; // Reset
        if (confirmColor === 'red') {
            DOM.confirmationModalConfirmBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            DOM.confirmationModalConfirmBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }

        DOM.confirmationModalIcon.innerHTML = svgIcons.warning;
        DOM.confirmationModalOverlay.classList.remove('hidden');
        setTimeout(() => {
            DOM.confirmationModalOverlay.classList.add('opacity-100');
            DOM.confirmationModal.classList.add('scale-100', 'opacity-100');
        }, 10);
    });
}

export function hideConfirmationModal(resolution) {
    if (DOM.confirmationModal.dataset.resolve === 'true') {
        DOM.confirmationModal._resolver(resolution);
        DOM.confirmationModal.dataset.resolve = 'false';
    }
    DOM.confirmationModalOverlay.classList.remove('opacity-100');
    DOM.confirmationModal.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => DOM.confirmationModalOverlay.classList.add('hidden'), 300);
}

export function openPersonaModal(personaToEdit = null) {
    DOM.personaForm.reset();
    if (personaToEdit) {
        DOM.personaModalTitle.textContent = 'Chỉnh sửa Persona';
        DOM.personaIdInput.value = personaToEdit.id;
        DOM.personaNameInput.value = personaToEdit.name;
        DOM.personaIconInput.value = personaToEdit.icon;
        DOM.personaDescriptionInput.value = personaToEdit.description;
        DOM.personaPromptInput.value = personaToEdit.systemPrompt;
    } else {
        DOM.personaModalTitle.textContent = 'Tạo Chuyên gia AI của bạn';
        DOM.personaIdInput.value = '';
    }
    DOM.personaModalOverlay.classList.remove('hidden');
    DOM.personaModal.classList.remove('hidden');
    requestAnimationFrame(() => DOM.personaModal.classList.remove('scale-95', 'opacity-0'));
}

export function closePersonaModal() {
    DOM.personaModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        DOM.personaModalOverlay.classList.add('hidden');
        DOM.personaModal.classList.add('hidden');
    }, 300);
}


// --- Quản lý Sidebar ---

export function openSidebar() {
    DOM.sidebar.classList.remove('-translate-x-full');
    DOM.sidebarOverlay.classList.remove('hidden');
    setTimeout(() => DOM.sidebarOverlay.classList.add('opacity-100'), 10);
}

export function closeSidebar() {
    DOM.sidebar.classList.add('-translate-x-full');
    DOM.sidebarOverlay.classList.remove('opacity-100');
    setTimeout(() => DOM.sidebarOverlay.classList.add('hidden'), 300);
}


// --- Quản lý hiển thị Chat ---

function addMessageActions(actionsContainer, rawText, messageId) {
    if (!actionsContainer || !rawText || rawText.includes('blinking-cursor')) return;
    
    actionsContainer.innerHTML = '';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    copyBtn.innerHTML = svgIcons.copy;
    copyBtn.title = 'Sao chép nội dung';
    copyBtn.dataset.text = rawText;
    actionsContainer.appendChild(copyBtn);
    
    const speakBtn = document.createElement('button');
    speakBtn.className = 'speak-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    speakBtn.innerHTML = '🔊';
    speakBtn.title = 'Đọc văn bản';
    speakBtn.dataset.text = rawText;
    speakBtn.dataset.state = 'idle';
    actionsContainer.appendChild(speakBtn);

    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'regenerate-btn p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors';
    regenerateBtn.innerHTML = svgIcons.regenerate;
    regenerateBtn.title = 'Tái tạo phản hồi';
    regenerateBtn.dataset.targetId = messageId;
    actionsContainer.appendChild(regenerateBtn);
}

function highlightAllCode(container) {
    container.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
        const preElement = block.parentElement;
        if (!preElement.querySelector('.copy-code-btn')) {
             const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.textContent = 'Copy';
            button.onclick = () => {
                copyToClipboard(block.innerText);
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = 'Copy', 2000);
            };
            preElement.appendChild(button);
        }
    });
}

function preprocessText(text) {
    const learningLinkRegex = /\[([^\]]+?)\]\{"prompt":"([^"]+?)"\}/g;
    const termLinkRegex = /\[([^\]]+?)\]/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = learningLinkRegex.exec(text)) !== null) {
        parts.push(text.substring(lastIndex, match.index));
        const title = match[1];
        let prompt;
        try {
            const promptData = JSON.parse(match[2]);
            prompt = promptData.prompt;
        } catch(e) {
            prompt = match[2];
        }
        const sanitizedPrompt = prompt.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        parts.push(`<a href="#" class="learning-link" data-prompt="${sanitizedPrompt}">${title}</a>`);
        lastIndex = match.index + match[0].length;
    }
    parts.push(text.substring(lastIndex));

    return parts.map(part => {
        if (part.startsWith('<a href="#" class="learning-link')) {
            return part;
        }
        return part.replace(termLinkRegex, `<a href="#" class="term-link" data-term="$1">$1</a>`);
    }).join('');
}

export function addMessage(role, text, persona) {
    const messageId = crypto.randomUUID();
    const messageWrapper = document.createElement('div');
    messageWrapper.dataset.messageId = messageId;

    let contentElem;
    let statusElem;
    let actionsContainer = null;

    if (role === 'ai' || role === 'model') {
        messageWrapper.className = 'w-full space-y-2';
        messageWrapper.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center">${svgIcons.aiAvatar}</div>
                    <span class="font-semibold text-gray-800 dark:text-gray-200">${persona?.name || 'Gemini'}</span>
                </div>
                <div class="ai-status"></div>
            </div>
            <div class="message-content text-gray-800 dark:text-gray-200" data-raw-text="${text.replace(/"/g, '&quot;')}"></div>
            <div class="message-actions mt-1 flex justify-end items-center gap-2"></div>`;
        contentElem = messageWrapper.querySelector('.message-content');
        statusElem = messageWrapper.querySelector('.ai-status');
        actionsContainer = messageWrapper.querySelector('.message-actions');
    } else { // user, note, summary
        // Simplified structure for non-AI messages
        messageWrapper.className = `flex ${role === 'user' ? 'justify-end' : ''}`;
        messageWrapper.innerHTML = `<div class="message-content px-4 py-2 rounded-2xl bg-blue-600 dark:bg-blue-700 text-white max-w-xs sm:max-w-md lg:max-w-2xl"></div>`;
        contentElem = messageWrapper.querySelector('.message-content');
    }

    const preprocessedText = preprocessText(text);
    contentElem.innerHTML = DOMPurify.sanitize(marked.parse(preprocessedText), { ADD_ATTR: ['target', 'data-term', 'data-prompt'] });

    highlightAllCode(contentElem);
    if (persona && persona.id === 'language_tutor') {
        makeForeignTextClickable(contentElem);
    }
    if (actionsContainer) {
        addMessageActions(actionsContainer, text, messageId);
    }
    
    DOM.chatContainer.insertBefore(messageWrapper, DOM.notificationArea);
    DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;

    return { messageWrapper, contentElem, statusElem, actionsContainer, messageId };
}

export function clearSuggestions() {
    DOM.suggestionsContainer.innerHTML = '';
    DOM.suggestionsContainer.classList.add('hidden');
    DOM.toggleSuggestionsBtn.classList.add('hidden');
}

export function displaySuggestions(suggestions, onSuggestionClick) {
    DOM.suggestionsContainer.innerHTML = '';
    if (suggestions.length > 0) {
        DOM.toggleSuggestionsBtn.classList.remove('hidden');
        suggestions.forEach(suggestionText => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip border border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 rounded-full px-3 py-1 text-sm hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors';
            chip.textContent = suggestionText;
            chip.onclick = () => onSuggestionClick(suggestionText);
            DOM.suggestionsContainer.appendChild(chip);
        });
    } else {
        clearSuggestions();
    }
}

export function updateChatHeader(persona) {
    if (persona) {
        DOM.chatHeaderInfo.innerHTML = `
            <span class="text-2xl">${persona.icon}</span>
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">${persona.name}</span>
        `;
    } else {
        DOM.chatHeaderInfo.innerHTML = '';
    }
}

export function createChatItem(docSnap, onSelect, onEdit, onPin, onDelete) {
    const chatData = docSnap.data();
    const chatId = docSnap.id;
    const li = document.createElement('li');
    li.className = "p-2 hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center rounded-md group";
    li.dataset.chatId = chatId;

    const titleSpan = document.createElement('span');
    titleSpan.textContent = chatData.title || 'Cuộc trò chuyện mới';
    titleSpan.className = "flex-1 truncate pr-2 text-gray-800 dark:text-gray-200 text-sm";
    
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'flex items-center opacity-0 group-hover:opacity-100 transition-opacity';
    buttonsWrapper.innerHTML = `
        <button class="edit-btn p-1 text-gray-400 hover:text-blue-500 rounded-full" title="Sửa tiêu đề">${svgIcons.edit}</button>
        <button class="pin-btn p-1 text-gray-400 hover:text-yellow-500 rounded-full" title="${chatData.isPinned ? "Bỏ ghim" : "Ghim"}">${chatData.isPinned ? svgIcons.unpin : svgIcons.pin}</button>
        <button class="delete-btn p-1 text-gray-400 hover:text-red-600 rounded-full" title="Xóa cuộc trò chuyện">${svgIcons.delete}</button>
    `;
    
    li.appendChild(titleSpan);
    li.appendChild(buttonsWrapper);

    buttonsWrapper.querySelector('.edit-btn').onclick = (e) => { e.stopPropagation(); onEdit(chatId, chatData.title); };
    buttonsWrapper.querySelector('.pin-btn').onclick = (e) => { e.stopPropagation(); onPin(chatId, chatData.isPinned || false); };
    buttonsWrapper.querySelector('.delete-btn').onclick = (e) => { e.stopPropagation(); onDelete(chatId); };
    li.onclick = () => onSelect(chatId);

    return li;
}


// --- Quản lý hiển thị Persona ---
export function renderPersonaCards(grid, personas, isCustom, onSelect, onEdit, onDelete) {
    grid.innerHTML = '';
    personas.forEach(persona => {
        const card = createPersonaCard(persona, isCustom, onSelect, onEdit, onDelete);
        grid.appendChild(card);
    });
}

function createPersonaCard(persona, isCustom, onSelect, onEdit, onDelete) {
    const card = document.createElement('div');
    card.className = 'persona-card cursor-pointer p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex flex-col items-center text-center h-full';
    card.onclick = () => onSelect(persona.id, isCustom);
    card.innerHTML = `
        <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">${persona.icon}</div>
        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">${persona.name}</h3>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1">${persona.description}</p>
    `;
    if (isCustom) {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'custom-persona-actions flex items-center gap-1';
        actionsWrapper.innerHTML = `
            <button class="edit-persona-btn p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400" title="Chỉnh sửa">${svgIcons.edit}</button>
            <button class="delete-persona-btn p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" title="Xóa">${svgIcons.delete}</button>
        `;
        actionsWrapper.querySelector('.edit-persona-btn').onclick = (e) => { e.stopPropagation(); onEdit(persona); };
        actionsWrapper.querySelector('.delete-persona-btn').onclick = (e) => { e.stopPropagation(); onDelete(persona.id, persona.name); };
        card.appendChild(actionsWrapper);
    }
    return card;
}

export function showWelcomeScreenForPersona(persona, onSuggestionClick) {
    if (!persona) return;
    DOM.welcomeScreen.classList.remove('hidden');
    DOM.welcomeScreen.classList.add('flex');
    DOM.chatContainer.classList.add('hidden');

    DOM.welcomePersonaIcon.textContent = persona.icon;
    DOM.welcomePersonaName.textContent = persona.name;
    DOM.welcomePersonaDescription.textContent = persona.description;
    
    const container = DOM.welcomeSuggestionsContainer;
    container.innerHTML = '';

    if (persona.samplePrompts && persona.samplePrompts.length > 0) {
        persona.samplePrompts.forEach(text => {
            const card = document.createElement('button');
            card.className = 'w-full p-4 text-left border dark:border-gray-700 rounded-lg welcome-suggestion-card';
            card.textContent = text;
            card.onclick = () => onSuggestionClick(text);
            container.appendChild(card);
        });
    }
}
