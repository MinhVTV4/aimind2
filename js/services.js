// js/services.js

/**
 * Module này xử lý tất cả các tương tác với dịch vụ backend,
 * bao gồm Firebase (Auth, Firestore) và Google AI (Gemini).
 * Nó không tương tác trực tiếp với DOM.
 */

// Import các thư viện cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-ai.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    where 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- Cấu hình và Khởi tạo Firebase ---

// Cấu hình Firebase của bạn
const firebaseConfig = {
     apiKey: "AIzaSyBDUBufnsk1PQZTLYCJDqASMX8hEVHqkDc",
     authDomain: "aimind-2362a.firebaseapp.com",
     projectId: "aimind-2362a",
     storageBucket: "aimind-2362a.firebasestorage.app",
     messagingSenderId: "377635504319",
     appId: "1:377635504319:web:7c6dd3cf0c52dd302d860a"
};

// Khởi tạo các dịch vụ và export chúng để sử dụng trong các module khác
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const ai = getAI(app);

// Export các mô hình AI
export const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
export const fastModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });


// --- Dịch vụ Xác thực (Authentication) ---

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
export const handleSignUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const handleSignIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const handleGoogleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export const handleSignOut = () => signOut(auth);


// --- Dịch vụ Firestore (CSDL) ---

// **Persona**
export const fetchCustomPersonas = (userId) => {
    const personasCol = collection(db, 'users', userId, 'customPersonas');
    const q = query(personasCol, orderBy('createdAt', 'desc'));
    return getDocs(q);
};

export const savePersona = (userId, personaData, personaId = null) => {
    if (personaId) {
        const docRef = doc(db, 'users', userId, 'customPersonas', personaId);
        return updateDoc(docRef, personaData);
    } else {
        personaData.createdAt = serverTimestamp();
        const collectionRef = collection(db, 'users', userId, 'customPersonas');
        return addDoc(collectionRef, personaData);
    }
};

export const deletePersona = (userId, personaId) => {
    const docRef = doc(db, 'users', userId, 'customPersonas', personaId);
    return deleteDoc(docRef);
};


// **Chat**
export const updateConversationInDb = (userId, chatId, chatData) => {
    const docRef = doc(db, 'chats', userId, 'conversations', chatId);
    return updateDoc(docRef, chatData);
};

export const createNewConversationInDb = (userId, chatData) => {
    const collectionRef = collection(db, 'chats', userId, 'conversations');
    return addDoc(collectionRef, chatData);
};

export const loadChatFromDb = (userId, chatId) => {
    const docRef = doc(db, 'chats', userId, 'conversations', chatId);
    return getDoc(docRef);
};

export const deleteChatFromDb = (userId, chatId) => {
    const docRef = doc(db, 'chats', userId, 'conversations', chatId);
    return deleteDoc(docRef);
};

export const togglePinChatInDb = (userId, chatId, isPinned) => {
    const docRef = doc(db, 'chats', userId, 'conversations', chatId);
    return updateDoc(docRef, { isPinned });
};

export const updateChatTitleInDb = (userId, chatId, newTitle) => {
    const docRef = doc(db, 'chats', userId, 'conversations', chatId);
    return updateDoc(docRef, { title: newTitle });
};

export const fetchChatsFromDb = (userId, personaId, lastVisible = null, chatsPerPage = 15, isPinned = false) => {
    const chatsCollection = collection(db, 'chats', userId, 'conversations');
    const constraints = [
        where('personaId', '==', personaId),
        where('isPinned', '==', isPinned),
        orderBy('updatedAt', 'desc'),
        limit(chatsPerPage)
    ];
    if (lastVisible) {
        constraints.push(startAfter(lastVisible));
    }
    const q = query(chatsCollection, ...constraints);
    return getDocs(q);
};

// --- Dịch vụ AI (Gemini) ---

/**
 * Gửi prompt và lịch sử trò chuyện đến Gemini và trả về một stream.
 * @param {string} prompt - Prompt hiện tại của người dùng.
 * @param {Array} history - Lịch sử trò chuyện cho ngữ cảnh.
 * @returns {Promise<ReadableStream>} - Stream các phần dữ liệu trả về từ AI.
 */
export const streamAiResponse = async (prompt, history) => {
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessageStream(prompt);
    return result.stream;
};

/**
 * Gửi một yêu cầu đơn lẻ (không stream) đến mô hình nhanh hơn.
 * @param {string} prompt - Prompt để gửi.
 * @returns {Promise<string>} - Toàn bộ văn bản trả về từ AI.
 */
export const getQuickAiResponse = async (prompt) => {
    const result = await fastModel.generateContent(prompt);
    return result.response.text();
};

/**
 * Gửi một yêu cầu đến mô hình tham khảo phụ (reference model).
 * @param {string} prompt - Prompt để gửi.
 * @param {Array} history - Lịch sử của cuộc trò chuyện tham khảo.
 * @returns {Promise<ReadableStream>} - Stream kết quả.
 */
export const streamReferenceResponse = async (prompt, history) => {
    const chatSession = fastModel.startChat({ history });
    const result = await chatSession.sendMessageStream(prompt);
    return result.stream;
};
