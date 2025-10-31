import type { Media } from "../types/upload";

type MessageCallback = (data: any) => void;

class SocketManager {
  private socket: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private userId: string | null = null;
  private listeners: MessageCallback[] = [];

  connect(userId: string) {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) return;
    console.log("người dùng trước socket:", userId)
    this.userId = userId;
    this.socket = new WebSocket(`ws://localhost:3000/v1/chat/ws?id=${userId}`);

    this.socket.onopen = () => {
      console.log("Socket connected");

      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = window.setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "pong") return;
        if (data.type === "ping" && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: "pong" }));
          return;
        }

        this.listeners.forEach((cb) => cb(data));
      } catch (e) {
        console.warn("Lỗi parse JSON từ server:", e);
      }
    };

    this.socket.onclose = () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      console.log("Socket disconnected");
    };

    this.socket.onerror = (err) => console.error("Socket error:", err);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.listeners = [];
    this.userId = null;
  }

  sendMessage(senderId: string, receiverId: string, groupID: string, content: string,
    mediaIDs: Media[], display_name: string, avatar?: string, sender_avatar?: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const msg: any = {
      type: "chat",
      message: {
        sender_id: senderId,
        receiver_id: receiverId || undefined,
        group_id: groupID || undefined,
        content,
        media_ids: mediaIDs,
        type: mediaIDs.length > 0 ? "file" : "text",
        display_name: display_name,
        avatar: avatar,
        sender_avatar: sender_avatar
      },
    };
    this.socket.send(JSON.stringify(msg));
  }

  sendMemberLeft(senderId?: string, groupID?: string, displayName?: string, avatar?: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const msg = {
      type: "member_left",
      message: {
        sender_id: senderId,
        group_id: groupID,
        content: `Người dùng ${displayName} đã thoát nhóm`,
        avatar: avatar,
        type: "system",
      },
    };

    this.socket.send(JSON.stringify(msg));
  }

  addListener(cb: MessageCallback) {
    this.listeners.push(cb);
  }

  removeListener(cb: MessageCallback) {
    this.listeners = this.listeners.filter((fn) => fn !== cb);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();

// Disconnect khi unload
window.addEventListener("beforeunload", () => socketManager.disconnect());

