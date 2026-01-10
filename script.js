// ============================================================
// 1. CẤU HÌNH KẾT NỐI PYTHON SERVER
// ============================================================
// Đây là địa chỉ Server Python (đang chạy file app.py)
const API_URL = "https://emomapv3-backend.onrender.com/chat"; 

// (Xóa biến API_KEY cũ đi vì Python server đã lo việc đó rồi)

    const LINK_VUI = "https://open.spotify.com/embed/playlist/4lPLZ0npUWzSpeg0BPOVdp?si=UjYu0QMTTiudxfcW1kPKxg";
    const LINK_LOFI = "https://open.spotify.com/embed/playlist/0jSMk9A4W6wnFUkfrBuRaG?si=-W7y9Rc6Sxq_k6MhiTugRw";
    const SOS_WORDS = ["tự tử", "muốn chết", "tự sát", "rạch tay", "nhảy lầu"];

   // --- SỬA ĐOẠN 1: KHAI BÁO BIẾN ---
let messages = []; 
let myChart = null; 
let history = [];
let audioCtx, whiteNoiseSource;

// Tải lịch sử an toàn, nếu lỗi thì reset
try {
    history = JSON.parse(localStorage.getItem('emotionHistory')) || [];
} catch (e) { history = []; }

// Nếu lịch sử trống trơn -> Tạo giả 5 dòng dữ liệu để biểu đồ hiện sóng đẹp ngay
if (history.length === 0) {
    history = [
        { time: "08:00", score: 6 },
        { time: "10:00", score: 4 },
        { time: "12:00", score: 8 },
        { time: "14:00", score: 5 },
        { time: "16:00", score: 9 }
    ];
    localStorage.setItem('emotionHistory', JSON.stringify(history));
}
// ----------------------------------------------------
    // ============================================================
    // 2. KHỞI ĐỘNG TRANG WEB
    // ============================================================
    window.onload = function() {
        renderClassMap(); // Vẽ sơ đồ lớp

        // Tin nhắn mở đầu
        const greeting = "Chào bạn! Mình là EmoMap . Bạn đang cảm thấy thế nào? 😺";
        addMessage(greeting, 'ai');
        
        const systemPrompt = `# 1. VAI TRÒ CỐT LÕI (ROLE)
Bạn là **EmoMap AI**, một thực thể dẫn đường cảm xúc trong hệ sinh thái EmoMap.
* **Bản chất:** Bạn không phải là một "cỗ máy trả lời", mà là người bạn đồng hành tinh tế.
* **Nhiệm vụ:** Giúp người dùng nhận diện cảm xúc, soi chiếu mâu thuẫn nội tâm và tìm thấy trạng thái an toàn tinh thần.
* **Mục tiêu cao nhất:** Giúp người dùng cảm thấy được thấu hiểu — không bị đánh giá — không bị sửa chữa.

# 2. PHONG CÁCH GIAO TIẾP (TONE & VOICE)
* **Ấm áp & Chân thành:** Trò chuyện như một người bạn ngồi cạnh, không giảng dạy, không phán xét.
* **Tinh tế & Giảm tải:** Dùng từ ngữ mềm mại, tránh kích hoạt cơ chế phòng vệ tâm lý của người dùng.
* **Nền tảng tâm lý học:** Áp dụng kiến thức chuyên sâu nhưng diễn đạt bằng ngôn ngữ đời thường, gần gũi (dễ hiểu với cả học sinh).
* **⛔ TUYỆT ĐỐI TRÁNH:**
    * Thuật ngữ học thuật nặng nề.
    * Câu mệnh lệnh.
    * Câu khẳng định tuyệt đối (Ví dụ: "Bạn luôn...", "Chắc chắn là...").

# 3. HỆ MODULE PHÂN TÍCH NGẦM (INTERNAL MODULES)
Khi tiếp nhận thông tin, hãy **âm thầm kích hoạt** các module sau để xây dựng câu trả lời (KHÔNG trình bày tên các module này ra văn bản trừ khi được hỏi):

1.  🧬 **Emotion DNA:** Nhận diện khí chất cảm xúc (Nhạy cảm / Kiên cường / Dễ tổn thương).
2.  🧠 **Fake Emotion Radar:** Phát hiện sự lệch pha giữa lời nói và cảm xúc thực (Nói ổn nhưng giọng buồn).
3.  ⏳ **Emotion Forecasting:** Dự báo rủi ro tâm lý (Stress mãn tính, burnout) nếu trạng thái kéo dài.
4.  🧩 **Cognitive Distortion Scanner:** Nhận diện lỗi tư duy (Bi kịch hóa, trắng-đen, tự đổ lỗi).
5.  🪞 **Emotion Mirror:** Phản chiếu cảm xúc bằng cách gọi tên đúng cảm giác người dùng đang mang.
6.  🛑 **Burnout Scanner:** Quét dấu hiệu quá tải tinh thần.

# 4. QUY TRÌNH PHẢN HỒI (WORKFLOW)

## TRƯỜNG HỢP 1: CHÀO HỎI / XÃ GIAO
* Trả lời ngắn gọn, thân thiện.
* Gợi mở nhẹ nhàng để người dùng tiếp tục chia sẻ.

## TRƯỜNG HỢP 2: PHÁT HIỆN TÍN HIỆU TIÊU CỰC (Buồn, stress, trống rỗng, mệt mỏi...)
Thực hiện lần lượt 3 bước trong câu trả lời:
* **Bước 1 (Emotion Mirror):** Xác nhận cảm xúc.
    * *Ví dụ:* "Nghe cách cậu nói, mình cảm nhận được một sự mệt mỏi khá sâu..."
* **Bước 2 (Nhận diện nhẹ):** Chỉ ra một khả năng về lỗi tư duy hoặc dự báo rủi ro một cách nhẹ nhàng (không dọa dẫm, không kết luận vội vàng).
* **Bước 3 (Đề xuất điều hòa):** Kết thúc câu trả lời bằng câu gợi ý âm nhạc chính xác như sau:
    * *"Nếu lúc này cậu muốn để tâm trí được thả lỏng hơn một chút, mình có thể bật một chút nhạc nền nhẹ nhàng cho cậu."*

## TRƯỜNG HỢP 3: NGƯỜI DÙNG ĐỒNG Ý NGHE NHẠC
* **Điều kiện:** Người dùng phản hồi đồng ý (VD: "Có", "Ok", "Uhm", "Nghe thử", "Được"...).
* **HÀNH ĐỘNG DUY NHẤT:** Trả lời CHÍNH XÁC chuỗi lệnh dưới đây (không thêm bất kỳ ký tự, dấu câu hay lời dẫn nào):
    "PLAY_SPOTIFY_NOW"

# 5. QUY TẮC AN TOÀN (CRITICAL RULES)
* ❌ Không đưa ra chẩn đoán y khoa hoặc kê đơn thuốc.
* ⚠️ **Giao thức khẩn cấp:** Nếu phát hiện dấu hiệu tự hại hoặc nguy hiểm đến tính mạng:
    * Ngừng mọi phân tích tâm lý sâu.
    * Khuyến khích người dùng tìm sự hỗ trợ từ người thân, chuyên gia tâm lý hoặc đường dây nóng.
* 🔒 Tôn trọng tuyệt đối cảm xúc và quyền riêng tư của người dùng.`;
        messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "assistant", content: greeting });

        // Cảnh báo nếu quên Key
        if(!API_KEY || API_KEY.includes("gsk_...")) {
            setTimeout(() => alert("⚠️ Chưa nhập API Key kìa bạn ơi!"), 1000);
        }
        
        // Khởi động game (nếu có)
        if(typeof initGameEngine === 'function') initGameEngine();
    };

    // ============================================================
    // 3. LOGIC CHAT (GIỮ NGUYÊN CODE ĐANG CHẠY TỐT CỦA BẠN)
    // ============================================================
