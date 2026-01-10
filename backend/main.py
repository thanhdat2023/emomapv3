import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, PromptTemplate
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# ==========================================
# 1. KHỞI TẠO FLASK SERVER
# ==========================================
app = Flask(__name__)
# Cho phép mọi trang web (CORS) gọi vào server này
CORS(app) 

print(">>> Đang khởi động Server AI...")

# ==========================================
# 2. CẤU HÌNH LLAMAINDEX (GIỮ NGUYÊN CODE CỦA BẠN)
# ==========================================
# Lưu ý: API KEY nên giấu đi, nhưng ở đây mình để tạm để bạn test
api_key = "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" 

llm = Groq(model="llama-3.3-70b-versatile", api_key=api_key)
embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512
Settings.chunk_overlap = 50

# ==========================================
# 3. LOAD DỮ LIỆU (CHẠY 1 LẦN KHI MỞ SERVER)
# ==========================================
print(">>> Đang đọc dữ liệu từ thư mục 'data'...")
try:
    documents = SimpleDirectoryReader("data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    
    # Tạo Template trả lời
    template_str = (
        "Bạn là Trợ lý Nghiên cứu AI của dự án Khoa học Kỹ thuật về tâm lý học đường.\n"
    "Nhiệm vụ: Tư vấn dựa trên dữ liệu thực tế (Context) với độ sâu phù hợp với chia sẻ của người dùng.\n"
    "---------------------\n"
    "DỮ LIỆU NGHIÊN CỨU (CONTEXT):\n"
    "{context_str}\n"
    "---------------------\n\n"

    "QUY TẮC ĐỘ DÀI & ĐỘ SÂU (BẮT BUỘC TUÂN THỦ):\n"
    "1. **KHI NGƯỜI DÙNG NHẮN NGẮN / ĐƠN GIẢN (VD: 'Tôi buồn', 'Chán quá'):**\n"
    "   - Trả lời GỌN GÀNG, SÚC TÍCH (khoảng 5-6 dòng).\n"
    "   - Vẫn dựa trên tài liệu, nhưng tóm tắt ý chính, không trích dẫn quá rườm rà hay số trang cụ thể.\n"
    "   - Tập trung vào 1 sự đồng cảm + 1 luận điểm khoa học + 1 lời khuyên.\n\n"

    "2. **KHI NGƯỜI DÙNG TÂM SỰ DÀI / NHIỀU CẢM XÚC:**\n"
    "   - Trả lời SÂU SẮC, CHI TIẾT (như một bài tham vấn).\n"
    "   - Bắt buộc trích dẫn cụ thể: 'Trang X', 'Báo cáo Y', nguyên văn lời chia sẻ của nhân vật trong tài liệu (quote).\n"
    "   - Phân tích đa chiều vấn đề.\n\n"

    "CẤU TRÚC TRẢ LỜI CHUNG:\n"
    "- Luôn bắt đầu bằng việc liên hệ cảm xúc của họ với kiến thức trong tài liệu.\n"
    "- Dẫn chứng dữ liệu (Tùy theo độ dài input mà dẫn chứng ngắn hay dài).\n"
    "- Nếu người dùng muốn nghe nhạc (có/ok/uhm...), chỉ in ra: PLAY_SPOTIFY_NOW\n\n"

    "VÍ DỤ MẪU (INPUT NGẮN):\n"
    "User: 'Tôi thấy hơi buồn.'\n"
    "Bot: 'Nỗi buồn là một phản ứng tự nhiên. Theo tài liệu dự án, tìm kiếm sự chia sẻ là cách tốt nhất để vượt qua (thay vì chịu đựng một mình). Bạn có muốn nghe chút nhạc để thư giãn không?'\n\n"
    
    "VÍ DỤ MẪU (INPUT DÀI):\n"
    "User: 'Tôi thấy rất buồn vì không ai hiểu mình, cảm giác cô độc lắm...'\n"
    "Bot: 'Cảm giác cô độc này rất đáng lưu tâm. Khi bạn nói vậy, nó liên quan đến khái niệm \"tổn thương tâm lý xã hội\" được nhắc đến trong tài liệu. Trang 8 của Báo cáo tóm tắt có ghi nhận trường hợp một học sinh 13 tuổi chia sẻ: \"Khóc xong lại tự đứng dậy...\" (Trích dẫn). Điều này cho thấy việc giấu kín cảm xúc có thể làm tình trạng tệ hơn...'\n\n"

    "INPUT CỦA NGƯỜI DÙNG: {query_str}\n\n"
    "CÂU TRẢ LỜI CỦA BẠN:"
    )
    qa_template = PromptTemplate(template_str)
    
    # Tạo Query Engine
    query_engine = index.as_query_engine(
        text_qa_template=qa_template,
        similarity_top_k=3
    )
    print(">>> HỆ THỐNG ĐÃ SẴN SÀNG! (Server running on port 5000)")

except Exception as e:
    print(f"❌ LỖI KHI LOAD DỮ LIỆU: {e}")
    query_engine = None

# ==========================================
# 4. TẠO ĐƯỜNG DẪN (API ENDPOINT) ĐỂ WEB GỌI VÀO
# ==========================================
# ... (Các đoạn import giữ nguyên)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "Chưa nhập nội dung"}), 400

    if not query_engine:
        return jsonify({"response": "Lỗi: Server chưa học dữ liệu xong."}), 500

    try:
        # 1. Hỏi bộ não Python
        response = query_engine.query(user_message)
        
        # 2. TRÍCH XUẤT NGUỒN (SOURCE) - ĐOẠN MỚI THÊM
        source_list = []
        # LlamaIndex lưu nguồn trong response.source_nodes
        for node in response.source_nodes:
            # Lấy tên file (nếu có)
            file_name = node.metadata.get('file_name', 'Tài liệu không tên')
            # Lấy số trang (nếu có)
            page_label = node.metadata.get('page_label', 'N/A')
            # Lấy nội dung trích dẫn (cắt ngắn 200 ký tự cho đỡ dài)
            snippet = node.node.get_text()[:300] + "..."
            # Lấy độ tin cậy (score)
            score = round(node.score * 100, 1) if node.score else 0

            source_list.append({
                "file": file_name,
                "page": page_label,
                "content": snippet,
                "score": score
            })

        # 3. Trả kết quả về cho Web (Gồm cả text và sources)
        return jsonify({
            "response": str(response),
            "sources": source_list  # Gửi kèm danh sách nguồn
        })
        
    except Exception as e:
        print(f"Lỗi: {str(e)}")
        return jsonify({"response": "Xin lỗi, server đang gặp sự cố."}), 500

# ==========================================
# 5. CHẠY SERVER
# ==========================================
if __name__ == '__main__':
    # Lấy PORT từ biến môi trường của Render, nếu không có thì mặc định là 5000 (để chạy local)
    port = int(os.environ.get('PORT', 5000))
    
    # Tắt debug khi deploy để bảo mật và tăng tốc độ
    app.run(host='0.0.0.0', port=port, debug=False)