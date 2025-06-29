// js/main.js

/**
 * Đây là tệp chính (Entry Point) của ứng dụng.
 * Nó đóng vai trò là "nhạc trưởng", điều phối các module khác.
 * Nó import các hàm từ `services.js` (logic backend) và `ui.js` (logic giao diện)
 * và kết nối chúng lại với nhau thông qua các trình xử lý sự kiện và luồng ứng dụng.
 */

// --- Import các module ---
import * as services from './services.js';
import * as ui from './ui.js';

// --- Trạng thái toàn cục của ứng dụng ---
let currentUserId = null;
let currentUserName = '';
let currentChatId = null;
let localHistory = [];
let isRecording = false;
let isSummarizing = false;
let currentPersona = null;
let customPersonas = [];
let defaultPersonas = []; // Sẽ được định nghĩa bên dưới
let activeSpeech = null;
let lastVisibleChat = null;
let isFetchingChats = false;
let allChatsLoaded = false;
const CHATS_PER_PAGE = 15;
let isLearningMode = false;

// --- Định nghĩa Persona mặc định ---
// Giữ định nghĩa này ở main.js vì nó là dữ liệu cấu hình cốt lõi của ứng dụng
defaultPersonas = [
    { 
        id: 'general', 
        name: 'Trợ lý Toàn năng', 
        icon: '🧠', 
        description: 'Kiến thức tổng quát, trả lời đa dạng các chủ đề.', 
        systemPrompt: `**Chỉ thị hệ thống:** Mục tiêu chính của bạn là đưa ra câu trả lời rõ ràng, chi tiết và có cấu trúc tốt. Luôn sử dụng Markdown để định dạng (tiêu đề, danh sách, in đậm). Hãy giải thích các khái niệm từng bước, bắt đầu bằng tóm tắt rồi đi vào chi tiết và ví dụ. **Yêu cầu bổ sung:** Trong quá trình trả lời, khi bạn đề cập đến một thuật ngữ kỹ thuật, một khái niệm quan trọng, hoặc một tên riêng (ví dụ: tên một công nghệ, một phương pháp), hãy bọc thuật ngữ đó trong cặp dấu ngoặc vuông. Ví dụ: '...sử dụng ngôn ngữ [JavaScript] để tương tác với [DOM]...'. Chỉ bọc duy nhất thuật ngữ đó.`,
        samplePrompts: [
            "Giải thích về Lỗ đen vũ trụ như thể tôi là một đứa trẻ 10 tuổi.",
            "Lên một kế hoạch du lịch 3 ngày tại Đà Lạt cho một cặp đôi.",
            "So sánh ưu và nhược điểm của việc đọc sách giấy và sách điện tử."
        ]
    },
    { 
        id: 'programmer', 
        name: 'Chuyên gia Lập trình', 
        icon: '👨‍💻', 
        description: 'Chuyên gia về mã nguồn, thuật toán, gỡ lỗi code.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một lập trình viên cao cấp với 10 năm kinh nghiệm. Luôn đưa ra câu trả lời dưới dạng mã nguồn được giải thích rõ ràng, tuân thủ các coding convention tốt nhất. Khi được yêu cầu, hãy phân tích ưu và nhược điểm của các giải pháp khác nhau. Hãy ưu tiên tính hiệu quả và khả năng bảo trì của mã nguồn. **Yêu cầu bổ sung:** Khi đề cập đến một hàm, thư viện, hoặc khái niệm lập trình, hãy bọc nó trong dấu ngoặc vuông, ví dụ: [React], [API], [useState].`,
        samplePrompts: [
            "Viết một hàm Python để kiểm tra một chuỗi có phải là palindrome không.",
            "Giải thích sự khác biệt giữa `let`, `const`, và `var` trong JavaScript.",
            "Làm thế nào để tối ưu một truy vấn SQL có sử dụng `JOIN` trên nhiều bảng lớn?"
        ]
    },
    { 
        id: 'language_tutor', 
        name: 'Gia sư Ngoại ngữ', 
        icon: '🌐', 
        description: 'Dạy từ vựng, ngữ pháp các ngôn ngữ Á Đông.', 
        systemPrompt: `**Chỉ thị hệ thống:** Bạn là một gia sư ngôn ngữ chuyên nghiệp và thân thiện, chuyên về các ngôn ngữ Á Đông (Tiếng Trung, Nhật, Hàn). Khi dạy, hãy tuân thủ nghiêm ngặt các quy tắc sau:
1.  **Định dạng từ vựng:** Khi giới thiệu một từ mới, luôn trình bày theo cấu trúc: Ký tự gốc, sau đó là phiên âm trong ngoặc tròn (), và cuối cùng là nghĩa tiếng Việt.
    * **Tiếng Trung:** 你好 (Nǐ hǎo) - Xin chào.
    * **Tiếng Nhật:** こんにちは (Konnichiwa) - Xin chào.
    * **Tiếng Hàn:** 안녕하세요 (Annyeonghaseyo) - Xin chào.
2.  **Câu ví dụ:** Luôn cung cấp ít nhất một câu ví dụ cho mỗi từ vựng hoặc điểm ngữ pháp. Câu ví dụ cũng phải có đủ 3 thành phần: Câu gốc, phiên âm, và bản dịch.
3.  **Rõ ràng và có cấu trúc:** Sử dụng Markdown (tiêu đề, danh sách) để tổ chức bài học một cách logic và dễ theo dõi. Giọng văn của bạn phải khích lệ và kiên nhẫn.`,
        samplePrompts: [
            "Dạy tôi 5 câu chào hỏi thông dụng trong tiếng Trung.",
            "Tạo một đoạn hội thoại ngắn về chủ đề đi mua sắm bằng tiếng Nhật.",
            "Sự khác biệt giữa '은/는' và '이/가' trong tiếng Hàn là gì?"
        ]
    },
];