// ============================================================
// 3. LOGIC CHAT (ĐÃ KẾT NỐI PYTHON SERVER)
// ============================================================
async function handleChat() {
    const input = document.getElementById('userInput'); 
    const text = input.value.trim(); 
    if(!text) return;

    // 1. Kiểm tra SOS (Giữ nguyên)
    if(SOS_WORDS.some(kw => text.toLowerCase().includes(kw))) { 
        document.getElementById('sosOverlay').style.display='flex'; 
        input.value=''; return; 
    }

    // 2. Hiện tin nhắn người dùng
    addMessage(text, 'user'); 
    input.value = ''; 
    document.getElementById('typingIndicator').style.display = 'block'; 
    
    // Lưu vào lịch sử hiển thị (Python server tự nhớ ngữ cảnh nên không cần gửi mảng messages đi nữa)
    messages.push({ role: "user", content: text });

    try { 
        // --- GỌI SERVER PYTHON ---
        const aiText = await callPythonServer(text); 
        
        document.getElementById('typingIndicator').style.display = 'none'; 
        messages.push({ role: "assistant", content: aiText }); 
        
        // 3. Xử lý nhạc và chấm điểm (Giữ nguyên logic cũ)
        processResponse(aiText, text); 
        
    } catch (error) { 
        document.getElementById('typingIndicator').style.display = 'none'; 
        // Báo lỗi chi tiết để dễ sửa
        addMessage(`⚠️ Lỗi kết nối Python: ${error.message}. \n👉 Bạn đã chạy lệnh "python app.py" chưa?`, 'ai'); 
        console.error(error);
    }
}

// --- HÀM MỚI: GỌI QUA PYTHON (Thay thế callGroqAPI) ---
// ==========================================
// 1. SỬA HÀM callPythonServer (Để lấy trọn gói JSON)
// ==========================================
async function callPythonServer(userText) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
    });

    if (!response.ok) throw new Error("Server Python lỗi");
    
    // Trả về toàn bộ data (gồm .response và .sources) thay vì chỉ .response
    return await response.json(); 
}

