let socket: WebSocket | null = null;

export const connectSocket = (userId: string, onMessage?: (data: any) => void) => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(`ws://localhost:3000/v1/chat/ws?id=${userId}`);


    socket.onopen = () => {
      console.log("✅ Socket connected", socket);
    };

    socket.onclose = () => {
      console.log("❌ Socket closed");
    };

    socket.onerror = (error) => {
      console.error("⚠️ Socket error:", error, socket);
      };
      
       socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Received:", data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.warn("⚠️ Lỗi parse JSON từ server:", e);
      }
    };
  }
  return socket;
};

export const getSocket = () => socket;

export const sendMessage = (senderId: string, receiverId: string, content: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msg = {
      type: "chat",
      message: {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      },
    };
    socket.send(JSON.stringify(msg));
    console.log("✉️ [sendMessage]", msg);
  } else {
    console.warn("⚠️ Socket chưa mở, không thể gửi message", socket);
  }
};




export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

window.addEventListener("beforeunload", () => {
  disconnectSocket();
})
