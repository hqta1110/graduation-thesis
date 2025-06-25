import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, IconButton,
  Avatar, CircularProgress, Card, CardMedia,
  CardContent, Grid, Chip, Dialog, DialogContent,
  DialogTitle, DialogActions, Fade, Zoom, useTheme,
  useMediaQuery, Tooltip, Snackbar, Alert, Stack, Badge, LinearProgress,
  alpha, Container, Popover
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlantIcon from '@mui/icons-material/LocalFlorist';
import BotIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ReactMarkdown from 'react-markdown';
import PlantImageGallery from './PlantImageGallery';
// API endpoint for the backend
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
const PLACEHOLDER_IMAGE = '/placeholder.png';

// Message types
const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  MULTI_IMAGE: 'multi_image',
  CLASSIFICATION: 'classification',
  SELECTION: 'selection'
};

// Sender types
const SENDER = {
  USER: 'user',
  BOT: 'bot'
};

const PlantChatbot = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textFieldRef = useRef(null);

  // Main state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      content: 'Xin chào! Tôi là trợ lý thực vật. Bạn có thể hỏi tôi về các loài thực vật hoặc tải lên một hoặc nhiều hình ảnh để tôi nhận diện.',
      sender: SENDER.BOT,
      type: MESSAGE_TYPE.TEXT,
      timestamp: new Date(),
    }
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Classification state
  const [classifications, setClassifications] = useState([]);
  const [showClassificationDialog, setShowClassificationDialog] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [classificationLoading, setClassificationLoading] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  // Add this after the existing useState declarations
  const [plantMetadata, setPlantMetadata] = useState({});
  // Clipboard paste state
  const [pasteIndicator, setPasteIndicator] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteError, setPasteError] = useState(null);
  const [showPasteHint, setShowPasteHint] = useState(true);

  // HOVER-FEATURE: State for the hover gallery popover
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [hoveredPlant, setHoveredPlant] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const hoverTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate a new session ID on component mount
  useEffect(() => {
  const newSessionId = uuidv4();
  setSessionId(newSessionId);
  console.log(`🆔 Generated new session: ${newSessionId.slice(0, 8)}...`);
  }, []);

  // Fetch plant metadata for name mapping
  useEffect(() => {
    const fetchPlantMetadata = async () => {
      try {
        const response = await fetch(`${API_URL}/api/plants`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPlantMetadata(data);
        }
      } catch (error) {
        console.error('Error fetching plant metadata:', error);
      }
    };

    fetchPlantMetadata();
  }, []);
  // Clipboard paste functionality
  useEffect(() => {
    const handlePaste = async (event) => {
      // Only handle paste when the chat interface is focused or no specific input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );

      // If pasting into the message input field, don't handle image paste
      if (isInputFocused && activeElement === textFieldRef.current?.querySelector('textarea')) {
        return;
      }

      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;

      const imageItems = Array.from(clipboardItems).filter(item =>
        item.type.startsWith('image/')
      );

      if (imageItems.length === 0) return;

      // Prevent default paste behavior for images
      event.preventDefault();

      try {
        setPasteIndicator(true);
        setPasteError(null);
        setShowPasteHint(false);

        const newFiles = [];
        const newPreviewUrls = [];

        for (const item of imageItems) {
          const blob = item.getAsFile();
          if (blob) {
            // Create a more descriptive filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = blob.type.split('/')[1] || 'png';
            const filename = `pasted-image-${timestamp}.${extension}`;

            // Create a File object with proper name
            const file = new File([blob], filename, { type: blob.type });

            newFiles.push(file);
            newPreviewUrls.push(URL.createObjectURL(blob));
          }
        }

        if (newFiles.length > 0) {
          // Add to existing files and previews
          setImageFiles(prev => [...prev, ...newFiles]);
          setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);

          // Show success indicator
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);

          // Optional: Auto-focus the input after pasting
          if (textFieldRef.current) {
            const textarea = textFieldRef.current.querySelector('textarea');
            if (textarea) {
              textarea.focus();
            }
          }
        }
      } catch (err) {
        console.error('Error handling paste:', err);
        setPasteError('Không thể dán hình ảnh. Vui lòng thử lại.');
        setTimeout(() => setPasteError(null), 4000);
      } finally {
        setPasteIndicator(false);
      }
    };

    // Add event listener to document
    document.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Show paste hint on component mount, hide after user interaction
  useEffect(() => {
    const hideHintTimer = setTimeout(() => {
      setShowPasteHint(false);
    }, 8000); // Hide hint after 8 seconds

    return () => clearTimeout(hideHintTimer);
  }, []);

  // Hide paste hint on any user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setShowPasteHint(false);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Handle file selection - now supports multiple files
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Filter for valid image files
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, etc.)');
      return;
    }

    // Create preview URLs for all valid images
    const newPreviewUrls = validImageFiles.map(file => URL.createObjectURL(file));

    // Add to existing files and previews
    setImageFiles(prev => [...prev, ...validImageFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Hide paste hint after user uploads files
    setShowPasteHint(false);
  };

  // Remove an individual image
  const removeImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    // Remove the image from state
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
    setShowPasteHint(false);
  };

  // Clear all selected images
  const clearAllImages = () => {
    // Revoke all object URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));

    // Clear the arrays
    setImageFiles([]);
    setImagePreviewUrls([]);
  };
  // HOVER-FEATURE: Function to fetch images for a specific plant
  const fetchPlantImages = async (scientificName) => {
    if (imageCache[scientificName]) {
      setGalleryImages(imageCache[scientificName]);
      setGalleryLoading(false);
      return;
    }

    setGalleryLoading(true);
    try {
      const apiUrl = `${API_URL}/api/plant-images/${encodeURIComponent(scientificName)}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const images = data.images || [];
        setGalleryImages(images);
        setImageCache(prev => ({ ...prev, [scientificName]: images }));
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error('Error fetching plant images:', err);
      setGalleryImages([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  // HOVER-FEATURE: Handlers for mouse enter and leave on classification cards
  const handleCardMouseEnter = (event, plantLabel) => {
    clearTimeout(hoverTimeoutRef.current);
    setPopoverAnchorEl(event.currentTarget);
    setHoveredPlant(plantLabel);
    fetchPlantImages(plantLabel);
  };

  const handlePopoverClose = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setPopoverAnchorEl(null);
      setHoveredPlant(null);
      setGalleryImages([]);
    }, 200); // Small delay to allow moving mouse between card and popover
  };

  const handlePopoverEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && imageFiles.length === 0) return;

    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage && imageFiles.length === 0) return;

    // --- NEW & IMPROVED: Handle the 'reset' command on the frontend ---
    // This now runs BEFORE the user message is even added to the chat UI.
    // It clears all relevant frontend context.
    if (trimmedMessage.toLowerCase() === 'reset') {
      console.log('🔄 Frontend reset triggered. Clearing selected plant and other context.');
      setSelectedPlant(null);
      setPendingQuestion(null);
      setClassifications([]);
      setShowClassificationDialog(false); // Also hide the dialog if it's open
      
      // It's also good practice to clear any attached images if the user types reset
      if (imageFiles.length > 0) {
        clearAllImages();
      }
    }

    // Generate a unique ID for this message
    const messageId = `msg_${Date.now()}`;
    const timestamp = new Date();

    // Add user message to the chat
    let userMessages = [];

    // If there's text input, add it as a message
    if (inputMessage.trim()) {
      userMessages.push({
        id: `${messageId}_text`,
        content: inputMessage.trim(),
        sender: SENDER.USER,
        type: MESSAGE_TYPE.TEXT,
        timestamp
      });
    }

    // If there are images, add them as a message
    if (imageFiles.length > 0) {
      userMessages.push({
        id: `${messageId}_image`,
        content: imagePreviewUrls,
        sender: SENDER.USER,
        type: MESSAGE_TYPE.MULTI_IMAGE,
        timestamp: new Date(timestamp.getTime() + 1) // Add 1ms to ensure correct ordering
      });
    }

    // Add user messages to the chat
    setMessages(prev => [...prev, ...userMessages]);

    // Clear input
    setInputMessage('');

    try {
      setIsLoading(true);
      setError(null);

      // Different flows based on what the user provided
      if (imageFiles.length > 0 && !inputMessage.trim()) {
        // Images only - Classify first
        await handleImageClassification(messageId);
      } else if (imageFiles.length > 0 && inputMessage.trim()) {
        // Both images and text - Classify, then use text as question
        await handleImageClassification(messageId, inputMessage.trim());
      } else if (inputMessage.trim() && imageFiles.length === 0) {
        // Text only - Direct QA
        await handleTextOnlyQuestion(messageId, inputMessage.trim());
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      clearAllImages(); // Always clear the images after sending
      setUploadProgress(0);
    }
  };

  // Handle image classification with multiple images
  const handleImageClassification = async (messageId, questionText = null) => {
    if (imageFiles.length === 0) return;

    try {
      setClassificationLoading(true);

      // Store question text for later use after plant selection
      if (questionText) {
        setPendingQuestion(questionText);
      }

      // Add a "processing" message
      setMessages(prev => [...prev, {
        id: `${messageId}_processing`,
        content: `Đang xử lý và phân loại ${imageFiles.length} hình ảnh...`,
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isProcessing: true
      }]);

      // Prepare form data for multiple file upload
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append('files', file); // Note the plural 'files' name
      });

      // Call API to classify the images
      const response = await fetch(`${API_URL}/api/classify`, {
        method: 'POST',
        body: formData,
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi phân loại hình ảnh (HTTP ${response.status})`);
      }

      const data = await response.json();

      // Remove the processing message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

      if (data.results && data.results.length > 0) {
        // Check if the result indicates OOD (Out-of-Distribution)
        const firstResult = data.results[0];
        const isOOD = firstResult.label === "Không tồn tại trong cơ sở dữ liệu";

        if (isOOD) {
          // Handle OOD case - show direct message without selection dialog
          setMessages(prev => [...prev, {
            id: `${messageId}_ood_response`,
            content: 'Xin lỗi, loài thực vật này không nằm trong cơ sở dữ liệu của tôi. Vui lòng thử lại với hình ảnh của các loài thực vật khác.',
            sender: SENDER.BOT,
            type: MESSAGE_TYPE.TEXT,
            timestamp: new Date()
          }]);

          // Clear pending question since we can't proceed with classification
          setPendingQuestion(null);
        } else {
          // Normal classification results - show selection dialog
          // Store classifications
          setClassifications(data.results);

          // Show the classifications in the chat
          setMessages(prev => [...prev, {
            id: `${messageId}_classification_results`,
            content: data.results,
            sender: SENDER.BOT,
            type: MESSAGE_TYPE.CLASSIFICATION,
            timestamp: new Date()
          }]);

          // Show selection message based on whether there's a pending question
          const selectionPrompt = questionText
            ? 'Vui lòng chọn loài thực vật phù hợp để tiếp tục với câu hỏi của bạn.'
            : 'Vui lòng chọn loài thực vật phù hợp để tiếp tục.';

          setMessages(prev => [...prev, {
            id: `${messageId}_selection_prompt`,
            content: selectionPrompt,
            sender: SENDER.BOT,
            type: MESSAGE_TYPE.TEXT,
            timestamp: new Date()
          }]);

          // Show the plant selection dialog
          setShowClassificationDialog(true);
        }
      } else {
        // No results found
        setMessages(prev => [...prev, {
          id: `${messageId}_no_results`,
          content: 'Không tìm thấy loài thực vật nào phù hợp với hình ảnh này. Vui lòng thử lại với hình ảnh khác.',
          sender: SENDER.BOT,
          type: MESSAGE_TYPE.TEXT,
          timestamp: new Date()
        }]);

        // Clear pending question since classification failed
        setPendingQuestion(null);
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(`Lỗi khi phân loại hình ảnh: ${err.message}`);

      // Remove the processing message and add an error message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));
      setMessages(prev => [...prev, {
        id: `${messageId}_error`,
        content: `Lỗi khi phân loại hình ảnh: ${err.message}`,
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isError: true
      }]);

      // Clear pending question if there was an error
      setPendingQuestion(null);
    } finally {
      setClassificationLoading(false);
    }
  };
    // Helper function to normalize names for comparison
    const normalizeName = (name) => {
      if (!name) return '';
      return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[^\w\s]/g, '') // Remove special characters except spaces
        .replace(/\b(subsp|var|cv|f)\b\.?/g, '') // Remove botanical abbreviations
        .trim();
    };

    // Helper function to get Vietnamese name from scientific name
    const getVietnameseName = (scientificName) => {
      if (!scientificName || !plantMetadata || Object.keys(plantMetadata).length === 0) {
        return '';
      }
      const normalizedSearchName = normalizeName(scientificName);

      // First try direct match
      if (plantMetadata[scientificName] && plantMetadata[scientificName]["Tên tiếng Việt"]) {
        return plantMetadata[scientificName]["Tên tiếng Việt"].split(';')[0].trim();
      }

      // Then try normalized matching
      for (const [key, value] of Object.entries(plantMetadata)) {
        const normalizedKey = normalizeName(key);
        if (normalizedKey === normalizedSearchName && value["Tên tiếng Việt"]) {
          return value["Tên tiếng Việt"].split(';')[0].trim();
        }
      }

      // Finally try partial matching (contains)
      for (const [key, value] of Object.entries(plantMetadata)) {
        const normalizedKey = normalizeName(key);
        if (normalizedKey.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedKey)) {
          if (value["Tên tiếng Việt"]) {
            return value["Tên tiếng Việt"].split(';')[0].trim();
          }
        }
      }

      return ''; // Return empty string if no match found
    };
  // Handle plant selection
  const handlePlantSelection = async (plantLabel, messageId) => {
    setSelectedPlant(plantLabel);
    setShowClassificationDialog(false);

    // Add selection message to chat
    setMessages(prev => [...prev, {
      id: `${messageId}_selection`,
      content: { label: plantLabel },
      sender: SENDER.USER,
      type: MESSAGE_TYPE.SELECTION,
      timestamp: new Date()
    }]);

    // Confirmation from bot
    setMessages(prev => [...prev, {
      id: `${messageId}_selection_confirmation`,
      content: `Bạn đã chọn: ${plantLabel}`,
      sender: SENDER.BOT,
      type: MESSAGE_TYPE.TEXT,
      timestamp: new Date(Date.now() + 1)
    }]);

    // If there's a pending question, automatically proceed with Q&A
    if (pendingQuestion) {
      const question = pendingQuestion;
      // Clear the pending question first to avoid reuse
      setPendingQuestion(null);

      // Short delay to ensure messages appear in correct order
      setTimeout(() => {
        handleQuestionWithSelectedPlant(messageId, plantLabel, question);
      }, 100);
    } else {
      // Otherwise, prompt the user to ask a question
      setMessages(prev => [...prev, {
        id: `${messageId}_ask_prompt`,
        content: `Bạn có thể đặt câu hỏi về loài ${plantLabel} này.`,
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(Date.now() + 2)
      }]);
    }
  };

  // Handle text-only question (no image)
  const handleTextOnlyQuestion = async (messageId, question) => {
    try {
      // Add a processing message
      setMessages(prev => [...prev, {
        id: `${messageId}_processing`,
        content: 'Đang xử lý câu hỏi của bạn...',
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isProcessing: true
      }]);

      // Check if we have a selected plant from previous interaction
      // If yes, use that plant's label for the question
      if (selectedPlant) {
        console.log(`Using previously selected plant: ${selectedPlant} for the question`);

        try {
          // Call the QA API with the selected plant and question directly here
          const response = await fetch(`${API_URL}/api/qa`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              label: selectedPlant,
              question: question,
              session_id: sessionId
            }),
          });

          if (!response.ok) {
            throw new Error(`Lỗi xử lý câu hỏi (HTTP ${response.status})`);
          }

          const data = await response.json();

          // Remove the processing message
          setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

          // Add the answer to the chat
          setMessages(prev => [...prev, {
            id: `${messageId}_answer`,
            content: data.answer || 'Xin lỗi, tôi không có thông tin để trả lời câu hỏi này.',
            sender: SENDER.BOT,
            type: MESSAGE_TYPE.TEXT,
            timestamp: new Date()
          }]);

          return; // Exit the function after handling
        } catch (err) {
          console.error('Plant-specific QA error:', err);

          // Remove the processing message
          setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

          // Add an error message
          setMessages(prev => [...prev, {
            id: `${messageId}_error`,
            content: `Lỗi khi xử lý câu hỏi: ${err.message}`,
            sender: SENDER.BOT,
            type: MESSAGE_TYPE.TEXT,
            timestamp: new Date(),
            isError: true
          }]);

          return; // Exit the function after handling
        }
      }

      // If no plant is selected, proceed with general question
      // Send to the QA endpoint without a label
      const response = await fetch(`${API_URL}/api/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          session_id: sessionId
          // Do not include a label since we don't have a specific plant selected
        }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi xử lý câu hỏi (HTTP ${response.status})`);
      }

      const data = await response.json();

      // Remove the processing message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

      // Add the answer to the chat
      setMessages(prev => [...prev, {
        id: `${messageId}_answer`,
        content: data.answer || 'Xin lỗi, tôi không có thông tin để trả lời câu hỏi này.',
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('QA error:', err);

      // Remove the processing message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

      // Add an error message
      setMessages(prev => [...prev, {
        id: `${messageId}_error`,
        content: `Lỗi khi xử lý câu hỏi: ${err.message}`,
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  // Handle question with a selected plant
  const handleQuestionWithSelectedPlant = async (messageId, plantLabel, question) => {
    try {
      // Add a processing message
      setMessages(prev => [...prev, {
        id: `${messageId}_processing`,
        content: 'Đang trả lời câu hỏi của bạn...',
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isProcessing: true
      }]);

      // Call the QA API with the selected plant and question
      const response = await fetch(`${API_URL}/api/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: plantLabel,
          question: question,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi xử lý câu hỏi (HTTP ${response.status})`);
      }

      const data = await response.json();

      // Remove the processing message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

      // Add the answer to the chat
      setMessages(prev => [...prev, {
        id: `${messageId}_answer`,
        content: data.answer || 'Xin lỗi, tôi không có thông tin để trả lời câu hỏi này.',
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('QA error:', err);

      // Remove the processing message
      setMessages(prev => prev.filter(m => m.id !== `${messageId}_processing`));

      // Add an error message
      setMessages(prev => [...prev, {
        id: `${messageId}_error`,
        content: `Lỗi khi xử lý câu hỏi: ${err.message}`,
        sender: SENDER.BOT,
        type: MESSAGE_TYPE.TEXT,
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle dismiss error
  const handleDismissError = () => {
    setError(null);
  };

  // Get representative image path
  const getRepresentativeImagePath = (label) => {
    if (!label) return PLACEHOLDER_IMAGE;
    // Convert the label for image path (same logic as in your existing code)
    const safeLabel = label.replace(/\s+/g, '_');
    return `/representative_images/${safeLabel}.jpg`;
  };

  // Custom markdown components with Material-UI styling
  const markdownComponents = {
    h1: ({ children }) => (
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 600,
        color: 'primary.dark',
        mt: 2,
        mb: 1.5
      }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" component="h2" gutterBottom sx={{
        fontWeight: 600,
        color: 'primary.dark',
        mt: 2,
        mb: 1.5
      }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" component="h3" gutterBottom sx={{
        fontWeight: 600,
        color: 'primary.main',
        mt: 1.5,
        mb: 1
      }}>
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.05rem' } }}>
        {children}
      </Typography>
    ),
    strong: ({ children }) => (
      <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
        {children}
      </Typography>
    ),
    em: ({ children }) => (
      <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        {children}
      </Typography>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{
        pl: 3,
        mb: 2,
        '& > li': {
          mb: 0.5,
          '&::marker': {
            color: 'primary.main'
          }
        }
      }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{
        pl: 3,
        mb: 2,
        '& > li': {
          mb: 0.5,
          '&::marker': {
            color: 'primary.main',
            fontWeight: 'bold'
          }
        }
      }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Typography component="li" variant="body1" sx={{ lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.05rem' } }}>
        {children}
      </Typography>
    ),
    blockquote: ({ children }) => (
      <Box sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        pl: 2,
        py: 1,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderRadius: '0 4px 4px 0',
        mb: 2,
        fontStyle: 'italic'
      }}>
        {children}
      </Box>
    ),
    code: ({ children, inline }) => (
      inline ? (
        <Typography component="code" sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.dark',
          px: 0.5,
          py: 0.25,
          borderRadius: 1,
          fontSize: '0.9em',
          fontFamily: 'monospace'
        }}>
          {children}
        </Typography>
      ) : (
        <Box component="pre" sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          p: 2,
          borderRadius: 2,
          overflow: 'auto',
          mb: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          '& code': {
            fontFamily: 'monospace',
            fontSize: '0.9em'
          }
        }}>
          <code>{children}</code>
        </Box>
      )
    )
  };

  // Render message based on its type
  const renderMessage = (message) => {
    switch (message.type) {
      case MESSAGE_TYPE.TEXT:
        return (
          <Box>
            {message.isProcessing ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            ) : message.sender === SENDER.BOT ? (
              // Render bot messages with markdown
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            ) : (
              // Render user messages as plain text with larger font
              <Typography variant="body1" component="div" sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            )}
          </Box>
        );

      case MESSAGE_TYPE.IMAGE:
        return (
          <Box sx={{ maxWidth: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <img
              src={message.content}
              alt="Uploaded"
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          </Box>
        );

      case MESSAGE_TYPE.MULTI_IMAGE:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {message.content.length} hình ảnh đã tải lên:
            </Typography>
            <Grid container spacing={1.5}>
              {message.content.map((url, idx) => (
                <Grid item xs={4} sm={3} md={2} key={idx}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: 100,
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      }
                    }}
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case MESSAGE_TYPE.CLASSIFICATION:
        return (
          <Box>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, color: 'primary.dark' }}>
              Tôi đã tìm thấy những loài thực vật có thể phù hợp:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {message.content.map((result, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                  onMouseEnter={(e) => handleCardMouseEnter(e, result.label)}
                  onMouseLeave={handlePopoverClose}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: 'scale(1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => handlePlantSelection(result.label, message.id)}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={getRepresentativeImagePath(result.label)}
                        alt={result.label}
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                        sx={{
                          transition: 'transform 0.6s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        p: 1.5
                      }}>
                        <Typography variant="subtitle1" component="div" sx={{ color: 'white', fontWeight: 600 }}>
                          {result.label}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ pt: 2, pb: '16px !important' }}>
                      <Typography variant="subtitle1" component="div" sx={{
                        color: 'primary.dark',
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        {getVietnameseName(result.label) ? getVietnameseName(result.label) : 'Chưa có tên tiếng Việt'}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case MESSAGE_TYPE.SELECTION:
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label={`Đã chọn: ${message.content.label}`}
            color="success"
            variant="filled"
            sx={{
              borderRadius: '20px',
              px: 1,
              fontWeight: 500,
              boxShadow: '0 3px 8px rgba(46, 125, 50, 0.2)',
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        );

      default:
        return <Typography>{message.content}</Typography>;
    }
  };

  return (
    <Box sx={{
      margin: { xs: '-16px', sm: '-24px' }, // Negative margin to break out of container
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #f8fdf8 0%, #f0f7f0 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40vh',
        background: 'linear-gradient(180deg, rgba(46, 125, 50, 0.08) 0%, rgba(46, 125, 50, 0) 100%)',
        zIndex: 0,
        pointerEvents: 'none'
      }
    }}>
      {/* Header - Directly on the background */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 6, md: 8 },
          px: { xs: 3, sm: 4, md: 6 },
          background: 'linear-gradient(120deg, #2e7d32 0%, #60ad5e 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          boxShadow: '0 4px 30px rgba(46, 125, 50, 0.2)'
        }}
      >
        {/* NEW: Back to Home Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(5px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Trang chủ
        </Button>
        <Avatar
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            width: 64,
            height: 64,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1) rotate(10deg)',
            }
          }}
        >
          <PlantIcon sx={{ fontSize: 36 }} />
        </Avatar>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>
            Trợ lý Thực vật
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Hỏi đáp về thực vật rừng Đà Nẵng - Quảng Nam
          </Typography>
        </Box>
      </Box>

      {/* Paste Hint Banner */}
      <Fade in={showPasteHint} timeout={1000}>
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            mx: { xs: 2, sm: 4 },
            mt: 2,
            p: 2,
            background: 'linear-gradient(90deg, rgba(46, 125, 50, 0.08), rgba(255, 152, 0, 0.08))',
            borderRadius: 3,
            border: '1px dashed rgba(46, 125, 50, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
          }}
        >
          <ContentPasteIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
              💡 Mẹo hữu ích: Bạn có thể dán hình ảnh trực tiếp!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhấn <Box component="span" sx={{
                px: 0.5,
                py: 0.25,
                bgcolor: 'rgba(0,0,0,0.1)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.85em'
              }}>Ctrl+V</Box> để dán hình ảnh từ clipboard
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setShowPasteHint(false)}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Fade>

      {/* Paste Indicator */}
      <Fade in={pasteIndicator} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            bgcolor: 'rgba(46, 125, 50, 0.95)',
            color: 'white',
            p: 3,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          <CircularProgress size={24} sx={{ color: 'white' }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Đang xử lý hình ảnh đã dán...
          </Typography>
        </Box>
      </Fade>

      {/* Message area - Now uses padding instead of Container for a wider feel */}
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          zIndex: 1,
          py: 4,
          px: { xs: 2, sm: 3, md: 4 }, // Use padding for horizontal spacing
          overflowY: 'auto',
          maxHeight: { xs: 'calc(100vh - 300px)', sm: 'calc(100vh - 350px)' },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message) => (
          <Fade in={true} key={message.id} timeout={600}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: message.sender === SENDER.USER ? 'row-reverse' : 'row',
                mb: 4,
                alignItems: 'flex-start',
                width: '100%'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.sender === SENDER.USER ? 'secondary.main' : 'primary.main',
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  ml: message.sender === SENDER.USER ? { xs: 1.5, sm: 2 } : 0,
                  mr: message.sender === SENDER.USER ? 0 : { xs: 1.5, sm: 2 },
                  boxShadow: message.sender === SENDER.USER
                    ? '0 4px 12px rgba(156, 39, 176, 0.2)'
                    : '0 4px 12px rgba(46, 125, 50, 0.2)',
                  transform: message.sender === SENDER.USER ? 'rotate(5deg)' : 'rotate(-5deg)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: message.sender === SENDER.USER ? 'scale(1.1) rotate(5deg)' : 'scale(1.1) rotate(-5deg)'
                  }
                }}
              >
                {message.sender === SENDER.USER ? <PersonIcon /> : <BotIcon />}
              </Avatar>

              <Box
                sx={{
                  // Adjusted maxWidth for better readability on large screens
                  maxWidth: { xs: '88%', sm: '80%', md: '75%', lg: '800px' },
                  bgcolor: message.sender === SENDER.USER
                    ? 'linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%)'
                    : 'white',
                  color: message.sender === SENDER.USER ? 'white' : 'inherit',
                  p: { xs: 2, sm: 3 },
                  borderRadius: message.sender === SENDER.USER
                    ? '20px 4px 20px 20px'
                    : '4px 20px 20px 20px',
                  boxShadow: message.sender === SENDER.USER
                    ? '0 6px 16px rgba(0,0,0,0.1)'
                    : '0 6px 16px rgba(0,0,0,0.06)',
                  background: message.sender === SENDER.USER
                    ? 'linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%)'
                    : 'white',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: message.sender === SENDER.USER
                      ? '0 8px 24px rgba(0,0,0,0.12)'
                      : '0 8px 24px rgba(0,0,0,0.09)',
                    transform: 'translateY(-2px)'
                  },
                  ...(message.isError && {
                    background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                    color: 'white',
                  })
                }}
              >
                {renderMessage(message)}

                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    mt: 1.5,
                    textAlign: message.sender === SENDER.USER ? 'right' : 'left',
                    color: message.sender === SENDER.USER ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                    fontSize: '0.7rem',
                    opacity: 0.8
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Image Previews - Adjusted to use padding */}
      {imagePreviewUrls.length > 0 && (
        <Box sx={{ mb: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{
              color: 'primary.dark',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              <ImageIcon sx={{ mr: 0.5, fontSize: 18 }} />
              {imagePreviewUrls.length} hình ảnh đã chọn
            </Typography>
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              onClick={clearAllImages}
              color="error"
              variant="outlined"
              sx={{
                borderRadius: 20,
                px: 2,
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(244, 67, 54, 0.2)'
                }
              }}
            >
              Xóa tất cả
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              gap: 1.5,
              pb: 1.5,
              pt: 0.5,
              px: 0.5,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.04)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#60ad5e',
                borderRadius: '4px',
                '&:hover': {
                  background: '#2e7d32',
                }
              }
            }}
          >
            {imagePreviewUrls.map((url, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  flexShrink: 0,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    width: 24,
                    height: 24,
                    p: 0,
                    '&:hover': {
                      bgcolor: 'rgba(244, 67, 54, 0.9)',
                      transform: 'rotate(90deg)',
                    },
                    transition: 'all 0.2s ease',
                    zIndex: 1
                  }}
                  onClick={() => removeImage(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Upload progress indicator */}
      {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ width: '100%', mb: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="primary">
              Đang tải lên: {uploadProgress}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(uploadProgress/10)}/10
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2e7d32, #60ad5e)'
              }
            }}
          />
        </Box>
      )}

      {/* Input Area - Floating at the bottom */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3, md: 4 },
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          maxWidth: '1280px', // Center and constrain input controls
          mx: 'auto'
        }}>
          <Badge
            badgeContent={imageFiles.length}
            color="primary"
            invisible={imageFiles.length === 0}
            max={99}
          >
            <IconButton
              color="primary"
              onClick={triggerFileInput}
              disabled={isLoading}
              sx={{
                boxShadow: '0 2px 10px rgba(46, 125, 50, 0.12)',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.2s ease',
                p: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.2)',
                }
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </Badge>

          <TextField
            ref={textFieldRef}
            fullWidth
            variant="outlined"
            placeholder="Nhập câu hỏi hoặc đính kèm hình ảnh... (Hoặc nhấn Ctrl+V để dán hình ảnh)"
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              sx: {
                borderRadius: 6,
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
                py: 1.5,
                px: 2,
                fontSize: '1.05rem', // Slightly larger input text
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(46, 125, 50, 0.15)',
                  transform: 'translateY(-2px)'
                },
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }
              }
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <Button
            variant="contained"
            color="primary"
            endIcon={isLoading ?
              <CircularProgress size={20} color="inherit" /> :
              <SendIcon sx={{ ml: 0.5 }} />
            }
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && imageFiles.length === 0)}
            sx={{
              borderRadius: 6,
              height: 56,
              px: { xs: 3, sm: 4 },
              minWidth: { xs: 56, sm: 120 },
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
              background: 'linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)',
              transition: 'all 0.3s ease',
              fontWeight: 600,
              letterSpacing: 0.5,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)',
                transform: 'translateY(-3px)'
              },
              '&:active': {
                boxShadow: '0 2px 10px rgba(46, 125, 50, 0.2)',
                transform: 'translateY(0)'
              }
            }}
          >
            {isMobile ? '' : 'Gửi'}
          </Button>
        </Box>
      </Box>

      {/* Classification selection dialog */}
      <Dialog
        open={showClassificationDialog}
        onClose={() => setShowClassificationDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(120deg, #2e7d32 0%, #60ad5e 100%)',
          color: 'white',
          px: 3,
          py: 2.5
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chọn loài thực vật phù hợp</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Hãy chọn loài thực vật gần nhất với hình ảnh của bạn
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {classifications.map((result, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                onMouseEnter={(e) => handleCardMouseEnter(e, result.label)}
                onMouseLeave={handlePopoverClose}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'scale(1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.03)',
                      boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                    }
                  }}
                  onClick={() => handlePlantSelection(result.label, `dialog_${Date.now()}`)}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={getRepresentativeImagePath(result.label)}
                      alt={result.label}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                      sx={{
                        transition: 'transform 0.6s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 2
                    }}>
                      <Typography variant="h6" component="div" sx={{
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {result.label}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ pt: 2, pb: '16px !important' }}>
                      <Typography variant="subtitle1" component="div" sx={{
                        color: 'primary.dark',
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        {getVietnameseName(result.label) ? getVietnameseName(result.label) : 'Chưa có tên tiếng Việt'}
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>


                      </Box>
                    </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setShowClassificationDialog(false)}
            color="primary"
            variant="outlined"
            sx={{
              borderRadius: 4,
              px: 3
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleDismissError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleDismissError}
          severity="error"
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(211, 47, 47, 0.2)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={pasteSuccess}
        autoHideDuration={2000}
        onClose={() => setPasteSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setPasteSuccess(false)}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(46, 125, 50, 0.2)'
          }}
        >
          Hình ảnh đã được dán thành công!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!pasteError}
        autoHideDuration={4000}
        onClose={() => setPasteError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setPasteError(null)}
          severity="error"
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(211, 47, 47, 0.2)'
          }}
        >
          {pasteError}
        </Alert>
      </Snackbar>

      {/* Floating background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, rgba(46, 125, 50, 0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
          display: { xs: 'none', lg: 'block' }
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '10%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 152, 0, 0.04) 0%, rgba(255, 152, 0, 0) 70%)',
          zIndex: 0,
          pointerEvents: 'none',
          display: { xs: 'none', lg: 'block' }
        }}
      />
      {/* HOVER-FEATURE: Add the Popover component here */}
    <Popover
      sx={{
        pointerEvents: 'none', // Allow mouse events to pass through to the popover content
      }}
      open={Boolean(popoverAnchorEl)}
      anchorEl={popoverAnchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      PaperProps={{
        onMouseEnter: handlePopoverEnter,
        onMouseLeave: handlePopoverClose,
        sx: {
          pointerEvents: 'auto', // Re-enable pointer events for the popover content
          ml: 2, // Add some margin from the card
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          width: 350, // Set a fixed width for the gallery
        }
      }}
      disableRestoreFocus
    >
      <PlantImageGallery
        // Pass a minimal plant object and the fetched images
        plant={{ vietnameseName: hoveredPlant, imagePath: getRepresentativeImagePath(hoveredPlant) }}
        plantImages={galleryImages}
        isLoading={galleryLoading}
      />
    </Popover>
    </Box>
  );
};

export default PlantChatbot;