// ==========================================
// 2. SỬA HÀM handleChat (Để hiển thị nguồn)
// ==========================================
async function handleChat() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if(!text) return;

    // Xử lý SOS (Giữ nguyên code cũ của bạn ở đây)
    // ...

    // Hiển thị tin nhắn người dùng
    addMessage(text, 'user');
    input.value = '';
    document.getElementById('typingIndicator').style.display = 'block';

    try {
        // 1. Gọi Python
        const data = await callPythonServer(text);
        
        document.getElementById('typingIndicator').style.display = 'none';

        // 2. Xử lý logic Nhạc & Văn bản
        let finalResponse = data.response; // Lấy văn bản gốc

        // Kiểm tra xem có lệnh bật nhạc không
        if (finalResponse.includes("PLAY_SPOTIFY_NOW")) {
            // A. Bật nhạc
            playSpotify(text); // Gọi hàm bật nhạc riêng
            
            // B. Xóa lệnh khỏi văn bản để hiển thị cho đẹp
            finalResponse = finalResponse.replace("PLAY_SPOTIFY_NOW", "").trim();
        }

        // 3. Hiển thị câu trả lời (Văn bản đã được làm sạch)
        if (finalResponse) {
            addMessage(finalResponse, 'ai');
        }

        // 4. Hiển thị Nguồn (Source) - NẾU CÓ
        if (data.sources && data.sources.length > 0) {
            renderSources(data.sources);
        }

        // 5. Chấm điểm cảm xúc (Lưu history)
        scoreEmotion(text); 

    } catch (error) {
        document.getElementById('typingIndicator').style.display = 'none';
        addMessage(`⚠️ Lỗi kết nối: ${error.message}`, 'ai');
        console.error(error);
    }
}

// ==========================================
// 3. THÊM HÀM MỚI: VẼ NÚT VIEW SOURCE
// ==========================================
function renderSources(sources) {
    const chatBox = document.getElementById('chatBox');
    
    // Tạo ID ngẫu nhiên cho mỗi lần chat để nút bấm mở đúng cái bảng của nó
    const id = "source-" + Date.now();
    
    // Tạo HTML cho danh sách nguồn
    let sourceHTML = sources.map((s, index) => `
        <div class="source-item" style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: 0.85em;">
            <div style="font-weight: bold; color: #6c5ce7;">📄 ${s.file} (Trang ${s.page})</div>
            <div style="font-style: italic; color: #555; margin-top: 4px;">"${s.content}"</div>
            <div style="font-size: 0.7em; color: #888; text-align: right;">Độ khớp: ${s.score}%</div>
        </div>
    `).join('');

    // Tạo nút bấm và khung chứa
    const container = document.createElement('div');
    container.className = 'message ai source-container';
    container.style.background = 'transparent'; // Không màu nền
    container.style.padding = '0';
    
    /* --- BẮT ĐẦU ĐOẠN CODE THAY THẾ --- */

// 1. Lưu nội dung HTML của nguồn vào một biến toàn cục (để tránh lỗi dấu nháy khi truyền vào onclick)
if (!window.sourceDataMap) window.sourceDataMap = {}; // Tạo kho chứa nếu chưa có
window.sourceDataMap[id] = sourceHTML; // Lưu nội dung nguồn với ID tương ứng

// 2. Chỉ hiển thị Nút bấm (Bỏ cái div ẩn bên dưới đi)
container.innerHTML = `
    <button onclick="openSourceModalFromId('${id}')" style="
        background: none; border: 1px solid #6c5ce7; color: #6c5ce7; 
        padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 0.8em; 
        display: flex; align-items: center; gap: 5px; transition: all 0.3s;">
        <span>📚 Xem nguồn dẫn chứng (${sources.length})</span>
        <i class="fas fa-external-link-alt"></i>
    </button>
`;
/* --- KẾT THÚC ĐOẠN CODE THAY THẾ --- */

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Hàm bật/tắt hiển thị nguồn
window.toggleSource = function(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el.style.display === 'none') {
        el.style.display = 'block';
        icon.innerText = '▲';
    } else {
        el.style.display = 'none';
        icon.innerText = '▼';
    }
}
    function processResponse(text, userText) { 
    // 1. Xử lý Nhạc
    // Nếu Python gửi tín hiệu PLAY_SPOTIFY_NOW
    if (text.includes("PLAY_SPOTIFY_NOW")) { 
        // Chọn nhạc dựa trên nội dung chat của người dùng
        const t = userText.toLowerCase(); 
        let link = LINK_LOFI; // Mặc định là Lofi
        
        // Nếu user nói vui/tuyệt/happy thì đổi sang nhạc vui
        if (t.includes("vui") || t.includes("tuyệt") || t.includes("khỏe")) link = LINK_VUI; 
        
        // Hiện khung nhạc Spotify
        addMessage(`
            <div style="margin-top: 10px; border-radius: 12px; overflow: hidden;">
                <iframe style="border-radius:12px" src="${link}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </div>
            <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.8;">🎶 Đã bật nhạc cho bạn rồi nè!</div>
        `, 'ai');

        // Xóa mã lệnh đi để tin nhắn chat không bị xấu
        text = text.replace("PLAY_SPOTIFY_NOW", "").trim();
    } 

    // 2. Hiện tin nhắn lời nói (Nếu sau khi xóa lệnh mà vẫn còn chữ thì hiện ra)
    // Loại bỏ các thẻ suy nghĩ <think>...</think> nếu có
    let cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    
    if (cleanText) {
        // Chỉ hiện tin nhắn nếu nó không rỗng
        // (Đôi khi Python chỉ gửi mỗi lệnh nhạc thì không cần hiện bóng chat trống)
        const chatBox = document.getElementById('chatBox');
        // Kiểm tra tin nhắn cuối cùng, nếu là nhạc thì không add thêm text thừa
        addMessage(cleanText, 'ai'); 
    }

    // 3. Chấm điểm cảm xúc (Giữ nguyên logic cũ)
    try {
        const t = userText.toLowerCase(); 
        let score = 5; 
        if(t.includes('vui') || t.includes('tuyệt') || t.includes('haha')) score = 9; 
        else if(t.includes('buồn') || t.includes('khóc') || t.includes('chán')) score = 3; 
        else if(t.includes('căng') || t.includes('lo') || t.includes('sợ')) score = 1; 
        saveHistory(score); 
    } catch(e) { console.log("Lỗi chấm điểm:", e); }
}
// ==========================================
// HÀM CHẤM ĐIỂM CẢM XÚC (Code cũ của bạn)
// ==========================================
/* Hàm này dùng để mở bảng nguồn. 
   Bạn tìm chỗ nào trong code cũ đang xử lý nút "Xem nguồn" thì gọi hàm này vào.
*/
// --- HÀM MỞ MODAL TỪ ID (Dán vào cuối file script.js) ---

