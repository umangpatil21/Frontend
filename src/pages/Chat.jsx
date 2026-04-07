import React, { useState, useEffect, useRef } from 'react';
import api, { API_BASE_URL } from '../api';
import { Send, Image, Paperclip, Sparkles, User, MessageCircle } from 'lucide-react';
import io from 'socket.io-client';

const socket = io.connect(API_BASE_URL);

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/api/chat');
                setConversations(res.data);
                if (res.data.length > 0 && !selectedUser) {
                    setSelectedUser(res.data[0].user);
                }
            } catch (err) {
                console.error("Error fetching conversations", err);
            }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    // Mark as read
                    await api.put(`/api/chat/read/${selectedUser._id}`);

                    // Update local state to clear unread count for this user
                    setConversations(prev => prev.map(conv =>
                        conv.user._id === selectedUser._id ? { ...conv, unreadCount: 0 } : conv
                    ));

                    const res = await api.get(`/api/chat/${selectedUser._id}`);
                    setMessages(res.data);

                    // Join room
                    const roomId = [currentUser.id, selectedUser._id].sort().join('-');
                    socket.emit('join_room', roomId);
                } catch (err) {
                    console.error("Error fetching messages", err);
                }
            };
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        // Join personal room for sidebar updates
        socket.emit('join_personal_room', currentUser.id);

        const messageHandler = (data) => {
            // Prevent double-handling if both events fire
            setMessages((prev) => {
                const exists = prev.some(m => m.timestamp === data.timestamp && m.message === data.message);
                if (exists) return prev;

                if (selectedUser && (data.sender === selectedUser._id || data.sender === currentUser.id)) {
                    setTimeout(scrollToBottom, 100);
                    return [...prev, { ...data, timestamp: data.timestamp || new Date() }];
                }
                return prev;
            });

            // Update conversation list
            setConversations(prev => {
                const updated = prev.map(conv => {
                    const isFromPartner = conv.user._id === data.sender;
                    const isToPartner = conv.user._id === data.receiver;

                    if (isFromPartner || isToPartner) {
                        return {
                            ...conv,
                            lastMessage: data.message,
                            timestamp: data.timestamp || new Date(),
                            unreadCount: (isFromPartner && (!selectedUser || selectedUser._id !== data.sender))
                                ? conv.unreadCount + 1
                                : conv.unreadCount
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            });
        };

        socket.on('receive_message', messageHandler);
        socket.on('new_notification', messageHandler);

        return () => {
            socket.off('receive_message', messageHandler);
            socket.off('new_notification', messageHandler);
        };
    }, [selectedUser, currentUser.id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedUser) {
            const roomId = [currentUser.id, selectedUser._id].sort().join('-');
            const msgData = {
                room: roomId,
                sender: currentUser.id,
                receiver: selectedUser._id,
                message: message,
                timestamp: new Date()
            };
            socket.emit('send_message', msgData);

            // Manual update for sender UI
            setMessages(prev => [...prev, msgData]);
            setConversations(prev => {
                const updated = prev.map(conv => {
                    if (conv.user._id === selectedUser._id) {
                        return { ...conv, lastMessage: message, timestamp: msgData.timestamp };
                    }
                    return conv;
                });
                return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            });

            setMessage('');
            setTimeout(scrollToBottom, 50);
        }
    };

    return (
        <div className="pt-20 h-[calc(100vh-64px)] bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle size={24} className="text-blue-600" />
                        Chats
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv._id}
                            onClick={() => setSelectedUser(conv.user)}
                            className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedUser?._id === conv.user._id ? 'bg-blue-50/50' : ''
                                }`}
                        >
                            <div className="relative">
                                <img src={conv.user.profilePhoto || "https://i.pravatar.cc/150?u=" + conv.user._id} alt="" className="w-12 h-12 rounded-full border border-gray-200" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{conv.user.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-10 text-center text-gray-400">
                            <p className="text-sm">No conversations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="relative">
                                    <img src={selectedUser.profilePhoto || "https://i.pravatar.cc/150?u=" + selectedUser._id} alt="User" className="w-10 h-10 rounded-full" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                                    <p className="text-xs text-green-500 font-medium">Online</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${msg.sender === currentUser.id
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                                        }`}>
                                        <p>{msg.message}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === currentUser.id ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
                            <button type="button" className="text-gray-400 hover:text-gray-600 p-2"><Paperclip size={20} /></button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-none"
                            />
                            <button type="submit" disabled={!message.trim()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-gray-50/30">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                        <p className="text-gray-500 max-w-xs">Pick a person from the sidebar to start swapping skills and knowledge!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