// --- Logic Điều phối chính ---

/**
 * Gửi tin nhắn, điều phối giữa UI và Services
 * @param {string | null} promptTextOverride - Văn bản để gửi, ghi đè nội dung input.
 */
async function sendMessage(promptTextOverride = null) {
    ui.DOM.welcomeScreen.classList.add('hidden');
    ui.DOM.chatContainer.classList.remove('hidden');

    const userDisplayedText = promptTextOverride || ui.DOM.promptInput.value.trim();
    if (!userDisplayedText || isSummarizing) return;

    if (!promptTextOverride) {
        ui.DOM.promptInput.value = '';
        ui.adjustInputHeight();
    }
    ui.DOM.sendBtn.disabled = true;
    ui.clearSuggestions();

    const userMessage = ui.addMessage('user', userDisplayedText, currentPersona);
    localHistory.push({ id: userMessage.messageId, role: 'user', parts: [{ text: userDisplayedText }] });

    const { contentElem, statusElem, actionsContainer, messageId: aiMessageId } = ui.addMessage('ai', '<span class="blinking-cursor"></span>', currentPersona);
    if (statusElem) statusElem.textContent = 'Đang suy nghĩ...';

    try {
        const historyForThisCall = localHistory.slice(0, -1)
            .filter(m => ['user', 'model'].includes(m.role))
            .map(({ role, parts }) => ({ role, parts }));
        
        let finalPrompt = userDisplayedText;
        if (isLearningMode && !promptTextOverride) {
            finalPrompt = `${LEARNING_MODE_SYSTEM_PROMPT}\n\nYêu cầu của người học: "${userDisplayedText}"`;
        }

        const stream = await services.streamAiResponse(finalPrompt, historyForThisCall);
        
        let fullResponseText = "";
        let isFirstChunk = true;
        for await (const chunk of stream) {
            if (isFirstChunk && statusElem) {
                statusElem.textContent = 'Đang viết...';
                isFirstChunk = false;
            }
            fullResponseText += chunk.text();
            
            const processedChunk = ui.preprocessText(fullResponseText + '<span class="blinking-cursor"></span>');
            contentElem.innerHTML = DOMPurify.sanitize(marked.parse(processedChunk), { ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang'] });
            ui.highlightAllCode(contentElem);
            if (currentPersona?.id === 'language_tutor') {
                ui.makeForeignTextClickable(contentElem);
            }
            ui.DOM.chatContainer.scrollTop = ui.DOM.chatContainer.scrollHeight;
        }

        if (statusElem) statusElem.classList.add('hidden');
        
        const finalProcessedText = ui.preprocessText(fullResponseText);
        contentElem.innerHTML = DOMPurify.sanitize(marked.parse(finalProcessedText), { ADD_ATTR: ['target', 'data-term', 'data-prompt', 'data-lang'] });
        contentElem.dataset.rawText = fullResponseText;
        ui.highlightAllCode(contentElem);
        if (currentPersona?.id === 'language_tutor') {
            ui.makeForeignTextClickable(contentElem);
        }
        // addMessageActions(actionsContainer, fullResponseText, aiMessageId); // This was removed in the ui.js fix, let's keep it that way for now.
        
        localHistory.push({ id: aiMessageId, role: 'model', parts: [{ text: fullResponseText }] });
        await updateOrCreateConversation();

        if (!isLearningMode) {
             const suggestions = await services.getQuickAiResponse(`Dựa vào câu trả lời sau: "${fullResponseText.substring(0, 500)}". Hãy đề xuất 3 câu hỏi tiếp theo ngắn gọn và thú vị. Chỉ trả về 3 câu hỏi, mỗi câu trên một dòng. Không đánh số, không dùng gạch đầu dòng.`);
             ui.displaySuggestions(suggestions.split('\n').filter(s => s.trim()), sendMessage);
        }

    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        contentElem.innerHTML = `**Lỗi:** ${error.message}`;
        localHistory.pop();
        ui.showToast(`Lỗi gửi tin nhắn: ${error.message}`, 'error');
    } finally {
        ui.DOM.sendBtn.disabled = false;
    }
}

async function updateOrCreateConversation() {
    if (!currentUserId || localHistory.length <= 2) return;
    
    const chatData = {
        history: localHistory,
        updatedAt: services.serverTimestamp(),
        personaId: currentPersona?.id || 'general',
    };

    try {
        if (currentChatId) {
            await services.updateConversationInDb(currentUserId, currentChatId, chatData);
        } else {
            const firstUserPrompt = localHistory.find(m => m.role === 'user' && !m.parts[0].text.startsWith('**Chỉ thị'));
            chatData.title = firstUserPrompt?.parts[0].text.substring(0, 40) || "Cuộc trò chuyện mới";
            chatData.createdAt = services.serverTimestamp();
            chatData.isPinned = false;
            const docRef = await services.createNewConversationInDb(currentUserId, chatData);
            currentChatId = docRef.id;
        }
        await renderChatHistory();
    } catch (error) {
        console.error("Lỗi khi cập nhật DB:", error);
    }
}

async function startNewChat(personaId, isCustom = false) {
    let selectedPersona = isCustom 
        ? customPersonas.find(p => p.id === personaId)
        : defaultPersonas.find(p => p.id === personaId);
    
    if (!selectedPersona) {
        ui.showToast('Không tìm thấy Persona.', 'error');
        return;
    }

    currentPersona = selectedPersona;
    currentChatId = null;
    localHistory = [
        { role: "user", parts: [{ text: currentPersona.systemPrompt }] },
        { role: "model", parts: [{ text: "Đã hiểu! Tôi đã sẵn sàng." }] }
    ];

    ui.clearSuggestions();
    ui.DOM.personaSelectionScreen.classList.add('hidden');
    ui.DOM.chatViewContainer.classList.remove('hidden');
    ui.DOM.chatViewContainer.classList.add('flex');
    ui.updateChatHeader(currentPersona);
    ui.DOM.chatContainer.innerHTML = '';
    ui.DOM.chatContainer.appendChild(ui.DOM.notificationArea);
    
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    ui.closeSidebar();
    
    ui.showWelcomeScreenForPersona(currentPersona, sendMessage);
    await renderChatHistory();
}

async function renderChatHistory() {
    if (!currentUserId || !currentPersona) {
        ui.DOM.savedChatsList.innerHTML = '';
        ui.DOM.pinnedChatsList.innerHTML = '';
        ui.DOM.pinnedChatsSection.classList.add('hidden');
        return;
    }
    
    // Render Pinned Chats
    try {
        const pinnedSnapshot = await services.fetchChatsFromDb(currentUserId, currentPersona.id, null, 100, true);
        ui.DOM.pinnedChatsList.innerHTML = '';
        ui.DOM.pinnedChatsSection.classList.toggle('hidden', pinnedSnapshot.empty);
        pinnedSnapshot.forEach(doc => {
            const li = ui.createChatItem(doc, loadChat, handleEditTitle, handlePinChat, handleDeleteChat);
            ui.DOM.pinnedChatsList.appendChild(li);
        });
    } catch (e) { console.error("Error fetching pinned chats", e); }
    
    // Render Recent Chats
    try {
        const recentSnapshot = await services.fetchChatsFromDb(currentUserId, currentPersona.id, null, CHATS_PER_PAGE, false);
        ui.DOM.savedChatsList.innerHTML = '';
        if (recentSnapshot.empty) {
            ui.DOM.savedChatsList.innerHTML = `<li class="text-center p-4 text-sm text-gray-500">Không có cuộc trò chuyện nào.</li>`;
        } else {
            recentSnapshot.forEach(doc => {
                const li = ui.createChatItem(doc, loadChat, handleEditTitle, handlePinChat, handleDeleteChat);
                ui.DOM.savedChatsList.appendChild(li);
            });
        }
    } catch (e) { console.error("Error fetching recent chats", e); }
}

async function loadChat(chatId) {
    try {
        const docSnap = await services.loadChatFromDb(currentUserId, chatId);
        if (docSnap.exists()) {
            const data = docSnap.data();
            currentChatId = chatId;
            localHistory = data.history || [];
            
            ui.DOM.welcomeScreen.classList.add('hidden');
            ui.DOM.chatContainer.classList.remove('hidden');
            ui.DOM.chatContainer.innerHTML = '';
            ui.DOM.chatContainer.appendChild(ui.DOM.notificationArea);

            localHistory.slice(2).forEach(msg => {
                ui.addMessage(msg.role, msg.parts[0].text, currentPersona);
            });

            ui.closeSidebar();
        } else {
            ui.showToast("Không tìm thấy cuộc trò chuyện!", "error");
        }
    } catch (error) {
        console.error("Lỗi khi tải cuộc trò chuyện:", error);
        ui.showToast("Lỗi khi tải cuộc trò chuyện.", "error");
    }
}

// --- Trình xử lý sự kiện (Event Handlers) ---
function setupEventListeners() {
    // Auth
    ui.DOM.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const { email, password } = ui.getAuthCredentials('login'); // Sửa lỗi ở đây
            await services.handleSignIn(email, password);
        } catch (error) { ui.showToast('Email hoặc mật khẩu không đúng.', 'error'); }
    });
    ui.DOM.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const { email, password } = ui.getAuthCredentials('register'); // Sửa lỗi ở đây
            await services.handleSignUp(email, password);
        } catch (error) { ui.showToast('Không thể tạo tài khoản.', 'error'); }
    });
    ui.DOM.googleLoginBtn.addEventListener('click', services.handleGoogleSignIn);
    ui.DOM.logoutBtn.addEventListener('click', services.handleSignOut);
    ui.DOM.logoutBtnPersona.addEventListener('click', services.handleSignOut);
    ui.DOM.showRegisterBtn.addEventListener('click', () => {
        ui.DOM.loginView.classList.add('hidden');
        ui.DOM.registerView.classList.remove('hidden');
    });
     ui.DOM.showLoginBtn.addEventListener('click', () => {
        ui.DOM.registerView.classList.add('hidden');
        ui.DOM.loginView.classList.remove('hidden');
    });

    // Chat
    ui.DOM.sendBtn.addEventListener('click', () => sendMessage());
    ui.DOM.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    ui.DOM.newChatBtn.addEventListener('click', showPersonaSelectionView);

    // UI
    ui.DOM.themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        ui.updateThemeIcon();
    });
    ui.DOM.menuBtn.addEventListener('click', ui.openSidebar);
    ui.DOM.closeSidebarBtn.addEventListener('click', ui.closeSidebar);
    ui.DOM.sidebarOverlay.addEventListener('click', ui.closeSidebar);
    ui.DOM.promptInput.addEventListener('input', ui.adjustInputHeight);

    // Modals
    ui.DOM.createPersonaBtn.addEventListener('click', () => ui.openPersonaModal());
    ui.DOM.closePersonaModalBtn.addEventListener('click', ui.closePersonaModal);
    ui.DOM.cancelPersonaBtn.addEventListener('click', ui.closePersonaModal);
    ui.DOM.personaModalOverlay.addEventListener('click', ui.closePersonaModal);
    ui.DOM.confirmationModalCancelBtn.addEventListener('click', () => ui.hideConfirmationModal(false));
    ui.DOM.confirmationModalConfirmBtn.addEventListener('click', () => ui.hideConfirmationModal(true));
    ui.DOM.confirmationModalOverlay.addEventListener('click', (e) => {
        if (e.target === ui.DOM.confirmationModalOverlay) ui.hideConfirmationModal(false);
    });
    
    // Chat container event delegation for dynamic elements
    ui.DOM.chatContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.copy-btn')) {
            ui.copyToClipboard(target.closest('.copy-btn').dataset.text);
        } else if (target.closest('.clickable-foreign')) {
            const foreignWord = target.closest('.clickable-foreign');
            ui.speakText(foreignWord.textContent, foreignWord.dataset.lang);
        }
    });
}