function openSourceModalFromId(id) {
    // 1. Lấy nội dung nguồn từ kho lưu trữ (dựa vào ID)
    const content = window.sourceDataMap[id];
    
    // 2. Tìm cái khung nội dung của Modal
    const contentBox = document.getElementById('sourceContentText'); // Đảm bảo ID này khớp với bên HTML
    
    if (contentBox) {
        // Nếu có nội dung thì hiện, không thì báo lỗi
        contentBox.innerHTML = content ? content : "<p>Không tìm thấy dữ liệu nguồn.</p>";
        
        // 3. Mở Modal lên (Thêm class active)
        const modal = document.getElementById('sourceModal');
        if (modal) modal.classList.add('active');
    } else {
        console.error("Lỗi: Không tìm thấy thẻ có id='sourceContentText' trong HTML");
    }
}
function scoreEmotion(userText) {
    try {
        const t = userText.toLowerCase(); 
        let score = 5; 
        
        // Logic chấm điểm
        if(t.includes('vui') || t.includes('tuyệt') || t.includes('haha')) score = 9; 
        else if(t.includes('buồn') || t.includes('khóc') || t.includes('chán')) score = 3; 
        else if(t.includes('căng') || t.includes('lo') || t.includes('sợ')) score = 1; 
        
        // Gọi hàm lưu lịch sử (đảm bảo hàm saveHistory vẫn còn trong file của bạn)
        if (typeof saveHistory === "function") {
            saveHistory(score); 
        } else {
            console.log("Đã chấm điểm:", score, "(nhưng chưa có hàm saveHistory)");
        }
        
    } catch(e) { console.log("Lỗi chấm điểm:", e); }
}

    // ============================================================
    // 4. HỆ THỐNG THỐNG KÊ (ĐÃ SỬA ĐỂ HIỆN NGAY LẬP TỨC)
    // ============================================================
    
    function saveHistory(score) { 
        const now = new Date();
        const timeLabel = now.getHours() + ":" + (now.getMinutes()<10?'0':'') + now.getMinutes();

        if(!history) history = [];
        history.push({ time: timeLabel, score: score }); 
        
        if(history.length > 20) history.shift(); 
        localStorage.setItem('emotionHistory', JSON.stringify(history)); 
    }

    // --- SỬA ĐOẠN 2: HÀM VẼ BIỂU ĐỒ MƯỢT ---
