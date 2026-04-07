import React, { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Trash2, Download, Square, Circle, Minus } from 'lucide-react';

const Whiteboard = ({ onClose }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    const [tool, setTool] = useState('pencil');

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        contextRef.current = context;
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = lineWidth;
            if (tool === 'eraser') {
                contextRef.current.globalCompositeOperation = 'destination-out';
            } else {
                contextRef.current.globalCompositeOperation = 'source-over';
            }
        }
    }, [color, lineWidth, tool]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col">
            {/* Toolbar */}
            <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                        <button
                            onClick={() => setTool('pencil')}
                            className={`p-2.5 rounded-xl transition-all ${tool === 'pencil' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Pencil size={20} />
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-2.5 rounded-xl transition-all ${tool === 'eraser' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Eraser size={20} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {['#000000', '#3B82F6', '#EF4444', '#10B981', '#F59E0B'].map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200" />

                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(e.target.value)}
                        className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={clearCanvas}
                        className="p-3 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors"
                    >
                        Finish Session
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 cursor-crosshair relative overflow-hidden bg-gray-50/30">
                <canvas
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={canvasRef}
                    className="touch-none"
                />
            </div>
        </div>
    );
};

export default Whiteboard;