function handleEditTitle(chatId, oldTitle) {
    const newTitle = prompt("Nhập tiêu đề mới:", oldTitle);
    if (newTitle && newTitle.trim() !== oldTitle) {
        services.updateChatTitleInDb(currentUserId, chatId, newTitle.trim())
            .then(() => {
                ui.showToast("Đã cập nhật tiêu đề!", "success");
                renderChatHistory();
            })
            .catch(e => ui.showToast("Lỗi cập nhật tiêu đề.", "error"));
    }
}

async function handleDeleteChat(chatId) {
    const confirmed = await ui.showConfirmationModal({
        title: 'Xóa cuộc trò chuyện?',
        message: 'Hành động này không thể hoàn tác.',
        confirmColor: 'red',
        confirmText: 'Xóa vĩnh viễn'
    });
    if (confirmed) {
        try {
            await services.deleteChatFromDb(currentUserId, chatId);
            ui.showToast("Đã xóa cuộc trò chuyện.", "success");
            if (chatId === currentChatId) {
                currentChatId = null;
                localHistory = [];
                await showPersonaSelectionView();
            } else {
                await renderChatHistory();
            }
        } catch (error) {
            ui.showToast("Lỗi khi xóa.", "error");
        }
    }
}

async function handlePinChat(chatId, isPinned) {
     try {
        await services.togglePinChatInDb(currentUserId, chatId, !isPinned);
        ui.showToast(isPinned ? "Đã bỏ ghim." : "Đã ghim.", "info");
        await renderChatHistory();
    } catch (error) {
        ui.showToast("Lỗi khi ghim/bỏ ghim.", "error");
    }
}