function renderChart() {
    const ctx = document.getElementById('emotionChart').getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Lấy dữ liệu từ localStorage (Bạn nhớ đảm bảo biến history đã được lưu ở phần chat nhé)
    // Nếu chưa có biến history toàn cục, hãy dùng dòng dưới đây:
    let dataHistory = JSON.parse(localStorage.getItem('emotionHistory')) || []; 

    // Nếu không có dữ liệu thì tạo giả để xem trước
    if (dataHistory.length === 0) {
        dataHistory = [{time: "Start", score: 5}, {time: "Now", score: 5}];
    }

    if (myChart) myChart.destroy(); // Xóa biểu đồ cũ

    myChart = new Chart(ctx, {
        type: 'line', // Dạng đường
        data: {
            labels: dataHistory.map(h => h.time), // Trục ngang là thời gian
            datasets: [{
                label: 'Mức độ vui vẻ',
                data: dataHistory.map(h => h.score), // Trục dọc là điểm số
                borderColor: '#a29bfe', // Màu tím pastel
                backgroundColor: 'rgba(162, 155, 254, 0.2)', // Màu nền tím nhạt
                borderWidth: 3,
                tension: 0.4, // Đường cong mềm mại
                fill: true,
                pointBackgroundColor: isDark ? '#2d3436' : '#fff',
                pointBorderColor: '#6c5ce7',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true, max: 10,
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                    ticks: { color: isDark ? '#fff' : '#666' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#fff' : '#666' }
                }
            },
            plugins: { legend: { display: false } } // Ẩn chú thích
        }
    });
}
    // ============================================================
    // 5. CÁC HÀM HỖ TRỢ & MODAL
    // ============================================================
    function toggleTheme() { document.body.classList.toggle('light-mode'); }
    function addMessage(h,t){ 
        const b=document.getElementById('chatBox'); 
        const d=document.createElement('div'); d.className=`msg ${t}`; d.innerHTML=h; b.appendChild(d); b.scrollTop=b.scrollHeight; 
    }

    // Hàm mở Modal đã tối ưu tốc độ
    // --- TÌM HÀM openModal CŨ VÀ THAY BẰNG CÁI NÀY ---

// --- SỬA ĐOẠN 3: HÀM MỞ BẢNG ---
function openModal(id) { 
// 1. Ẩn hết các modal đang mở
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    
    // 2. Hiện modal mình cần
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');

        // 👇 DÒNG QUAN TRỌNG NHẤT: Nếu là bảng statsModal thì ra lệnh VẼ
        if (id === 'statsModal') {
            setTimeout(() => {
                if(typeof renderChart === 'function') renderChart();
            }, 200); // Chờ 0.2 giây cho bảng hiện lên rồi mới vẽ
        }
        
        // Nếu là Game
        if(id === 'gameModal' && typeof initGameEngine === 'function') initGameEngine(); 
    } 
}
    
    function closeModal(id) { const m = document.getElementById(id); if(m) m.classList.remove('active'); }
    
    function startDictation() { 
        if (window.hasOwnProperty('webkitSpeechRecognition')) { 
            var recognition = new webkitSpeechRecognition(); recognition.lang = "vi-VN"; 
            const btn = document.getElementById('voiceBtn'); btn.classList.add('listening'); 
            recognition.start(); 
            recognition.onresult = function(e) { 
                document.getElementById('userInput').value = e.results[0][0].transcript; 
                recognition.stop(); btn.classList.remove('listening'); 
            }; 
        } else { alert("Vui lòng dùng Chrome."); } 
    }
    function resetData() {
    if(confirm("Bạn muốn xóa sạch lịch sử cảm xúc?")) {
        localStorage.removeItem('emotionHistory'); // Xóa trong bộ nhớ
        // Nếu bạn có biến history ở trên thì reset nó: history = [];
        renderChart(); // Vẽ lại bảng trắng
    }
}

    // Map lớp học
    function renderClassMap(){ 
        const g=document.getElementById('classMapGrid'); 
        if(!g) return;
        g.innerHTML=''; 
        const moods = ['happy', 'sad', 'stress']; 
        const status = ["Vui vẻ 🌻", "Hơi buồn 🌧️", "Áp lực 🤯"];
        for(let i=0; i<19; i++){ 
            let r = Math.floor(Math.random()*3);
            let d=document.createElement('div'); d.className=`student-seat seat-${moods[r]}`; d.innerText=i+1;
            d.onclick = () => {
                document.getElementById('popupName').innerText=`Bạn bàn ${i+1}`;
                document.getElementById('popupStatus').innerText=`"${status[r]}"`;
                document.getElementById('studentPopup').classList.add('active');
            };
            g.appendChild(d); 
        } 
        let me = document.createElement('div'); me.className='student-seat seat-me'; me.innerText='Me'; g.insertBefore(me, g.firstChild);
    }
    
    function sendLove(){ 
        document.getElementById('studentPopup').classList.remove('active'); 
        const m = document.getElementById('mapModal');
        for(let i=0;i<5;i++) {
            let h=document.createElement('div'); h.className='floating-heart'; h.innerHTML='💖';
            h.style.left = Math.random()*80+10+'%'; h.style.bottom='100px';
            m.appendChild(h); setTimeout(()=>h.remove(), 1500);
        }
    }
        // --- THERAPY SYSTEM ---
        function startExercise(t) {
            closeModal('therapyModal');
            let content = "";
            if(t==='breath') content = "🌬️ <b>Hít thở 4-7-8:</b><br>Hít 4s - Giữ 7s - Thở 8s<br><i>Làm 4 lần nhé!</i>";
            else if(t==='stretch') content = "🙆 <b>Thư giãn:</b><br>Nghiêng trái 10s - Nghiêng phải 10s.";
            else content = "👁️ <b>Grounding:</b><br>5 vật thấy - 4 vật chạm - 3 âm thanh.";
            addMessage(content, 'ai');
        }
        function initAudio(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }
        function playWhiteNoise(){ initAudio(); const b=audioCtx.createBuffer(1, audioCtx.sampleRate*2, audioCtx.sampleRate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; whiteNoiseSource=audioCtx.createBufferSource(); whiteNoiseSource.buffer=b; whiteNoiseSource.loop=true; const g=audioCtx.createGain(); g.gain.value=0.1; whiteNoiseSource.connect(g); g.connect(audioCtx.destination); whiteNoiseSource.start(); }
        function stopWhiteNoise(){ if(whiteNoiseSource){ whiteNoiseSource.stop(); whiteNoiseSource=null; } }
        let resetInt;
        window.activateReset=function(){ document.getElementById('resetOverlay').style.display='flex'; try{playWhiteNoise();}catch(e){} let t=30; resetInt=setInterval(()=>{ t--; document.getElementById('resetCount').innerText=t; if(t<=0) closeReset(); },1000); }
        window.closeReset=function(){ clearInterval(resetInt); document.getElementById('resetOverlay').style.display='none'; stopWhiteNoise(); addMessage("Chào mừng cậu quay lại! 🌿", 'ai'); }

        // ============================================================
        // --- GAME ENGINE (BLOCK BLAST - FINAL VERSION WITH PRAISE) ---
        // ============================================================
        
        const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
        const GRID_ROWS=8, GRID_COLS=8, CELL_SIZE=40, GRID_OFFSET_X=15, GRID_OFFSET_Y=30;
        const COLORS = ['#FFD700', '#FF4757', '#2ED573', '#1E90FF', '#FFA502', '#9b59b6', '#3498db'];
        
        let board = Array(GRID_ROWS).fill().map(()=>Array(GRID_COLS).fill(0));
        let previewShapes = [null,null,null];
        let draggingShape = null; 
        let score = 0, comboCount = 0;
        let gameLoopId;
        
        // --- [NEW] BIẾN CHO HIỆU ỨNG PRAISE ---
        let floatingTexts = []; // Mảng chứa chữ bay
        const PRAISE_WORDS = [
            ["Good!", "Nice!", "Cool!"], 
            ["Great!", "Super!", "Tasty!"], 
            ["AMAZING!", "AWESOME!", "INSANE!"], 
            ["PERFECT!", "LEGENDARY!", "GODLIKE!"]
        ];

        // --- KHO GẠCH THÔNG MINH ---
        const POOL_EASY = [{m:[[1]], c:0}, {m:[[1,1]], c:1}, {m:[[1],[1]], c:1}, {m:[[1,1],[1,1]], c:3}, {m:[[1,1,1]], c:2}, {m:[[1],[1],[1]], c:2}];
        const POOL_MEDIUM = [{m:[[1,1,1,1]], c:6}, {m:[[1],[1],[1],[1]], c:6}, {m:[[1,1],[1,0]], c:4}, {m:[[1,1],[0,1]], c:4}, {m:[[1,1,1],[0,1,0]], c:5}, {m:[[0,1,0],[1,1,1]], c:5}];
        let previewCanvases = [document.getElementById('preview1'),document.getElementById('preview2'),document.getElementById('preview3')];

        // 1. KHỞI TẠO GAME
        function initGameEngine() {
            if (canvas.width === 0) { canvas.width = 350; canvas.height = 380; }
            document.getElementById('bestScoreVal').innerText = localStorage.getItem('blockBlastBestScore') || 0;
            
            if (previewShapes.every(s=>s===null)) spawnShapes();
            if (!gameLoopId) gameLoop();
            
            if (!canvas.hasAttribute('data-init')) {
                const getPos = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const t = e.touches ? e.touches[0] : e;
                    return { x: t.clientX - rect.left - CELL_SIZE/2, y: t.clientY - rect.top - CELL_SIZE/2 };
                };
                const start = (e, i) => {
                    if (!previewShapes[i]) return;
                    e.preventDefault();
                    const pos = getPos(e);
                    draggingShape = { shape: previewShapes[i], idx: i, x: pos.x, y: pos.y - 50 };
                    previewShapes[i] = null; drawPreviews();
                };
                previewCanvases.forEach((c,i)=>{ 
                    c.addEventListener('mousedown',e=>start(e,i)); c.addEventListener('touchstart',e=>start(e,i),{passive:false}); 
                });
                const move=(e)=>{ 
                    if(!draggingShape)return; e.preventDefault();
                    const pos = getPos(e);
                    draggingShape.x=pos.x; draggingShape.y=pos.y-50; 
                };
                window.addEventListener('mousemove',move); window.addEventListener('touchmove',move,{passive:false});
                const end=(e)=>{
                    if(!draggingShape)return;
                    const c = Math.round((draggingShape.x - GRID_OFFSET_X)/CELL_SIZE);
                    const r = Math.round((draggingShape.y - GRID_OFFSET_Y)/CELL_SIZE);
                    
                    try {
                        if(canPlace(draggingShape.shape.m,r,c)){
                            place(draggingShape.shape,r,c);
                            if(previewShapes.every(s=>!s)) spawnShapes();
                        } else {
                            previewShapes[draggingShape.idx]=draggingShape.shape; drawPreviews();
                        }
                    } catch(err) { console.log(err); } 
                    finally { draggingShape=null; }
                };
                window.addEventListener('mouseup',end); window.addEventListener('touchend',end);
                canvas.setAttribute('data-init','true');
            }
        }

        // 2. THUẬT TOÁN TẠO KHỐI THÔNG MINH
        function getSmartShape() {
            let filledCount = board.flat().filter(c => c !== 0).length;
            let fillRatio = filledCount / (GRID_ROWS * GRID_COLS);
            let pool;
            if (fillRatio < 0.1) pool = POOL_EASY;
            else if (fillRatio > 0.65) pool = POOL_EASY;
            else if (fillRatio > 0.45) pool = Math.random() < 0.7 ? [...POOL_EASY, ...POOL_MEDIUM] : POOL_HARD;
            else pool = [...POOL_MEDIUM]; // Sửa lại: kết hợp cả vừa và khó cho đa dạng
            const t = pool[Math.floor(Math.random() * pool.length)];
            return { m: t.m, c: COLORS[t.c % COLORS.length] };
        }
        function spawnShapes() { for(let i=0;i<3;i++) if(!previewShapes[i]) previewShapes[i] = getSmartShape(); drawPreviews(); }

        // 3. GAME LOOP (CẬP NHẬT LIÊN TỤC)
        function gameLoop() { 
            if (document.getElementById('gameModal').classList.contains('active')) { 
                update(); // [QUAN TRỌNG] Cập nhật vị trí chữ bay
                draw(); 
                requestAnimationFrame(gameLoop); 
            } else gameLoopId=null; 
        }

        // 4. HÀM UPDATE (XỬ LÝ CHUYỂN ĐỘNG CHỮ)
        function update() {
            for(let i=floatingTexts.length-1; i>=0; i--) {
                let t = floatingTexts[i];
                t.y += t.vy; // Bay lên
                t.life -= 0.02; // Mờ dần
                if(t.life <= 0) floatingTexts.splice(i, 1); // Xóa khi hết thời gian
            }
        }

        // 5. HÀM DRAW (VẼ MỌI THỨ)
        function draw() {
            ctx.fillStyle='#161618'; ctx.fillRect(0,0,350,380);
            
            // Vẽ bảng
            for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
                let x=GRID_OFFSET_X+c*CELL_SIZE, y=GRID_OFFSET_Y+r*CELL_SIZE;
                drawBlock(x,y,CELL_SIZE-4,'#2d3436');
                if(board[r][c]) drawBlock(x,y,CELL_SIZE-4,board[r][c]);
            }
            
            // Vẽ khối đang kéo
            if(draggingShape) {
                const s = draggingShape.shape;
                s.m.forEach((row,i)=>row.forEach((v,j)=>{ if(v) drawBlock(draggingShape.x+j*CELL_SIZE, draggingShape.y+i*CELL_SIZE, CELL_SIZE-4, s.c); }));
            }
            
            // --- [QUAN TRỌNG] VẼ CHỮ NỔI (PRAISE) ---
            floatingTexts.forEach(t => {
                ctx.save();
                ctx.fillStyle = t.color;
                ctx.font = `900 ${t.size}px 'Outfit', sans-serif`;
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 4;
                ctx.globalAlpha = t.life;
                ctx.fillText(t.text, t.x, t.y);
                ctx.restore();
            });
        }

        function drawBlock(x,y,s,c) { 
            ctx.fillStyle=c; ctx.fillRect(x,y,s,s); 
            ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.strokeRect(x,y,s,s); 
        }

        // 6. HÀM TÍNH ĐIỂM & TẠO HIỆU ỨNG (CHECK LINES)
        function checkLines(){
            let rowsToClear = [], colsToClear = [];
            for(let r=0; r<GRID_ROWS; r++) if(board[r].every(c => c !== 0)) rowsToClear.push(r);
            for(let c=0; c<GRID_COLS; c++) if(board.every(r => r[c] !== 0)) colsToClear.push(c);
            
            let totalLines = rowsToClear.length + colsToClear.length;

            if (totalLines > 0) {
                comboCount++;
                
                // Hiệu ứng rung nhẹ
                canvas.style.transform = "scale(1.02)"; 
                setTimeout(() => canvas.style.transform = "scale(1)", 100);

                // Xóa gạch
                rowsToClear.forEach(r => board[r].fill(0));
                colsToClear.forEach(c => { for(let r=0; r<GRID_ROWS; r++) board[r][c] = 0; });
                
                // Tính điểm
                let points = totalLines * 100 * comboCount;
                let isPerfect = isBoardEmpty();
                if(isPerfect) points += 500;
                
                score += points; 
                updateScore();

                // --- TẠO HIỆU ỨNG CHỮ BAY ---
                // Chọn từ khen
                let praiseLevel = Math.min(totalLines - 1, 3);
                let word = PRAISE_WORDS[praiseLevel][Math.floor(Math.random() * PRAISE_WORDS[praiseLevel].length)];
                
                // Màu chữ
                let wordColor = totalLines > 1 ? '#00d2d3' : '#fff'; // Xanh ngọc hoặc Trắng
                if (isPerfect) { word = "PERFECT CLEAR!"; wordColor = '#ff9f43'; } // Cam

                // Đẩy Chữ khen vào danh sách bay
                floatingTexts.push({ 
                    x: canvas.width / 2, 
                    y: canvas.height / 2 - 20, 
                    text: word, 
                    life: 1.5, vy: -3, size: 30 + (totalLines*5), color: wordColor 
                });

                // Đẩy Số điểm vào danh sách bay
                floatingTexts.push({ 
                    x: canvas.width / 2, 
                    y: canvas.height / 2 + 30, 
                    text: "+" + points, 
                    life: 1.0, vy: -1.5, size: 24, color: '#feca57' 
                });

            } else {
                comboCount = 0;
            }
        }

        // Các hàm phụ trợ game
        function drawPreviews() {
            previewCanvases.forEach((cvs,i)=>{
                const c=cvs.getContext('2d'); c.clearRect(0,0,80,80);
                if(previewShapes[i]) {
                    const s=previewShapes[i];
                    // Cố định size 18px để không bị cắt
                    const cellSize = 18; const gap = 2;
                    const startX = (80 - (s.m[0].length * (cellSize+gap))) / 2;
                    const startY = (80 - (s.m.length * (cellSize+gap))) / 2;
                    
                    s.m.forEach((row,r)=>row.forEach((v,k)=>{ 
                        if(v) { 
                            c.fillStyle=s.c; c.fillRect(startX + k*(cellSize+gap), startY + r*(cellSize+gap), cellSize, cellSize); 
                            c.strokeStyle="rgba(255,255,255,0.3)"; c.strokeRect(startX + k*(cellSize+gap), startY + r*(cellSize+gap), cellSize, cellSize);
                        }
                    }));
                }
            });
        }
        function canPlace(m,r,c){ 
            for(let i=0;i<m.length;i++) for(let j=0;j<m[0].length;j++) 
                if(m[i][j] && (r+i<0||r+i>=8||c+j<0||c+j>=8||board[r+i][c+j])) return false; 
            return true; 
        }
        function place(s,r,c){ 
            s.m.forEach((row,i)=>row.forEach((v,j)=>{ if(v) board[r+i][c+j]=s.c; })); 
            score+=10; document.getElementById('scoreVal').innerText=score;
            checkLines(); // Gọi hàm kiểm tra điểm
        }
        function isBoardEmpty() { return board.every(row => row.every(cell => cell === 0)); }
        function updateScore() {
            document.getElementById('scoreVal').innerText = score;
            const best = localStorage.getItem('blockBlastBestScore') || 0;
            if (score > best) {
                localStorage.setItem('blockBlastBestScore', score);
                document.getElementById('bestScoreVal').innerText = score;
            }
        }
        function resetGame() { board=Array(8).fill().map(()=>Array(8).fill(0)); score=0; document.getElementById('scoreVal').innerText=0; document.getElementById('gameOverOverlay').style.display='none'; spawnShapes(); }

        // --- UTILS ---
        function openModal(id) { 
// 1. Ẩn hết các modal đang mở
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    
    // 2. Hiện modal mình cần
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');

        // 👇 DÒNG QUAN TRỌNG NHẤT: Nếu là bảng statsModal thì ra lệnh VẼ
        if (id === 'statsModal') {
            setTimeout(() => {
                if(typeof renderChart === 'function') renderChart();
            }, 200); // Chờ 0.2 giây cho bảng hiện lên rồi mới vẽ
        }
        
        // Nếu là Game
        if(id === 'gameModal' && typeof initGameEngine === 'function') initGameEngine(); 
    } 
}
        function closeModal(id){ document.getElementById(id).classList.remove('active'); }
        function resetChat(){ document.getElementById('resetOverlay').style.display='flex'; setTimeout(()=>{document.getElementById('resetOverlay').style.display='none'; addMessage("F5 lại tâm hồn! 🌿", 'ai');}, 2000); }
        function startDictation() { alert("Đang nghe..."); }
        document.getElementById('userInput').addEventListener("keypress", e=>{if(e.key==="Enter") handleChat()});
        
        



