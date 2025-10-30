import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateGeminiResponse } from '../services/geminiService.js';

const prisma = new PrismaClient();

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { documentId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!documentId) {
      res.status(400).json({ error: 'Document ID is required' });
      return;
    }

    // Verify document belongs to user
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.userId !== userId) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        userId,
        documentId,
        title: `Chat about ${document.originalName}`,
      },
    });

    res.status(201).json({
      message: 'Chat created successfully',
      chat: {
        id: chat.id,
        documentId: chat.documentId,
        title: chat.title,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    if (!chat || chat.userId !== userId) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    res.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
        document: chat.document,
        messages: chat.messages,
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    const { question } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!question || question.trim().length === 0) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        document: true,
      },
    });

    if (!chat || chat.userId !== userId) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Save user question
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: question,
      },
    });

    // Prepare prompt for Gemini
    const prompt = `Here is the PDF content: 
${chat.document.extractedText}

User question:
${question}

Please provide a clear and helpful answer based on the PDF content above.`;

    try {
      // Use shared Gemini helper to find a working model automatically
      const assistantReply = await generateGeminiResponse(prompt);

      // Save assistant response
      const assistantMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: assistantReply,
        },
      });

      // Update chat timestamp
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      res.json({
        message: 'Message sent successfully',
        userMessage,
        assistantMessage,
      });
    } catch (geminiError: any) {
      console.error('Gemini API error:', geminiError);
      
      // If Gemini fails, provide a helpful fallback
      const fallbackMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: `I’m still setting things up and hit an issue reaching the Gemini API. Please make sure your GEMINI_API_KEY is valid and has access to at least one model with generateContent support. Detailed error: ${geminiError.message}`,
        },
      });

      res.json({
        message: 'Message sent with fallback',
        userMessage,
        assistantMessage: fallbackMessage,
      });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== userId) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Delete chat (cascade will handle messages)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