async function showPersonaSelectionView() {
    ui.DOM.chatViewContainer.classList.add('hidden');
    ui.DOM.personaSelectionScreen.classList.remove('hidden');

    try {
        const snapshot = await services.fetchCustomPersonas(currentUserId);
        customPersonas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        ui.renderPersonaCards(ui.DOM.defaultPersonaGrid, defaultPersonas, false, startNewChat);
        ui.renderPersonaCards(ui.DOM.customPersonaGrid, customPersonas, true, startNewChat, ui.openPersonaModal, handleDeletePersona);
        
        ui.DOM.emptyCustomPersonaState.classList.toggle('hidden', customPersonas.length > 0);

    } catch (error) {
        console.error("Lỗi khi tải persona:", error);
    }
}

async function handleDeletePersona(personaId, personaName) {
     const confirmed = await ui.showConfirmationModal({
        title: `Xóa Persona "${personaName}"?`,
        message: 'Hành động này sẽ xóa vĩnh viễn persona này.',
        confirmColor: 'red',
        confirmText: 'Xóa'
    });
    if (confirmed) {
        try {
            await services.deletePersona(currentUserId, personaId);
            ui.showToast("Persona đã được xóa.", "success");
            await showPersonaSelectionView();
        } catch (error) {
            ui.showToast("Lỗi khi xóa persona.", "error");
        }
    }
}


// --- Điểm Khởi đầu Ứng dụng ---
document.addEventListener('DOMContentLoaded', () => {
    ui.loadIcons();
    ui.updateThemeIcon();
    setupEventListeners();

    services.onAuthChange(async (user) => {
        if (user) {
            currentUserId = user.uid;
            currentUserName = user.displayName || user.email.split('@')[0];
            ui.DOM.welcomeUserName.textContent = currentUserName;

            ui.DOM.authContainer.classList.add('hidden');
            ui.DOM.appContainer.classList.remove('hidden');
            
            await showPersonaSelectionView();
        } else {
            currentUserId = null;
            currentUserName = '';
            currentPersona = null;
            localHistory = [];
            
            ui.DOM.authContainer.classList.remove('hidden');
            ui.DOM.appContainer.classList.add('hidden');
            ui.DOM.chatViewContainer.classList.add('hidden');
            ui.DOM.personaSelectionScreen.classList.add('hidden');
        }
    });
});
