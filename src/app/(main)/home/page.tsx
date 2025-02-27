'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { ScrollArea } from '@/components/scroll-area';
import { Send } from 'lucide-react';
import { EmojiEvents, Star } from '@mui/icons-material';

interface Lawyer {
    Name: string;
    "Cases Won": string;
    Rating: string;
    Fees: string;
    "Area of Expertise": string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    lawyers?: Lawyer[];
    error?: string;
}

const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input }),
            });

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get recommendations');
            }

            if (Array.isArray(data) && data.length > 0) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: 'Here are some recommended lawyers based on your requirements:',
                    lawyers: data
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: error instanceof Error ? error.message : 'An error occurred',
                error: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        setInput('');
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <Card className="bg-black border-gray-800">
                <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-gray-200 mx-auto">Lawyer Search</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-4">
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.role === 'user'
                                                ? 'bg-green-600 text-white'
                                                : message.error 
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-800 text-gray-200'
                                        }`}
                                    >
                                        <div>{message.content}</div>
                                        {message.lawyers && message.lawyers.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-5">
                                                {message.lawyers.map((lawyer: Lawyer, idx: number) => (
                                                <div
                                                key={idx}
                                                className="border border-gray-700 rounded p-4 bg-gray-900 flex flex-col justify-center items-center text-center min-w-[250px] h-95 transition-transform duration-300 hover:scale-110"
                                            >
                                                <div className="font-semibold text-lg text-gray-200 mb-2">{lawyer.Name}</div>
                                                <div className="text-sm text-gray-400 space-y-2">
                                                    <div>
                                                        <span className="font-medium text-gray-300">Expertise:</span> {lawyer["Area of Expertise"]}
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <EmojiEvents className="text-green-500 mr-2" />
                                                        <span className="font-semibold text-green-500">{lawyer["Cases Won"]}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Star className="text-yellow-500 mr-2" />
                                                        <span className="font-semibold text-yellow-500">{lawyer.Rating}/5.0</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-red-300">Fees: ₹{lawyer.Fees}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                                
                                                
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="border-t border-gray-800 p-4">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Describe your legal needs and location..."
                                className="bg-gray-900 border-gray-700 text-gray-200 focus:border-green-600"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={sendMessage}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Chatbot;