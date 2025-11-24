import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Psychology,
  Send,
  Lightbulb,
  AutoAwesome,
  Person,
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  data_sources?: string[];
}

const AIQueryAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm your AI business assistant. I can help you analyze your sales, profits, expenses, customers, and inventory. What would you like to know about your business?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendQuery = async () => {
    if (!inputQuery.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputQuery,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.processBusinessQuery({
        company_id: 1,
        query: inputQuery
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response.data.response,
        isUser: false,
        timestamp: new Date(),
        confidence: response.data.confidence,
        data_sources: response.data.data_sources,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Query processing failed:', error);
      setError('Failed to process your query. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "I'm sorry, I'm having trouble processing your query right now. Please try rephrasing your question or contact support if the problem persists.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendQuery();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQueries = [
    "What is my current profit margin?",
    "How are my sales trending this month?",
    "Which customers are late with payments?",
    "What are my biggest expenses?",
    "Which products are selling the most?",
    "How can I improve my cash flow?"
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Business Query Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ask questions about your business data in natural language
        </Typography>

        {/* Suggested Queries */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedQueries.map((query, index) => (
              <Chip
                key={index}
                label={query}
                variant="outlined"
                clickable
                size="small"
                onClick={() => setInputQuery(query)}
                icon={<Lightbulb />}
              />
            ))}
          </Box>
        </Box>

        {/* Chat Messages */}
        <Paper
          elevation={1}
          sx={{
            height: 400,
            overflow: 'auto',
            mb: 2,
            p: 2,
            bgcolor: 'grey.50'
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {message.isUser ? <Person /> : <AutoAwesome />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">
                        {message.isUser ? 'You' : 'AI Assistant'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                      {!message.isUser && message.confidence && (
                        <Chip
                          size="small"
                          label={`${(message.confidence * 100).toFixed(0)}% confidence`}
                          color={getConfidenceColor(message.confidence)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', mb: message.data_sources ? 1 : 0 }}
                      >
                        {message.message}
                      </Typography>
                      {message.data_sources && message.data_sources.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Data sources:
                          </Typography>
                          {message.data_sources.map((source, index) => (
                            <Chip
                              key={index}
                              size="small"
                              label={source}
                              variant="outlined"
                              sx={{ height: 20 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <AutoAwesome />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      AI Assistant
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Thinking...
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Input Field */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Ask me anything about your business data..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSendQuery}
            disabled={!inputQuery.trim() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Send />}
          >
            Send
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 Tip: You can ask about sales, profits, expenses, customers, inventory, or specific metrics
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AIQueryAssistant;