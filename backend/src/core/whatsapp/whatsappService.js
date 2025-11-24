const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/whatsapp.log' }),
    new winston.transports.Console(),
  ],
});

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v17.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}`;
    this.isConfigured = this.accessToken && this.phoneNumberId;
  }

  /**
   * Send WhatsApp message using Meta Business API
   */
  async sendMessage(recipientPhone, message, templateName = null) {
    if (!this.isConfigured) {
      logger.warn('WhatsApp not configured, message not sent');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: message
        }
      };

      // If using a template
      if (templateName) {
        payload.type = 'template';
        payload.template = {
          name: templateName,
          language: {
            code: 'en_US'
          }
        };
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('WhatsApp message sent successfully', {
        recipient: recipientPhone,
        messageId: response.data.messages?.[0]?.id,
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        status: 'sent'
      };

    } catch (error) {
      logger.error('Failed to send WhatsApp message:', {
        error: error.message,
        recipient: recipientPhone,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Send invoice notification
   */
  async sendInvoiceNotification(customerPhone, invoiceData) {
    const message = this.formatInvoiceMessage(invoiceData);
    return await this.sendMessage(customerPhone, message, 'invoice_notification');
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(customerPhone, paymentData) {
    const message = this.formatPaymentReminderMessage(paymentData);
    return await this.sendMessage(customerPhone, message, 'payment_reminder');
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(customerPhone, paymentData) {
    const message = this.formatPaymentConfirmationMessage(paymentData);
    return await this.sendMessage(customerPhone, message, 'payment_confirmation');
  }

  /**
   * Send low stock alert
   */
  async sendLowStockAlert(customerPhone, stockData) {
    const message = this.formatLowStockMessage(stockData);
    return await this.sendMessage(customerPhone, message, 'low_stock_alert');
  }

  /**
   * Send business insight notification
   */
  async sendBusinessInsight(phoneNumber, insightData) {
    const message = this.formatBusinessInsightMessage(insightData);
    return await this.sendMessage(phoneNumber, message);
  }

  /**
   * Format invoice message
   */
  formatInvoiceMessage(invoiceData) {
    const { customerName, items, total, invoiceNumber, dueDate } = invoiceData;
    
    let message = `🧾 *Invoice Notification*\n\n`;
    message += `Dear ${customerName},\n\n`;
    message += `Thank you for your purchase! Here are the details:\n\n`;
    
    items.forEach(item => {
      message += `• ${item.name} - ${item.quantity} x Rs ${item.price} = Rs ${item.total}\n`;
    });
    
    message += `\n📊 *Invoice Total: Rs ${total.toLocaleString()}*\n`;
    message += `📄 Invoice #: ${invoiceNumber}\n`;
    
    if (dueDate) {
      message += `📅 Due Date: ${new Date(dueDate).toDateString()}\n`;
    }
    
    message += `\n💡 Thank you for shopping with us!\n`;
    message += `For any queries, please contact us.`;

    return message;
  }

  /**
   * Format payment reminder message
   */
  formatPaymentReminderMessage(paymentData) {
    const { customerName, outstandingAmount, dueDate, invoiceNumber } = paymentData;
    
    let message = `🔔 *Payment Reminder*\n\n`;
    message += `Dear ${customerName},\n\n`;
    message += `This is a friendly reminder that payment is due.\n\n`;
    message += `💰 *Outstanding Amount: Rs ${outstandingAmount.toLocaleString()}*\n`;
    
    if (invoiceNumber) {
      message += `📄 Invoice #: ${invoiceNumber}\n`;
    }
    
    if (dueDate) {
      message += `📅 Due Date: ${new Date(dueDate).toDateString()}\n`;
    }
    
    message += `\n🙏 Please arrange payment at your earliest convenience.\n`;
    message += `Thank you for your business!`;

    return message;
  }

  /**
   * Format payment confirmation message
   */
  formatPaymentConfirmationMessage(paymentData) {
    const { customerName, amount, paymentMethod, paymentDate, referenceNumber } = paymentData;
    
    let message = `✅ *Payment Confirmation*\n\n`;
    message += `Dear ${customerName},\n\n`;
    message += `We have received your payment successfully.\n\n`;
    message += `💰 *Amount: Rs ${amount.toLocaleString()}*\n`;
    message += `💳 *Method: ${paymentMethod}*\n`;
    
    if (paymentDate) {
      message += `📅 *Date: ${new Date(paymentDate).toDateString()}*\n`;
    }
    
    if (referenceNumber) {
      message += `🆔 *Reference: ${referenceNumber}*\n`;
    }
    
    message += `\n🙏 Thank you for your prompt payment!\n`;
    message += `We appreciate your business.`;

    return message;
  }

  /**
   * Format low stock message
   */
  formatLowStockMessage(stockData) {
    const { businessName, lowStockItems, minLevels } = stockData;
    
    let message = `⚠️ *Low Stock Alert*\n\n`;
    message += `Business: ${businessName}\n\n`;
    message += `The following items are running low:\n\n`;
    
    lowStockItems.forEach(item => {
      const currentStock = item.currentStock;
      const minLevel = minLevels[item.itemId] || 10;
      message += `📦 ${item.name}\n`;
      message += `   Current: ${currentStock} | Min: ${minLevel}\n`;
    });
    
    message += `\n💡 Consider restocking these items soon.\n`;
    message += `This alert was generated by AI based on your sales patterns.`;

    return message;
  }

  /**
   * Format business insight message
   */
  formatBusinessInsightMessage(insightData) {
    const { businessName, insights, priority } = insightData;
    
    let message = `🧠 *AI Business Insights*\n\n`;
    message += `Business: ${businessName}\n`;
    message += `Priority: ${priority.toUpperCase()}\n\n`;
    
    insights.forEach((insight, index) => {
      message += `${index + 1}. *${insight.title}*\n`;
      message += `${insight.description}\n\n`;
    });
    
    message += `💡 These insights are generated by our AI system based on your business data.`;
    
    return message;
  }

  /**
   * Send bulk messages (for campaigns)
   */
  async sendBulkMessages(recipients, message, templateName = null) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendMessage(recipient.phone, message, templateName);
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        ...result
      });
      
      // Add delay to avoid rate limiting
      await this.delay(1000);
    }
    
    return results;
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId) {
    if (!this.isConfigured) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const url = `${this.base_URL}/${messageId}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };

    } catch (error) {
      logger.error('Failed to get message status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if WhatsApp service is configured and working
   */
  async checkHealth() {
    if (!this.isConfigured) {
      return {
        configured: false,
        error: 'WhatsApp not configured'
      };
    }

    try {
      // Try to get phone number info
      const url = `${this.baseURL}/${this.phoneNumberId}`;
      await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return {
        configured: true,
        status: 'healthy',
        error: null
      };

    } catch (error) {
      logger.error('WhatsApp health check failed:', error);
      return {
        configured: true,
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Format phone number (add country code if needed)
   */
  formatPhoneNumber(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add Pakistan country code if not present
    if (digits.startsWith('92')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return '92' + digits.substring(1);
    } else {
      return '92' + digits;
    }
  }
}

module.exports = new WhatsAppService();